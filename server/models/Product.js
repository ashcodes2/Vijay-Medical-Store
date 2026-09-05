const mongoose = require('mongoose');

// Each product has a name, price, stock count, category label,
// and an array of image URLs (so you can show multiple photos later).
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  // Array of image URLs — even if you only use one image now,
  // this lets you add more later without changing the schema.
  images: {
    type: [String],
    default: [],
  },
}, {
  // Mongoose auto-adds createdAt and updatedAt fields
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
