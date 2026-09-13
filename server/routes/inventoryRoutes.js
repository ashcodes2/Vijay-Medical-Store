const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getInventoryAlerts } = require('../controllers/inventoryController');

// GET /api/inventory/alerts — Admin only
router.get('/alerts', auth, getInventoryAlerts);

module.exports = router;
