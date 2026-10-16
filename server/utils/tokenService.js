const crypto = require('crypto');

/**
 * Generates a cryptographically secure, unpredictable tracking token (256-bit entropy).
 * Returns both the raw token (to be sent once to the customer) and the SHA-256 hash
 * (to be saved in the database).
 */
const generateTrackingToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
};

/**
 * Hashes a user-supplied tracking token with SHA-256 for secure database lookup.
 * @param {string} token - Raw tracking token provided in request
 * @returns {string|null} - 64-char SHA-256 hex string or null if token format is completely invalid
 */
const hashTrackingToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  // Valid token is a 64-character hex string (32 bytes)
  if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return null;
  }
  return crypto.createHash('sha256').update(trimmed.toLowerCase()).digest('hex');
};

module.exports = {
  generateTrackingToken,
  hashTrackingToken,
};
