const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateProduct } = require('../middleware/validators');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Public routes — anyone can browse products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only routes — auth checks token, validateProduct checks input body
router.post('/', auth, validateProduct, createProduct);
router.put('/:id', auth, validateProduct, updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
