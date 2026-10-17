<div align="center">
  <h1>🏥 Vijay Medical Store</h1>
  <p><strong>Commercial Full-Stack MERN E-Commerce & Inventory Management Platform</strong></p>

  <p>
    <a href="https://vijay-medical.vercel.app"><img src="https://img.shields.io/badge/Live%20Store-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>
</div>

---

---

## 📁 Repository Structure

```
vijay-medical-store/
├── client/                         # Frontend (React 18 + Vite + Tailwind CSS + Framer Motion)
│   ├── src/
│   │   ├── components/             # UI Components (Storefront + Admin Portal)
│   │   │   ├── AdminDashboard.jsx          # Admin management (Products, Orders, Demand Alerts)
│   │   │   ├── AdminLogin.jsx              # Admin authentication modal
│   │   │   ├── CartDrawer.jsx              # Flyout cart summary
│   │   │   ├── CartSection.jsx             # Cart & checkout table
│   │   │   ├── CheckoutPage.jsx            # Full checkout form with address & payment
│   │   │   ├── DailyEssentials.jsx         # Category quick-picks
│   │   │   ├── Footer.jsx                  # Store info & quick links
│   │   │   ├── Hero.jsx                    # Promotional banners & store highlights
│   │   │   ├── Navbar.jsx                  # Global navigation & search bar
│   │   │   ├── OrderConfirmationPage.jsx   # Post-checkout success & tracking token view
│   │   │   ├── OrderTrackingPage.jsx       # Real-time order progress timeline by token
│   │   │   ├── PolicyModal.jsx             # Store terms, privacy, & returns
│   │   │   ├── PrescriptionUploadModal.jsx # OCR prescription scanner & fuzzy item matching
│   │   │   ├── ProductDetailModal.jsx      # Detailed medicine modal (composition, dosage)
│   │   │   ├── ProductGrid.jsx             # Paginated & filtered product cards
│   │   │   └── TrustStrip.jsx              # Certified genuine, fast delivery trust badges
│   │   ├── services/
│   │   │   ├── api.js                      # Centralized backend REST client
│   │   │   └── WhatsAppService.js          # Direct WhatsApp order dispatch helper
│   │   ├── App.jsx                         # Main view router & persistent state
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
└── server/                         # Backend API (Node.js + Express + Mongoose)
    ├── config/
    │   └── db.js                   # Resilient MongoDB Atlas connection
    ├── controllers/
    │   ├── adminController.js       # Admin JWT authentication
    │   ├── categoryController.js    # Category management
    │   ├── inventoryController.js   # Stock thresholds & demand velocity alerts
    │   ├── orderController.js       # Atomic checkout, idempotency & lifecycle
    │   ├── prescriptionController.js# Tesseract.js OCR & catalog matcher
    │   └── productController.js     # Product catalog CRUD
    ├── middleware/
    │   ├── auth.js                 # JWT Bearer token verification
    │   ├── errorHandler.js         # Centralized error & 404 handler
    │   ├── rateLimiter.js          # IP rate-limiters for tracking & brute-force protection
    │   └── validators.js           # express-validator schemas
    ├── models/
    │   ├── Admin.js                # Admin credentials with bcrypt hashing
    │   ├── Category.js             # Product categories
    │   ├── Order.js                # Orders with timeline, idempotency & tracking hash
    │   └── Product.js              # Medicines with batch, stock, & composition
    ├── routes/
    │   ├── adminRoutes.js          # /api/admin
    │   ├── categoryRoutes.js       # /api/categories
    │   ├── inventoryRoutes.js      # /api/inventory
    │   ├── orderRoutes.js          # /api/orders
    │   ├── prescriptionRoutes.js   # /api/prescription
    │   └── productRoutes.js        # /api/products
    ├── utils/
    │   ├── fuzzyMatcher.js         # Levenshtein/n-gram OCR catalog matcher
    │   ├── smsService.js           # Fast2SMS customer & owner notifications
    │   └── tokenService.js         # Cryptographic SHA-256 guest tracking token generator
    ├── changeAdminPassword.js      # CLI utility to reset admin credentials safely
    ├── seedAtlas.js                # Database seeder for categories & products
    ├── .env.example
    ├── package.json
    └── server.js                   # Express server entrypoint
```

