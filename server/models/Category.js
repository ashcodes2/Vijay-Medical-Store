const mongoose = require('mongoose');

// Categories are simple — just a display name and a URL-friendly slug.
// Example: name = "Cold & Flu", slug = "cold-flu"
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,   // No two categories should share the same slug
    lowercase: true,
    trim: true,
  },
});

module.exports = mongoose.model('Category', categorySchema);
