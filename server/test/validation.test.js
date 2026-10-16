const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { validateOrder, validateOrderStatus, validateAdminLogin } = require('../middleware/validators');

// Helper to simulate request through Express middleware
const runMiddleware = (middlewareList, reqBody, headers = {}) => {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.json());

    const handlers = Array.isArray(middlewareList) ? middlewareList : [middlewareList];
    app.post('/test', ...handlers, (req, res) => {
      res.status(200).json({ success: true, body: req.body });
    });

    const server = app.listen(0, async () => {
      const port = server.address().port;
      try {
        const response = await fetch(`http://127.0.0.1:${port}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(reqBody),
        });
        const status = response.status;
        const data = await response.json();
        server.close();
        resolve({ status, data });
      } catch (err) {
        server.close();
        resolve({ status: 500, error: err });
      }
    });
  });
};

describe('Order Validation Middleware', () => {
  test('Valid order payload passes validation', async () => {
    const validPayload = {
      customerName: 'Aarav Sharma',
      phone: '9876543210',
      address: '123 Medical Enclave, Civil Lines, Gorakhpur',
      items: [
        { product: '60d5ecb8b5c9c62b3c8f1111', quantity: 2, price: 150 },
      ],
      totalAmount: 356,
    };

    const res = await runMiddleware(validateOrder, validPayload);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
  });

  test('Rejects missing or empty customer name', async () => {
    const payload = {
      customerName: '',
      phone: '9876543210',
      address: '123 Medical Enclave, Civil Lines, Gorakhpur',
      items: [{ product: '60d5ecb8b5c9c62b3c8f1111', quantity: 1 }],
    };

    const res = await runMiddleware(validateOrder, payload);
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Customer name is required/i);
  });

  test('Rejects invalid phone number format (less than 10 digits or invalid prefix)', async () => {
    const invalidPhones = ['12345', '1234567890', 'abcdefghij', '0000000000'];

    for (const phone of invalidPhones) {
      const payload = {
        customerName: 'Aarav Sharma',
        phone,
        address: '123 Medical Enclave, Civil Lines, Gorakhpur',
        items: [{ product: '60d5ecb8b5c9c62b3c8f1111', quantity: 1 }],
      };

      const res = await runMiddleware(validateOrder, payload);
      assert.equal(res.status, 400, `Phone "${phone}" should have failed validation`);
      assert.equal(res.data.success, false);
    }
  });

  test('Accepts valid 10-digit Indian mobile number with +91 or spaces', async () => {
    const validPhones = ['+919876543210', '91 9876543210', '98765-43210'];

    for (const phone of validPhones) {
      const payload = {
        customerName: 'Aarav Sharma',
        phone,
        address: '123 Medical Enclave, Civil Lines, Gorakhpur',
        items: [{ product: '60d5ecb8b5c9c62b3c8f1111', quantity: 1 }],
      };

      const res = await runMiddleware(validateOrder, payload);
      assert.equal(res.status, 200, `Phone "${phone}" should have been accepted and sanitized`);
      assert.equal(res.data.success, true);
    }
  });

  test('Rejects short delivery address (< 5 characters)', async () => {
    const payload = {
      customerName: 'Aarav Sharma',
      phone: '9876543210',
      address: 'Shop',
      items: [{ product: '60d5ecb8b5c9c62b3c8f1111', quantity: 1 }],
    };

    const res = await runMiddleware(validateOrder, payload);
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Address must be at least 5 characters/i);
  });

  test('Rejects empty items array', async () => {
    const payload = {
      customerName: 'Aarav Sharma',
      phone: '9876543210',
      address: '123 Medical Enclave, Civil Lines, Gorakhpur',
      items: [],
    };

    const res = await runMiddleware(validateOrder, payload);
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Order must contain at least one item/i);
  });
});

describe('Order Status Transition Validation', () => {
  test('Accepts valid status values', async () => {
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    for (const status of validStatuses) {
      const res = await runMiddleware(validateOrderStatus, { status });
      assert.equal(res.status, 200);
    }
  });

  test('Rejects invalid status string', async () => {
    const res = await runMiddleware(validateOrderStatus, { status: 'refunded_unknown' });
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Status must be one of/i);
  });
});
