# ShopEase — Full Stack E-commerce Store

> Production-ready MERN stack e-commerce with admin dashboard, Razorpay payment, Cloudinary image uploads, and Redux Toolkit state management.

---

## 🚀 Features

### User Features
- Browse & search products with filters (category, price, rating, sort)
- Product detail page with image gallery, reviews & ratings
- Add to cart, update quantity, remove items
- Wishlist management
- Address book (add/delete addresses)
- Checkout with Razorpay (UPI, Card, NetBanking) or Cash on Delivery
- Order tracking with status steps (Processing → Confirmed → Shipped → Delivered)
- Order history
- Profile management + password change
- Email order confirmation

### Admin Features
- Dashboard with revenue, orders, users, top products stats
- Product management (add/edit/delete with Cloudinary image upload)
- Order management (update status, track orders)
- User management (change roles, delete users)

---

## 🗂️ Project Structure

```
shopease/
├── backend/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── cloudinary.js    # Cloudinary + multer setup
│   ├── controllers/
│   │   ├── authController.js     # Auth, profile, wishlist, address
│   │   ├── productController.js  # CRUD, search, reviews
│   │   ├── cartController.js     # Cart management
│   │   ├── orderController.js    # Orders + Razorpay
│   │   └── adminController.js    # Dashboard, users
│   ├── middleware/
│   │   ├── auth.js          # JWT + admin check
│   │   └── error.js         # Error handler
│   ├── models/
│   │   ├── User.js          # User with addresses + wishlist
│   │   ├── Product.js       # Product with reviews + ratings
│   │   ├── Order.js         # Order with items + payment
│   │   └── Cart.js          # Cart with virtuals
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── index.js         # cart + order + admin routes
│   ├── utils/
│   │   ├── helpers.js       # JWT, email, templates
│   │   └── seeder.js        # Sample data seeder
│   ├── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── store.js              # Redux store + all slices + axios
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx    # Search, cart badge, user menu
        │   │   └── Layout.jsx    # Layout, ProtectedRoute, AdminRoute
        │   └── product/
        │       └── ProductCard.jsx  # Card with wishlist, add to cart
        └── pages/
            ├── Home.jsx          # Hero, categories, featured products
            ├── Products.jsx      # Listing with filters + pagination
            ├── ProductDetail.jsx # Gallery, reviews, add to cart
            ├── Cart.jsx          # Cart management + summary
            ├── Checkout.jsx      # Address selection + Razorpay/COD
            ├── Orders.jsx        # Order list + detail with tracking
            ├── Auth.jsx          # Login + Register
            ├── Profile.jsx       # Profile, addresses, wishlist, security
            └── admin/
                ├── Dashboard.jsx # Stats + recent orders + top products
                ├── Products.jsx  # CRUD table with modal
                ├── Orders.jsx    # Order management with status change
                └── Users.jsx     # User management
```

---

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd shopease/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
```

Fill in `.env`:
| Variable | Where to get |
|---|---|
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | Any random string |
| `CLOUDINARY_*` | cloudinary.com → Dashboard |
| `RAZORPAY_KEY_ID` | razorpay.com → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Same as above |
| `EMAIL_USER` | Your Gmail |
| `EMAIL_PASS` | Gmail → App Passwords |

### 3. Seed Sample Data
```bash
cd backend
node utils/seeder.js
```
This creates 8 sample products + admin user:
- **Admin login:** admin@shopease.com / admin123

### 4. Run the App
```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🌐 API Endpoints

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/profile` | Private |
| PUT | `/api/auth/change-password` | Private |
| POST | `/api/auth/address` | Private |
| DELETE | `/api/auth/address/:id` | Private |
| PUT | `/api/auth/wishlist/:productId` | Private |

### Products
| Method | Route | Access |
|---|---|---|
| GET | `/api/products?keyword=&category=&sort=&page=` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |
| POST | `/api/products/:id/reviews` | Private |

### Cart
| Method | Route | Access |
|---|---|---|
| GET | `/api/cart` | Private |
| POST | `/api/cart` | Private |
| PUT | `/api/cart/:productId` | Private |
| DELETE | `/api/cart/:productId` | Private |

### Orders
| Method | Route | Access |
|---|---|---|
| POST | `/api/orders` | Private |
| POST | `/api/orders/razorpay` | Private |
| POST | `/api/orders/:id/pay/razorpay` | Private |
| GET | `/api/orders/my` | Private |
| GET | `/api/orders/:id` | Private |
| GET | `/api/orders` | Admin |
| PUT | `/api/orders/:id/status` | Admin |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Redux Toolkit |
| HTTP | Axios with interceptors |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Images | Cloudinary + Multer |
| Payment | Razorpay |
| Email | Nodemailer (Gmail) |

---

## 🚀 Deployment

**Backend (Render):**
- Root: `shopease/backend`
- Start: `npm start`
- Add all env variables

**Frontend (Vercel):**
- Root: `shopease/frontend`
- Build: `npm run build`

---

*Built with MERN Stack — ShopEase Internship Project*
"# SHOPEASE-Eccomerce" 
