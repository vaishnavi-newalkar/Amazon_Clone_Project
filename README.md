# 🛒 Amazon Clone — Full-Stack E-Commerce Platform


![Tech Stack](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Tech Stack](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql)

---

## 🚀 Live Demo
- **Frontend:** [https://your-app.vercel.app](https://amazon-clone-project-lyart.vercel.app/)

**Test Credentials:** `test@example.com` / `password123`

---

## ✅ Features Implemented

### Core Features
| Feature | Status |
|---------|--------|
| Product Listing with Grid Layout | ✅ |
| Product Cards (image, name, price, add to cart) | ✅ |
| Search by name, brand, description | ✅ |
| Category Filter | ✅ |
| Price Range Filter | ✅ |
| Sort (price, rating, newest) | ✅ |
| Pagination | ✅ |
| Product Detail Page | ✅ |
| Image Carousel with thumbnails | ✅ |
| Product Specifications Table | ✅ |
| Stock Status | ✅ |
| Shopping Cart (add/update/remove) | ✅ |
| Cart Summary with subtotal/total | ✅ |
| Checkout with Address Form | ✅ |
| Order Confirmation Page | ✅ |

### Bonus Features
| Feature | Status |
|---------|--------|
| JWT Authentication (Login/Signup) | ✅ |
| Protected Routes | ✅ |
| Order History | ✅ |
| Wishlist (add/remove) | ✅ |
| Email Notification (SMTP + mock) | ✅ |
| Responsive Design (mobile/tablet/desktop) | ✅ |

---

## 🏗️ Architecture

```
amazon-clone/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── core/            # Config, DB, Security (JWT)
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── routes/          # API route handlers
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # Business logic (email service)
│   │   └── main.py          # App entry point
│   ├── seed.py              # Database seeder
│   └── requirements.txt
│
├── frontend/                # React.js frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       │   ├── common/      # Navbar, Footer
│       │   └── product/     # ProductCard
│       ├── context/         # AuthContext, CartContext, WishlistContext
│       ├── pages/           # All page components
│       ├── services/        # api.js (Axios)
│       └── App.js           # Router + Providers
│
└── database/
    └── schema.sql           # Full MySQL schema with indexes & views
```

---

## 🗄️ Database Design

### Entity Relationship

```
users ──< cart_items >── products ──< categories
users ──< orders    >── order_items
users ──< wishlist  >── products
orders ──< order_items
```

### Key Design Decisions
1. **Denormalized Order Items** — Product name/price are snapshotted at order time so historical orders remain accurate even if products are updated/deleted
2. **JSON columns for images & specs** — Products have variable numbers of images and specifications; JSON is flexible and avoids unnecessary join tables
3. **Soft deletes via `is_active`** — Products are never hard-deleted; deactivating them preserves order history
4. **Indexed foreign keys & search fields** — `category_id`, `price`, `rating`, and a FULLTEXT index on `name` for fast search
5. **UNIQUE constraint on cart** — `(user_id, product_id)` prevents duplicate cart rows; backend increments quantity instead

---

## ⚙️ Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React.js (CRA) | Component model, hooks, Context API |
| Routing | React Router v6 | Declarative nested routing, protected routes |
| State | Context API | Lightweight global state for auth/cart/wishlist |
| HTTP | Axios | Interceptors for JWT + error handling |
| Backend | Python FastAPI | Fast, async, auto-docs, Pydantic validation |
| ORM | SQLAlchemy | Powerful, Pythonic, supports migrations |
| Auth | JWT (python-jose) + bcrypt | Stateless, industry standard |
| Database | MySQL | ACID compliant, relational integrity |
| Email | SMTP (smtplib) | Standard library, easy GMAIL integration |
| Styling | Plain CSS (variables) | No build overhead, full control, Amazon-accurate |

---

## 🛠️ Setup Instructions

---

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE amazon_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env → set DATABASE_URL with your MySQL credentials

# Tables are created automatically on startup via SQLAlchemy
# Seed sample data
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API Docs: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

Frontend runs at: http://localhost:3000

---

### 4. Email Setup (Optional)

To enable real email notifications, update `.env`:

```env
EMAIL_ENABLED=True
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password    # Google App Password, not login password
```

For Gmail: go to Google Account → Security → 2FA → App Passwords → Generate

When `EMAIL_ENABLED=False`, order confirmations are logged to the console (mock mode).

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/products` | — | List/search/filter products |
| GET | `/api/products/featured` | — | Homepage featured |
| GET | `/api/products/:id` | — | Product detail |
| GET | `/api/categories` | — | All categories |
| GET | `/api/cart` | ✅ | Get cart |
| POST | `/api/cart/add` | ✅ | Add to cart |
| PUT | `/api/cart/:id` | ✅ | Update quantity |
| DELETE | `/api/cart/:id` | ✅ | Remove item |
| GET | `/api/wishlist` | ✅ | Get wishlist |
| POST | `/api/wishlist/:id` | ✅ | Add to wishlist |
| DELETE | `/api/wishlist/:id` | ✅ | Remove from wishlist |
| POST | `/api/orders/place` | ✅ | Place order |
| GET | `/api/orders` | ✅ | Order history |
| GET | `/api/orders/:id` | ✅ | Order detail |

---

## 📦 Deployment

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on Render
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard

### Frontend (Vercel)
1. Import GitHub repo to Vercel
2. Add env: `REACT_APP_API_URL=https://your-backend.render.com/api`
3. Deploy

---

## 🔮 Future Improvements

1. **Redis caching** for product listings and category counts
2. **Elasticsearch** for advanced full-text product search
3. **Product reviews & ratings** — let users write reviews
4. **Admin dashboard** — manage products, categories, orders
5. **Image upload** — S3/Cloudinary integration for product images
6. **Razorpay / Stripe** integration for real payments
7. **Real-time order tracking** with WebSockets
8. **Recommendation engine** — "Customers also bought"
9. **Infinite scroll** instead of pagination
10. **PWA** — offline support and push notifications

---

## 🏗️ Scaling Strategy

| Concern | Solution |
|---------|----------|
| High read traffic | Redis cache for product list, CDN for images |
| Database bottleneck | Read replicas, connection pooling (PgBouncer) |
| Search | Elasticsearch for full-text, filters, facets |
| Images | Object storage (S3), served via CloudFront CDN |
| API | Horizontal scaling behind load balancer |
| Cart | Migrate to Redis for sub-millisecond operations |
| Orders | Message queue (RabbitMQ/SQS) for email/inventory |
| Monolith → Microservices | Split: product-service, order-service, auth-service |

---

## 📝 Assumptions Made

1. Currency is Indian Rupees (₹) — no multi-currency
2. Single shipping address per order (no address book)
3. No real payment gateway — COD/UPI/Card are simulated
4. Product images are from Unsplash URLs (no file upload)
5. Free shipping for orders above ₹499, else ₹40 shipping
6. No guest checkout — login required for cart/orders

---

*Built with ❤️ for Scaler SDE Intern Assignment*
