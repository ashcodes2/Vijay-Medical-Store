const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { updateOrderStatus } = require('../controllers/orderController');

describe('Order Cancellation Concurrency & Atomicity Regression Tests', () => {
  const origOrderFindOneAndUpdate = Order.findOneAndUpdate;
  const origOrderFindById = Order.findById;
  const origProductFindByIdAndUpdate = Product.findByIdAndUpdate;

  afterEach(() => {
    Order.findOneAndUpdate = origOrderFindOneAndUpdate;
    Order.findById = origOrderFindById;
    Product.findByIdAndUpdate = origProductFindByIdAndUpdate;
  });

  test('Concurrent cancellation requests: inventory restored exactly once, no double replenishment', async () => {
    const orderId = new mongoose.Types.ObjectId().toString();
    const productId = new mongoose.Types.ObjectId().toString();

    // In-memory simulated database state for the isolated test
    let orderDoc = {
      _id: orderId,
      status: 'pending',
      items: [{ product: productId, quantity: 3, name: 'Paracetamol' }],
      statusHistory: [],
    };

    let productStock = 10;
    let stockReplenishCount = 0;
    let findOneAndUpdateCallCount = 0;

    // Simulate atomic single-document write lock of MongoDB
    // Only the first call matching status in allowedPreviousStatuses will succeed.
    Order.findOneAndUpdate = async (filter, update) => {
      findOneAndUpdateCallCount++;
      // Simulate network / processing jitter
      await new Promise((r) => setTimeout(r, 10));

      const allowedStatuses = filter.status?.$in || [];
      if (allowedStatuses.includes(orderDoc.status)) {
        // Atomic transition succeeds
        orderDoc = {
          ...orderDoc,
          status: update.$set.status,
          statusHistory: [...orderDoc.statusHistory, update.$push.statusHistory],
        };
        return orderDoc;
      }
      // Status already transitioned or doesn't match
      return null;
    };

    Order.findById = async (id) => {
      return orderDoc;
    };

    Product.findByIdAndUpdate = async (id, update) => {
      if (update.$inc?.stock) {
        stockReplenishCount++;
        productStock += update.$inc.stock;
      }
      return { _id: id, stock: productStock };
    };

    // Prepare two concurrent cancellation requests for the exact same order
    const makeReq = () => ({
      params: { id: orderId },
      body: { status: 'cancelled', note: 'Customer cancelled' },
      admin: { username: 'test-admin', _id: new mongoose.Types.ObjectId() },
    });

    const results = [];
    const errors = [];

    const sendRequest = async () => {
      return new Promise((resolve) => {
        const req = makeReq();
        const res = {
          status: (code) => ({
            json: (data) => resolve({ status: code, data }),
          }),
          json: (data) => resolve({ status: 200, data }),
        };
        const next = (err) => resolve({ status: 500, error: err });
        updateOrderStatus(req, res, next);
      });
    };

    // Fire both requests concurrently in parallel
    const [res1, res2] = await Promise.all([sendRequest(), sendRequest()]);

    // Both requests must complete successfully (200 OK)
    assert.equal(res1.status, 200, 'Request 1 must succeed with 200');
    assert.equal(res2.status, 200, 'Request 2 must succeed with 200');

    // Both must report order status as cancelled
    assert.equal(res1.data.status, 'cancelled');
    assert.equal(res2.data.status, 'cancelled');

    // CRITICAL: Stock replenishment must be called EXACTLY ONCE
    assert.equal(stockReplenishCount, 1, 'Stock must only be replenished once across concurrent requests');
    assert.equal(productStock, 13, 'Stock must only increase by 3 (from 10 to 13), not 16');

    // CRITICAL: Status history must have recorded cancellation only once
    assert.equal(orderDoc.statusHistory.length, 1, 'Cancellation entry must only be added once');
    assert.equal(orderDoc.statusHistory[0].status, 'cancelled');
  });

  test('Repeated cancellation request (subsequent retry) does not increment stock again', async () => {
    const orderId = new mongoose.Types.ObjectId().toString();
    const productId = new mongoose.Types.ObjectId().toString();

    let orderDoc = {
      _id: orderId,
      status: 'cancelled', // Already cancelled
      items: [{ product: productId, quantity: 2, name: 'Amoxicillin' }],
      statusHistory: [{ status: 'cancelled', changedAt: new Date() }],
    };

    let replenishCalls = 0;

    Order.findOneAndUpdate = async (filter) => {
      const allowedStatuses = filter.status?.$in || [];
      if (allowedStatuses.includes(orderDoc.status)) {
        return orderDoc;
      }
      return null;
    };

    Order.findById = async () => orderDoc;

    Product.findByIdAndUpdate = async () => {
      replenishCalls++;
    };

    const req = {
      params: { id: orderId },
      body: { status: 'cancelled' },
      admin: { username: 'test-admin' },
    };

    const response = await new Promise((resolve) => {
      const res = {
        status: (code) => ({ json: (data) => resolve({ status: code, data }) }),
        json: (data) => resolve({ status: 200, data }),
      };
      updateOrderStatus(req, res, (err) => resolve({ status: 500, error: err }));
    });

    assert.equal(response.status, 200);
    assert.equal(response.data.status, 'cancelled');
    assert.equal(replenishCalls, 0, 'Subsequent cancellation must not replenish inventory');
  });

  test('Invalid transition to cancelled from terminal state (delivered) is rejected with 400', async () => {
    const orderId = new mongoose.Types.ObjectId().toString();

    const orderDoc = {
      _id: orderId,
      status: 'delivered', // Terminal state: cannot transition to cancelled
      items: [],
      statusHistory: [],
    };

    Order.findOneAndUpdate = async (filter) => {
      const allowed = filter.status?.$in || [];
      // 'delivered' is not in ['pending', 'confirmed', 'shipped']
      return allowed.includes(orderDoc.status) ? orderDoc : null;
    };

    Order.findById = async () => orderDoc;

    const req = {
      params: { id: orderId },
      body: { status: 'cancelled' },
      admin: { username: 'test-admin' },
    };

    const response = await new Promise((resolve) => {
      const res = {
        status: (code) => ({ json: (data) => resolve({ status: code, data }) }),
        json: (data) => resolve({ status: 200, data }),
      };
      updateOrderStatus(req, res, (err) => resolve({ status: 500, error: err }));
    });

    assert.equal(response.status, 400);
    assert.equal(response.data.success, false);
    assert.match(response.data.message, /Invalid order status transition from "delivered" to "cancelled"/);
  });
});
