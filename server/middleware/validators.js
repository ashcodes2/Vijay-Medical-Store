const { body, param, validationResult } = require('express-validator');

// Reusable runner that executes express-validator rules and halts with clean JSON if invalid
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  };
};

// ── Validation Rules ──

const validateProduct = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Product name must be between 2 and 120 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer 0 or greater'),
]);

const validateOrder = [
  (req, res, next) => {
    if (!req.body.customerName && (req.body.fullName || req.body.name)) {
      req.body.customerName = req.body.fullName || req.body.name;
    }
    if (!req.body.phone && req.body.mobileNumber) {
      req.body.phone = req.body.mobileNumber;
    }
    if (!req.body.address && req.body.deliveryAddress) {
      req.body.address = req.body.deliveryAddress;
    }
    if (Array.isArray(req.body.items)) {
      req.body.items = req.body.items.map((it) => ({
        ...it,
        product: it.product || it.productId,
      }));
    }
    next();
  },
  validate([
    body('customerName')
      .trim()
      .notEmpty()
      .withMessage('Customer name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Customer name must be between 2 and 100 characters'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Mobile number is required')
      .customSanitizer((val) => String(val || '').replace(/[\s-]/g, ''))
      .matches(/^(?:\+91|91)?[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit mobile number'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Delivery address is required')
      .isLength({ min: 5, max: 300 })
      .withMessage('Address must be at least 5 characters'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('totalAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total amount must be a positive number'),
  ]),
];

const validateOrderStatus = validate([
  body('status')
    .trim()
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, shipped, delivered, cancelled'),
]);

const validateAdminLogin = validate([
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
]);

module.exports = {
  validateProduct,
  validateOrder,
  validateOrderStatus,
  validateAdminLogin,
};
