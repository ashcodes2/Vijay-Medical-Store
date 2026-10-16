const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateOrder, validateOrderStatus } = require('../middleware/validators');
const { trackingRateLimiter } = require('../middleware/rateLimiter');
const {
  createOrder,
  trackOrderByToken,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// Public — customer places a guest order
router.post('/', validateOrder, createOrder);

// Public & Secure — customer tracks an order using their cryptographically secure token
// Protected by IP rate limiter to prevent token guessing/brute-force attacks
router.get('/track/:token', trackingRateLimiter, trackOrderByToken);

// Admin-only — only admin can view all orders and update statuses
router.get('/', auth, getAllOrders);
router.put('/:id/status', auth, validateOrderStatus, updateOrderStatus);

module.exports = router;
