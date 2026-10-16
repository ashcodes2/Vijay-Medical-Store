const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { sendOrderConfirmationSMS, sendOwnerAlertSMS } = require('../utils/smsService');
const { generateTrackingToken, hashTrackingToken } = require('../utils/tokenService');

/**
 * Computes a deterministic canonical SHA-256 fingerprint of the order payload
 * to detect if an idempotency key is reused with a different payload.
 */
const computePayloadFingerprint = (body = {}) => {
  const items = Array.isArray(body.items) ? body.items : [];
  const normalizedItems = items
    .map((it) => ({
      product: String(it.product || it.productId || it._id || it.id || '').trim(),
      quantity: Number(it.quantity) || 1,
    }))
    .sort((a, b) => a.product.localeCompare(b.product));

  const canonicalObj = {
    customerName: String(body.customerName || body.fullName || body.name || '').trim().toLowerCase(),
    phone: String(body.phone || body.mobileNumber || '').replace(/[\s-]/g, '').slice(-10),
    address: String(body.address || body.deliveryAddress || '').trim().toLowerCase(),
    items: normalizedItems,
  };

  return crypto.createHash('sha256').update(JSON.stringify(canonicalObj)).digest('hex');
};

// POST /api/orders — Guest checkout with atomic stock reservation, idempotency, and secure tracking token
const createOrder = async (req, res, next) => {
  const decrementedProducts = [];
  let session = null;

  try {
    const {
      customerName,
      name,
      phone,
      mobileNumber,
      address,
      deliveryAddress,
      items,
      idempotencyKey: bodyKey,
    } = req.body || {};

    // Idempotency Key from header or body
    const headerKey = req.headers ? req.headers['idempotency-key'] : null;
    const rawKey = headerKey || bodyKey;
    const cleanIdempotencyKey = typeof rawKey === 'string' && rawKey.trim().length > 0
      ? rawKey.trim()
      : null;

    const payloadHash = cleanIdempotencyKey ? computePayloadFingerprint(req.body) : null;

    // Idempotency check: if an order with this key already exists, verify payload fingerprint
    if (cleanIdempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey: cleanIdempotencyKey });
      if (existingOrder) {
        // If an existing order has a recorded payload hash and it differs from current payload, reject with 422
        if (existingOrder.idempotencyPayloadHash && existingOrder.idempotencyPayloadHash !== payloadHash) {
          return res.status(422).json({
            success: false,
            message: 'Idempotency key was previously used with a different request payload.',
          });
        }

        return res.status(200).json({
          success: true,
          isIdempotentReplay: true,
          orderId: existingOrder._id,
          shortId: existingOrder.shortId || String(existingOrder._id).slice(-6).toUpperCase(),
          orderReference: `#VMS-${existingOrder.shortId || String(existingOrder._id).slice(-6).toUpperCase()}`,
          totalAmount: existingOrder.totalAmount,
          customerName: existingOrder.customerName,
          status: existingOrder.status,
          order: {
            shortId: existingOrder.shortId || String(existingOrder._id).slice(-6).toUpperCase(),
            orderReference: `#VMS-${existingOrder.shortId || String(existingOrder._id).slice(-6).toUpperCase()}`,
            customerName: existingOrder.customerName,
            totalAmount: existingOrder.totalAmount,
            status: existingOrder.status,
            createdAt: existingOrder.createdAt,
          },
        });
      }
    }

    // Normalize customer fields
    const resolvedName = String(customerName || name || '').trim();
    const rawPhone = String(phone || mobileNumber || '');
    const cleanPhone = rawPhone.replace(/[\s-]/g, '').replace(/^\+?91/, '').slice(-10);
    const resolvedAddress = String(address || deliveryAddress || '').trim();

    // Input validation guards
    if (!resolvedName || resolvedName.length < 2) {
      return res.status(400).json({ success: false, message: 'Valid customer name is required (at least 2 characters)' });
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian mobile number' });
    }
    if (!resolvedAddress || resolvedAddress.length < 5) {
      return res.status(400).json({ success: false, message: 'Valid delivery address is required (at least 5 characters)' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Step 1: Validate every requested item against current MongoDB catalog
    const validatedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for "${item.name || 'item'}". Must be an integer greater than 0.`,
        });
      }

      // Lookup product by ID first, then fallback to name
      let product = null;
      const rawId = item.product || item._id || item.id || item.productId;
      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        product = await Product.findById(rawId);
      }
      if (!product && item.name) {
        product = await Product.findOne({ name: item.name.trim() });
      }

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || rawId || 'Unknown'}" was not found in our catalog.`,
        });
      }

      // Check if product is active
      if (product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" is currently unavailable or inactive in our store.`,
        });
      }

      // Validate stock availability
      if (product.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" is currently out of stock.`,
        });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}.`,
        });
      }

      // Server-authoritative item snapshot: NEVER trust client price
      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price: product.price,
      });
    }

    // Step 2: Calculate server-authoritative financials
    const subtotal = validatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const gst = Number((subtotal * 0.12).toFixed(2));
    const deliveryFee = subtotal > 0 ? 20 : 0;
    const verifiedTotal = Number((subtotal + gst + deliveryFee).toFixed(2));

    // Step 3: Generate cryptographically secure tracking token (256-bit entropy)
    // Only the SHA-256 hash will be stored in MongoDB. The raw token is returned ONCE to the user.
    const { rawToken, tokenHash } = generateTrackingToken();

    // Step 4: Atomic Stock Reservation & Order Creation
    const supportsTransactions = !!mongoose.connection.client?.topology?.description?.setName;
    let order;

    if (supportsTransactions) {
      // ── Path A: Multi-document Transaction (MongoDB ReplicaSet / Atlas) ──
      session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Decrement stock for each product within the transaction
        for (const it of validatedItems) {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: it.product, stock: { $gte: it.quantity }, isActive: { $ne: false } },
            { $inc: { stock: -it.quantity } },
            { session, new: true }
          );

          if (!updatedProduct) {
            await session.abortTransaction();
            session.endSession();
            session = null;
            return res.status(400).json({
              success: false,
              message: `Could not reserve stock for "${it.name}". Inventory was modified by a concurrent order. Please refresh and try again.`,
            });
          }
        }

        // Create Order document within the transaction
        const [createdOrder] = await Order.create(
          [{
            customerName: resolvedName,
            phone: cleanPhone,
            address: resolvedAddress,
            items: validatedItems,
            subtotal,
            gst,
            deliveryFee,
            totalAmount: verifiedTotal,
            status: 'pending',
            idempotencyKey: cleanIdempotencyKey || undefined,
            idempotencyPayloadHash: payloadHash || undefined,
            trackingTokenHash: tokenHash,
            statusHistory: [
              {
                status: 'pending',
                changedAt: new Date(),
                note: 'Order placed by customer (Guest Checkout)',
              },
            ],
          }],
          { session }
        );

        // Assign computed short ID
        createdOrder.shortId = String(createdOrder._id).slice(-6).toUpperCase();
        await createdOrder.save({ session });

        await session.commitTransaction();
        session.endSession();
        session = null;

        order = createdOrder;
      } catch (txnError) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
          session = null;
        }
        throw txnError;
      }
    } else {
      // ── Path B: Atomic findOneAndUpdate with Compensation Rollback (Standalone fallback) ──
      for (const it of validatedItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: it.product, stock: { $gte: it.quantity }, isActive: { $ne: false } },
          { $inc: { stock: -it.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          // Concurrency conflict: roll back previously decremented products
          for (const dec of decrementedProducts) {
            await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
          }
          return res.status(400).json({
            success: false,
            message: `Could not reserve stock for "${it.name}". Inventory was modified by a concurrent order. Please refresh and try again.`,
          });
        }

        decrementedProducts.push({ productId: it.product, quantity: it.quantity });
      }

      // Create Order
      try {
        order = await Order.create({
          customerName: resolvedName,
          phone: cleanPhone,
          address: resolvedAddress,
          items: validatedItems,
          subtotal,
          gst,
          deliveryFee,
          totalAmount: verifiedTotal,
          status: 'pending',
          idempotencyKey: cleanIdempotencyKey || undefined,
          idempotencyPayloadHash: payloadHash || undefined,
          trackingTokenHash: tokenHash,
          statusHistory: [
            {
              status: 'pending',
              changedAt: new Date(),
              note: 'Order placed by customer (Guest Checkout)',
            },
          ],
        });

        order.shortId = String(order._id).slice(-6).toUpperCase();
        await order.save();
      } catch (createErr) {
        // Rollback all stock decrements on failure
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
        }
        throw createErr;
      }
    }

    // Step 5: Dispatches SMS notifications (non-blocking)
    sendOrderConfirmationSMS(order).catch((err) => console.error('[SMS] Customer SMS failed:', err.message));
    sendOwnerAlertSMS(order).catch((err) => console.error('[SMS] Owner SMS failed:', err.message));

    // Step 6: Return response containing raw token (returned ONCE only) and tracking route
    const responseShortId = order.shortId || String(order._id).slice(-6).toUpperCase();
    const trackingUrl = `/#track/${rawToken}`;

    return res.status(201).json({
      success: true,
      orderId: order._id,
      shortId: responseShortId,
      orderReference: `#VMS-${responseShortId}`,
      totalAmount: order.totalAmount,
      customerName: order.customerName,
      status: order.status,
      // The raw tracking token is returned ONLY now on successful order creation
      trackingToken: rawToken,
      trackingUrl,
      order: {
        shortId: responseShortId,
        orderReference: `#VMS-${responseShortId}`,
        customerName: order.customerName,
        phone: `******${order.phone.slice(-4)}`,
        items: order.items,
        subtotal: order.subtotal,
        gst: order.gst,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        trackingUrl,
        trackingToken: rawToken,
      },
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (_) {}
    }

    // Rollback for Path B if session was not used
    for (const dec of decrementedProducts) {
      try {
        await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
      } catch (_) {}
    }

    // Handle duplicate key error for idempotencyKey cleanly
    if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
      return res.status(409).json({
        success: false,
        message: 'A duplicate order with this idempotency key was submitted concurrently.',
      });
    }

    next(error);
  }
};

