const express = require('express');
const router = express.Router();
const { login } = require('../controllers/adminController');
const { validateAdminLogin } = require('../middleware/validators');

// Only POST /api/admin/login is available.
// No public signup route exists — the admin account is provisioned once and managed strictly.
router.post('/login', validateAdminLogin, login);

module.exports = router;
