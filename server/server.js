const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load .env variables BEFORE anything else uses them
dotenv.config();

const app = express();

// --- Global Middleware ---
// cors() lets the React frontend (different port) talk to this server
app.use(cors());
// express.json() parses incoming JSON request bodies automatically
app.use(express.json());

// --- Mount Routes ---
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Simple health-check route to verify server is alive
app.get('/', (req, res) => {
  res.json({ message: 'Vijay Medical Store API is running' });
});

// --- Centralized Error Handling Middleware ---
// 404 handler runs if no route matched
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
// Global error handler runs whenever next(err) is called or an unhandled error throws
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
