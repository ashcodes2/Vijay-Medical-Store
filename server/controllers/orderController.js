const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// POST /api/orders — customer places a new order with complete stock validation
const createOrder = async (req, res, next) => {
  const decrementedProducts = [];
  try {
    const { customerName, phone, address, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    const validatedItems = [];

    // Step 1: Validate every item against actual MongoDB Product data
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
      const rawId = item.product || item._id || item.id;
      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        product = await Product.findById(rawId);
      }
      if (!product && item.name) {
        product = await Product.findOne({ name: item.name.trim() });
      }

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || 'Unknown'}" was not found in our catalog.`,
        });
      }

      // Validate stock
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

      // Never trust client price — use database price
      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price: product.price,
      });
    }

    // Calculate verified total amounts
    const subtotal = validatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const gst = subtotal * 0.12;
    const delivery = subtotal > 0 ? 20 : 0;
    const verifiedTotal = Number((subtotal + gst + delivery).toFixed(2));

    // Step 2: Atomically decrement stock for each product
    for (const it of validatedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: it.product, stock: { $gte: it.quantity } },
        { $inc: { stock: -it.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        // Concurrency conflict: someone bought the remaining stock in between
        // Roll back previously decremented products
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
        }
        return res.status(400).json({
          success: false,
          message: `Could not reserve stock for "${it.name}". Please refresh and try again.`,
        });
      }

      decrementedProducts.push({ productId: it.product, quantity: it.quantity });
    }

    // Step 3: Create the Order document in MongoDB
    let order;
    try {
      order = await Order.create({
        customerName,
        phone,
        address,
        items: validatedItems,
        totalAmount: verifiedTotal,
        status: 'pending',
      });
    } catch (createErr) {
      // If order creation failed, rollback all stock decrements!
      for (const dec of decrementedProducts) {
        await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
      }
      throw createErr;
    }

    res.status(201).json(order);
  } catch (error) {
    // If any unexpected error occurred, rollback any decrements
    for (const dec of decrementedProducts) {
      try {
        await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
      } catch (_) {}
    }
    next(error);
  }
};

// GET /api/orders — list all orders (newest first)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status — admin updates order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
};
