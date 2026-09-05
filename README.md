# 🏥 Vijay Medical Store — Full-Stack MERN Application

A modern full-stack e-commerce web application for **Vijay Medical Store** (serving since 1984), built with **MongoDB, Express.js, React, and Node.js (MERN)**.

---

## 📁 Repository Structure

```
new medical/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS + Framer Motion)
│   ├── src/
│   │   ├── components/         # UI Components (Storefront + Admin Portal)
│   │   │   ├── AdminLogin.jsx      # Admin login form
│   │   │   ├── AdminDashboard.jsx  # Admin CRUD for Products & Orders
│   │   │   ├── CartSection.jsx     # Checkout form + cart summary
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.js              # Centralized backend fetch wrapper
│   │   │   └── WhatsAppService.js  # WhatsApp notifications
│   │   ├── App.jsx                 # Main state & view toggle
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
└── server/                     # Backend API (Node.js + Express + Mongoose)
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── controllers/
    │   ├── adminController.js   # JWT Auth signup/login
    │   ├── categoryController.js# Category CRUD
    │   ├── orderController.js   # Order creation & status lifecycle
    │   └── productController.js # Product CRUD
    ├── middleware/
    │   ├── auth.js             # JWT Bearer token verification
    │   ├── errorHandler.js     # Centralized 404 & error middleware
    │   └── validators.js       # express-validator request rules
    ├── models/
    │   ├── Admin.js            # Admin schema with bcrypt hashing
    │   ├── Category.js         # Category schema
    │   ├── Order.js            # Order schema with statuses
    │   └── Product.js          # Product schema
    ├── routes/
    │   ├── adminRoutes.js
    │   ├── categoryRoutes.js
    │   ├── orderRoutes.js
    │   └── productRoutes.js
    ├── .env.example
    ├── package.json
    └── server.js               # Express entrypoint
```

---

## 🚀 Quick Start (Local Development)

### 1. Start the Backend Server

```bash
cd server
npm install

# Create your .env file:
cp .env.example .env
# Edit .env and ensure MONGO_URI=mongodb://localhost:27017/vijay_medical (or Atlas URI)

# Run development server with auto-reload:
npm run dev
```
> Server runs on `http://localhost:5000`

### 2. Start the Frontend Client

In a separate terminal:

```bash
cd client
npm install

# Start Vite dev server:
npm run dev
```
> Frontend runs on `http://localhost:5173`

---

## 🔐 Admin Portal Access

- **Admin Authentication:**
  - Access is strictly restricted to administrator accounts provisioned directly in the private database.
  - Credentials must never be committed to source control or shared publicly.
- **Admin Capabilities:**
  - **Products Tab:** Add new products, edit details (price, stock, category), delete items with confirmation.
  - **Orders Tab:** View incoming customer orders, review cart items and delivery addresses, update order status (`pending` → `confirmed` → `shipped` → `delivered`).

---

## 📡 REST API Reference

### Public Endpoints
- `GET /` — API health check
- `GET /api/products` — List all products
- `GET /api/products/:id` — Get single product
- `GET /api/categories` — List categories
- `POST /api/orders` — Place order (validated payload: customer info + items)
- `POST /api/admin/login` — Authenticate admin, returns JWT

### Protected Admin Endpoints (`Authorization: Bearer <token>`)
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product
- `POST /api/categories` — Create category
- `PUT /api/categories/:id` — Update category
- `DELETE /api/categories/:id` — Delete category
- `GET /api/orders` — View all orders
- `PUT /api/orders/:id/status` — Update order status

---

## 🛡️ Error Handling & Validation
- **Request Validation:** Handled via `express-validator` across product, order, and auth routes. Returns structured `{ success: false, message, errors: [...] }`.
- **Centralized Error Handler:** Intercepts Mongoose `CastError` (invalid ObjectId), `ValidationError`, duplicate keys (`11000`), and JWT errors.
- **404 Fallback:** Returns clean JSON error for undefined endpoints.

---

## 🌐 Deployment Guide

1. **Database:** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database) and copy your connection string into `server/.env`.
2. **Backend:** Deploy `server/` to [Render](https://render.com) or [Railway](https://railway.app) as a Web Service. Set environment variables `MONGO_URI`, `JWT_SECRET`, `PORT`.
3. **Frontend:** Deploy `client/` to [Vercel](https://vercel.com). Add environment variable `VITE_API_URL` pointing to your deployed backend URL.
