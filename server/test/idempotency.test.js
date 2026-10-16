const { test, describe, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createOrder } = require('../controllers/orderController');

describe('Idempotency & Payload Fingerprint Regression Tests', () => {
  const origFindOne = Order.findOne;
  const origFindById = Product.findById;
  const origCreate = Order.create;

  afterEach(() => {
    Order.findOne = origFindOne;
    Product.findById = origFindById;
    Order.create = origCreate;
  });

  test('Same idempotency key with identical payload returns safe idempotent replay (200 OK)', async () => {
    const key = 'idem-key-test-123';
    const prodId = new mongoose.Types.ObjectId().toString();

    const canonicalObj = {
      customerName: 'aarav sharma',
      phone: '9876543210',
      address: '123 civil lines, gorakhpur',
      items: [{ product: prodId, quantity: 1 }],
    };
    const expectedHash = crypto.createHash('sha256').update(JSON.stringify(canonicalObj)).digest('hex');

    Order.findOne = async () => ({
      _id: new mongoose.Types.ObjectId(),
      shortId: 'ABC123',
      customerName: 'Aarav Sharma',
      totalAmount: 150,
      status: 'pending',
      idempotencyPayloadHash: expectedHash,
    });

    const req = {
      headers: { 'idempotency-key': key },
      body: {
        customerName: 'Aarav Sharma',
        phone: '9876543210',
        address: '123 Civil Lines, Gorakhpur',
        items: [{ product: prodId, quantity: 1, price: 150 }],
      },
    };

    let responseData = null;
    let statusCode = 200;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
          },
        };
      },
      json: (data) => {
        responseData = data;
      },
    };

    await createOrder(req, res, () => {});

    assert.equal(statusCode, 200);
    assert.equal(responseData.success, true);
    assert.equal(responseData.isIdempotentReplay, true);
    assert.equal(responseData.shortId, 'ABC123');
  });

  test('Same idempotency key with a DIFFERENT payload returns HTTP 422 Unprocessable Entity', async () => {
    const key = 'idem-key-test-mismatch';
    const prodId1 = new mongoose.Types.ObjectId().toString();
    const prodId2 = new mongoose.Types.ObjectId().toString();

    const originalCanonicalObj = {
      customerName: 'aarav sharma',
      phone: '9876543210',
      address: '123 civil lines, gorakhpur',
      items: [{ product: prodId1, quantity: 1 }],
    };
    const originalHash = crypto.createHash('sha256').update(JSON.stringify(originalCanonicalObj)).digest('hex');

    Order.findOne = async () => ({
      _id: new mongoose.Types.ObjectId(),
      shortId: 'ORIG01',
      customerName: 'Aarav Sharma',
      totalAmount: 150,
      status: 'pending',
      idempotencyPayloadHash: originalHash,
    });

    // Submitting with different item / quantity
    const req = {
      headers: { 'idempotency-key': key },
      body: {
        customerName: 'Aarav Sharma',
        phone: '9876543210',
        address: '123 Civil Lines, Gorakhpur',
        items: [{ product: prodId2, quantity: 5, price: 500 }],
      },
    };

    let responseData = null;
    let statusCode = 200;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
          },
        };
      },
      json: (data) => {
        responseData = data;
      },
    };

    await createOrder(req, res, () => {});

    assert.equal(statusCode, 422, 'Should reject mismatched payload for same key with 422');
    assert.equal(responseData.success, false);
    assert.match(responseData.message, /different request payload/i);
  });
});
