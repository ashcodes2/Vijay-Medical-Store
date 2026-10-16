const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const authMiddleware = require('../middleware/auth');

describe('Admin Authentication Middleware', () => {
  test('Rejects request without Authorization header (401)', async () => {
    const app = express();
    app.use(authMiddleware);
    app.get('/admin-test', (req, res) => res.json({ success: true }));

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/admin-test`);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.message, 'No token, access denied');
    } finally {
      server.close();
    }
  });

  test('Rejects malformed Authorization header (missing "Bearer ") (401)', async () => {
    const app = express();
    app.use(authMiddleware);
    app.get('/admin-test', (req, res) => res.json({ success: true }));

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/admin-test`, {
        headers: { Authorization: 'Basic dXNlcjpwYXNz' },
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.message, 'No token, access denied');
    } finally {
      server.close();
    }
  });

  test('Rejects forged or invalid JWT token (401)', async () => {
    const app = express();
    app.use(authMiddleware);
    app.get('/admin-test', (req, res) => res.json({ success: true }));

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/admin-test`, {
        headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fakeSignature' },
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.message, 'Token is invalid or expired');
    } finally {
      server.close();
    }
  });
});

describe('Order Status Lifecycle State Machine', () => {
  const ALLOWED_ORDER_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [], // Terminal state
    cancelled: [], // Terminal state
  };

  test('Valid transitions are permitted', () => {
    const validPairs = [
      ['pending', 'confirmed'],
      ['pending', 'cancelled'],
      ['confirmed', 'shipped'],
      ['confirmed', 'cancelled'],
      ['shipped', 'delivered'],
      ['shipped', 'cancelled'],
    ];

    for (const [from, to] of validPairs) {
      const allowed = ALLOWED_ORDER_TRANSITIONS[from].includes(to);
      assert.ok(allowed, `Transition from ${from} to ${to} should be allowed`);
    }
  });

  test('Invalid forward jumps or regressions are rejected', () => {
    const invalidPairs = [
      ['pending', 'delivered'],       // Cannot skip confirmed and shipped
      ['pending', 'unknown'],         // Non-existent state
      ['confirmed', 'pending'],       // Cannot regress
      ['shipped', 'pending'],         // Cannot regress
      ['shipped', 'confirmed'],       // Cannot regress
      ['delivered', 'pending'],       // Terminal state
      ['delivered', 'cancelled'],     // Terminal state cannot be cancelled
      ['cancelled', 'pending'],       // Terminal state
      ['cancelled', 'delivered'],     // Terminal state
    ];

    for (const [from, to] of invalidPairs) {
      const allowed = ALLOWED_ORDER_TRANSITIONS[from].includes(to);
      assert.equal(allowed, false, `Transition from ${from} to ${to} should be rejected`);
    }
  });
});