// GET /api/orders/track/:token — Secure public order tracking by raw token
// Raw token is NEVER logged and NEVER stored in plaintext in the database.
const trackOrderByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Validate and hash the token using SHA-256
    const tokenHash = hashTrackingToken(token);
    if (!tokenHash) {
      // Safe generic 404 response — do not reveal token formatting clues
      return res.status(404).json({
        success: false,
        message: 'Order not found or tracking link is invalid.',
      });
    }

    // Query database using the cryptographic hash ONLY
    const order = await Order.findOne({ trackingTokenHash: tokenHash }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or tracking link is invalid.',
      });
    }

    // Extract first name only and mask phone number
    const customerFirstName = String(order.customerName || 'Customer').split(' ')[0];
    const maskedPhone = order.phone ? `******${String(order.phone).slice(-4)}` : '';

    // Sanitize item summaries (strip internal MongoDB subdocument IDs)
    const sanitizedItems = (order.items || []).map((it) => ({
      name: it.name,
      quantity: it.quantity,
      price: it.price,
      itemTotal: Number((it.price * it.quantity).toFixed(2)),
    }));

    // Ensure status history is formatted chronologically with authorized actor
    const history = (order.statusHistory || []).map((h) => ({
      status: h.status,
      timestamp: h.changedAt,
      note: h.note || '',
      actor: h.actor || 'Store Pharmacist',
    }));

    // If history is empty, synthesize baseline from order record
    if (history.length === 0) {
      history.push({
        status: order.status || 'pending',
        timestamp: order.createdAt,
        note: 'Order placed by customer (Guest Checkout)',
        actor: 'Customer',
      });
    }

    const shortId = order.shortId || String(order._id).slice(-6).toUpperCase();

    // Safe sanitized response: NO internal database IDs, NO full phone, NO street address, NO hashes
    return res.json({
      success: true,
      order: {
        orderReference: `#VMS-${shortId}`,
        shortId,
        createdAt: order.createdAt,
        currentStatus: order.status,
        statusHistory: history,
        items: sanitizedItems,
        subtotal: order.subtotal || 0,
        gst: order.gst || 0,
        deliveryFee: order.deliveryFee || 0,
        totalAmount: order.totalAmount,
        paymentMethod: 'Cash on Delivery (Pay after inspection)',
        recipient: {
          firstName: customerFirstName,
          maskedPhone,
          deliveryCity: 'Gorakhpur, Uttar Pradesh',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders — list all orders (admin only, newest first)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// State machine: allowed forward transitions between order statuses
const ALLOWED_ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Terminal state: cannot change once delivered
  cancelled: [], // Terminal state: cannot change once cancelled
};

// PUT /api/orders/:id/status — admin updates order status
// Strictly validates state transitions, saves timestamp and authorized admin actor,
// and atomically restores inventory if order is cancelled without concurrency races.
const updateOrderStatus = async (req, res, next) => {
  let session = null;
  try {
    const { status, note: userNote } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Determine authorized actor from authenticated admin JWT
    const actorName = req.admin?.username || req.admin?.email || 'Store Admin';
    const actorId = req.admin?._id;

    // Check which preceding statuses are valid for the requested target status
    const allowedPreviousStatuses = Object.keys(ALLOWED_ORDER_TRANSITIONS).filter((prev) =>
      ALLOWED_ORDER_TRANSITIONS[prev].includes(status)
    );

    const transitionNote =
      userNote?.trim() || `Status updated to ${status} by ${actorName}`;

    const historyEntry = {
      status,
      changedAt: new Date(),
      note: transitionNote,
      actor: actorName,
      actorId,
    };

    const supportsTransactions = !!mongoose.connection.client?.topology?.description?.setName;

    if (supportsTransactions) {
      // ── Path A: Multi-document Transaction (MongoDB ReplicaSet / Atlas) ──
      session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Atomic conditional transition: only matches if status is in allowedPreviousStatuses
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId, status: { $in: allowedPreviousStatuses } },
          {
            $set: { status },
            $push: { statusHistory: historyEntry },
          },
          { session, new: true }
        );

        if (!updatedOrder) {
          await session.abortTransaction();
          session.endSession();
          session = null;

          // Check current state outside transaction to determine if idempotent replay or invalid
          const existing = await Order.findById(orderId);
          if (!existing) {
            return res.status(404).json({ success: false, message: 'Order not found' });
          }
          if (existing.status === status) {
            // Idempotent replay: already at target status, do not re-apply side effects
            return res.json(existing);
          }
          return res.status(400).json({
            success: false,
            message: `Invalid order status transition from "${existing.status}" to "${status}". Allowed next transitions from "${existing.status}": ${
              (ALLOWED_ORDER_TRANSITIONS[existing.status] || []).join(', ') || 'None (order is in terminal state)'
            }.`,
          });
        }

        // Atomically restore inventory within the same transaction if cancelled
        if (status === 'cancelled') {
          for (const it of updatedOrder.items || []) {
            if (it.product && it.quantity > 0) {
              await Product.findByIdAndUpdate(
                it.product,
                { $inc: { stock: it.quantity } },
                { session }
              );
            }
          }
        }

        await session.commitTransaction();
        session.endSession();
        session = null;

        return res.json(updatedOrder);
      } catch (txnErr) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
          session = null;
        }
        throw txnErr;
      }
    } else {
      // ── Path B: Standalone MongoDB Fallback ──
      // MongoDB single-document write lock ensures only ONE concurrent request can match
      // the allowedPreviousStatuses condition and transition the document.
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, status: { $in: allowedPreviousStatuses } },
        {
          $set: { status },
          $push: { statusHistory: historyEntry },
        },
        { new: true }
      );

      if (!updatedOrder) {
        const existing = await Order.findById(orderId);
        if (!existing) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (existing.status === status) {
          // Idempotent replay: already at target status, do not re-apply side effects
          return res.json(existing);
        }
        return res.status(400).json({
          success: false,
          message: `Invalid order status transition from "${existing.status}" to "${status}". Allowed next transitions from "${existing.status}": ${
            (ALLOWED_ORDER_TRANSITIONS[existing.status] || []).join(', ') || 'None (order is in terminal state)'
          }.`,
        });
      }

      // Only the sole winning request transitions status and restores stock
      if (status === 'cancelled') {
        for (const it of updatedOrder.items || []) {
          if (it.product && it.quantity > 0) {
            try {
              await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.quantity } });
            } catch (err) {
              console.error(`Failed to replenish stock for product ${it.product} on cancellation:`, err);
            }
          }
        }
      }

      return res.json(updatedOrder);
    }
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (_) {}
    }
    next(error);
  }
};

module.exports = {
  createOrder,
  trackOrderByToken,
  getAllOrders,
  updateOrderStatus,
};
