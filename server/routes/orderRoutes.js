const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateOrder, validateOrderStatus } = require('../middleware/validators');
const {
  createOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// Public — customer places an order (no login needed, but payload validated)
router.post('/', validateOrder, createOrder);

// Admin-only — only admin should see all orders and update their status
router.get('/', auth, getAllOrders);
router.put('/:id/status', auth, validateOrderStatus, updateOrderStatus);

module.exports = router;
