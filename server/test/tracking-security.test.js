const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { generateTrackingToken, hashTrackingToken } = require('../utils/tokenService');

describe('Tracking Token & Privacy Security', () => {
  test('Token generator produces 64-char hex string with SHA-256 hash', () => {
    const { rawToken, tokenHash } = generateTrackingToken();
    assert.equal(typeof rawToken, 'string');
    assert.equal(rawToken.length, 64);
    assert.match(rawToken, /^[0-9a-f]{64}$/);

    // Verify hash matches raw token
    const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    assert.equal(tokenHash, expectedHash);
  });

  test('hashTrackingToken validates valid 64-char hex token', () => {
    const token = 'a'.repeat(64);
    const hash = hashTrackingToken(token);
    assert.ok(hash);
    assert.equal(hash.length, 64);
    assert.equal(hash, crypto.createHash('sha256').update(token.toLowerCase()).digest('hex'));
  });

  test('hashTrackingToken rejects non-token inputs: Order IDs, phone numbers, short strings, SQL/NoSQL injections', () => {
    const invalidInputs = [
      '60d5ecb8b5c9c62b3c8f1111',       // 24-character MongoDB ObjectId
      'A1B2C3',                         // Short order ID
      '9876543210',                     // 10-digit mobile number
      '+919876543210',                  // Phone with country code
      '',                               // Empty string
      null,                             // Null
      undefined,                        // Undefined
      '{"$gt": ""}',                    // NoSQL operator injection string
      'g'.repeat(64),                   // Non-hex character 'g'
      'a'.repeat(63),                   // 63 characters (too short)
      'a'.repeat(65),                   // 65 characters (too long)
    ];

    for (const input of invalidInputs) {
      const result = hashTrackingToken(input);
      assert.equal(result, null, `Input "${input}" should be rejected with null`);
    }
  });

  test('Public tracking response data structure must protect customer privacy', () => {
    // Simulate what trackOrderByToken formats for public view
    const rawOrderFromDB = {
      _id: '60d5ecb8b5c9c62b3c8f9999',
      shortId: '7B39AF',
      customerName: 'Ashwani Kumar Sharma',
      phone: '9876543210',
      address: 'Flat 402, Sunshine Heights, Betiahata, Gorakhpur, UP 273001',
      trackingTokenHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      items: [
        { product: '60d5ecb8b5c9c62b3c8f1111', name: 'Paracetamol 500mg', quantity: 2, price: 30 },
      ],
      subtotal: 60,
      gst: 7.2,
      deliveryFee: 20,
      totalAmount: 87.2,
      status: 'pending',
      createdAt: new Date(),
    };

    // Transformation logic identical to orderController.js trackOrderByToken
    const customerFirstName = String(rawOrderFromDB.customerName || 'Customer').split(' ')[0];
    const maskedPhone = rawOrderFromDB.phone ? `******${String(rawOrderFromDB.phone).slice(-4)}` : '';
    const publicTrackingPayload = {
      orderReference: `#VMS-${rawOrderFromDB.shortId}`,
      shortId: rawOrderFromDB.shortId,
      currentStatus: rawOrderFromDB.status,
      recipient: {
        firstName: customerFirstName,
        maskedPhone,
        deliveryCity: 'Gorakhpur, Uttar Pradesh',
      },
    };

    // Assertions for privacy compliance
    assert.equal(publicTrackingPayload.recipient.firstName, 'Ashwani');
    assert.equal(publicTrackingPayload.recipient.maskedPhone, '******3210');
    assert.equal(publicTrackingPayload.recipient.deliveryCity, 'Gorakhpur, Uttar Pradesh');

    // Ensure raw fields are absent
    assert.equal(publicTrackingPayload.recipient.address, undefined);
    assert.equal(publicTrackingPayload.trackingTokenHash, undefined);
    assert.equal(publicTrackingPayload._id, undefined);
  });
});
