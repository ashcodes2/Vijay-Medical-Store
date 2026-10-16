const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createRateLimiter } = require('../middleware/rateLimiter');

describe('Rate Limiter Middleware', () => {
  test('Allows requests up to configured limit, then blocks with 429 and Retry-After', async () => {
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      max: 5,
      message: 'Rate limit exceeded for testing',
    });

    const app = express();
    app.use(limiter);
    app.get('/test-limit', (req, res) => res.json({ success: true }));

    const server = app.listen(0);
    const port = server.address().port;

    try {
      // First 5 requests should succeed
      for (let i = 1; i <= 5; i++) {
        const res = await fetch(`http://127.0.0.1:${port}/test-limit`);
        assert.equal(res.status, 200, `Request ${i} should be 200`);
        assert.equal(res.headers.get('x-ratelimit-limit'), '5');
        assert.equal(res.headers.get('x-ratelimit-remaining'), String(5 - i));
      }

      // 6th request should hit the rate limit (429)
      const blockedRes = await fetch(`http://127.0.0.1:${port}/test-limit`);
      assert.equal(blockedRes.status, 429, '6th request should be 429 Too Many Requests');
      assert.ok(blockedRes.headers.get('retry-after'), 'Must include Retry-After header');
      assert.equal(blockedRes.headers.get('x-ratelimit-remaining'), '0');

      const data = await blockedRes.json();
      assert.equal(data.success, false);
      assert.equal(data.message, 'Rate limit exceeded for testing');
      assert.ok(typeof data.retryAfter === 'number' && data.retryAfter > 0);
    } finally {
      server.close();
    }
  });
});
