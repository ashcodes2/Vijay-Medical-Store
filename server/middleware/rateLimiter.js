// In-memory sliding window rate limiter for public sensitive routes (e.g. order tracking)
const trackerStore = new Map();

// Periodic cleanup of stale IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of trackerStore.entries()) {
    if (now - data.windowStart > data.windowMs) {
      trackerStore.delete(ip);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Creates an Express rate-limiting middleware.
 * @param {Object} options
 * @param {number} options.windowMs - Window duration in milliseconds (default: 5 minutes)
 * @param {number} options.max - Maximum requests allowed per window (default: 30)
 * @param {string} options.message - Error message when rate limit exceeded
 */
const createRateLimiter = ({
  windowMs = 5 * 60 * 1000,
  max = 30,
  message = 'Too many tracking requests from this connection. Please try again in a few minutes.',
} = {}) => {
  return (req, res, next) => {
    // Derive client IP (respecting x-forwarded-for if behind reverse proxy/Vercel)
    const clientIp = (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown'
    );

    const now = Date.now();
    let record = trackerStore.get(clientIp);

    if (!record || now - record.windowStart > windowMs) {
      record = { windowStart: now, count: 1, windowMs };
      trackerStore.set(clientIp, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.windowStart + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
};

module.exports = {
  trackingRateLimiter: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30,                 // 30 lookups per 5 minutes per IP
    message: 'Too many tracking attempts. Please wait a few minutes before trying again.',
  }),
  createRateLimiter,
};
