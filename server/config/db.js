const mongoose = require('mongoose');

// Connects to MongoDB using the URI from .env
// We keep this in a separate file so server.js stays clean,
// and if we ever need to change DB config, it's all in one place.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Stop the server if DB won't connect
  }
};

module.exports = connectDB;