---

## ✨ Key Platform Features

- **📸 In-Memory Prescription OCR Scanner:**
  - Fast, zero-disk OCR powered by `tesseract.js`.
  - Multi-tier fuzzy matching algorithm (`fuzzyMatcher.js`) correlates extracted text with active catalog items for one-click add to cart.
- **🔐 Secure Guest Order Tracking:**
  - Customers receive a cryptographic tracking token and short ID (e.g. `#VMS-XXXXXX`).
  - Protected with SHA-256 token hashing and IP rate limiting (`rateLimiter.js`) to prevent brute-force attacks.
  - Interactive multi-stage timeline (`Pending` → `Confirmed` → `Shipped` → `Delivered`).
- **📱 Automatic SMS Notifications (Fast2SMS):**
  - Instant order confirmation SMS dispatched to customers.
  - Real-time new order SMS alerts sent to the store owner's mobile number.
- **⚡ Idempotency & Stock Safety:**
  - Idempotency key handling prevents double orders and accidental charges during network flakiness.
  - Atomic stock reservations ensure zero overselling.
- **📊 Admin Portal & Inventory Demand Alerts:**
  - Manage inventory, catalog, and order fulfillment states.
  - Dedicated "Demand Alerts" tab detects low stock, depleted items, and fast-moving medicines.

---

## 🚀 Quick Start (Local Development)

### 1. Start the Backend Server

```bash
cd server
npm install

# Create your .env file:
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, FAST2SMS_API_KEY (optional), and STORE_PHONE

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

## 🔑 Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas / local MongoDB connection string |
| `PORT` | Express server port (default: `5000`) |
| `JWT_SECRET` | Secret key for signing admin authentication tokens |
| `NODE_ENV` | Environment mode (`development` or `production`) |
| `FAST2SMS_API_KEY` | Fast2SMS API key for customer & owner SMS notifications |
| `STORE_PHONE` | 10-digit owner phone number to receive order alerts |

### Frontend (`client/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |

---

## 📡 REST API Reference

### Public Endpoints
- `GET /` — API health check
- `GET /api/products` — List all products with category filtering & search
- `GET /api/products/:id` — Get single product details
- `GET /api/categories` — List active categories
- `POST /api/orders` — Place guest order (with idempotency support)
- `GET /api/orders/track/:token` — Secure order status & timeline by tracking token (rate-limited)
- `POST /api/prescription/scan` — OCR scanning & fuzzy catalog matching (Multipart form)
- `POST /api/admin/login` — Authenticate admin, returns JWT

### Protected Admin Endpoints (`Authorization: Bearer <token>`)
- `POST /api/products` — Create new medicine item
- `PUT /api/products/:id` — Update medicine stock, price, or details
- `DELETE /api/products/:id` — Delete product
- `POST /api/categories` — Create category
- `PUT /api/categories/:id` — Update category
- `DELETE /api/categories/:id` — Delete category
- `GET /api/orders` — List all customer orders
- `PUT /api/orders/:id/status` — Update order fulfillment status (`confirmed`, `shipped`, `delivered`, `cancelled`)
- `GET /api/inventory/alerts` — Get out-of-stock, low-stock, and demand alerts

---

## 🛠️ CLI Utilities

- **Reset / Change Admin Password:**
  ```bash
  cd server
  node changeAdminPassword.js
  ```
- **Seed Products & Categories:**
  ```bash
  cd server
  node seedAtlas.js
  ```

---

## 🌐 Deployment Guide

1. **Database:** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database) and set your connection string in `server/.env`.
2. **Backend:** Deploy `server/` to [Render](https://render.com) or [Railway](https://railway.app) as a Web Service. Set environment variables `MONGO_URI`, `JWT_SECRET`, `PORT`.
3. **Frontend:** Deploy `client/` to [Vercel](https://vercel.com). Add environment variable `VITE_API_URL` pointing to your deployed backend URL.
