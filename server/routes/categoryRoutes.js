const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Public — anyone can see categories
router.get('/', getAllCategories);

// Admin-only — auth middleware checks the JWT before letting through
router.post('/', auth, createCategory);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

module.exports = router;
