const mongoose = require('mongoose');

// Each item inside an order — which product, how many, at what price.
// We store price here (not just reference the product) because
// the product price might change later, but the order price shouldn't.
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  // Don't create a separate _id for each item inside the array
  _id: false,
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Delivery address is required'],
    trim: true,
  },
  items: {
    type: [orderItemSchema],
    // At least one item must be in the order
    validate: [arr => arr.length > 0, 'Order must have at least one item'],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  // Order lifecycle: pending → confirmed → shipped → delivered
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
