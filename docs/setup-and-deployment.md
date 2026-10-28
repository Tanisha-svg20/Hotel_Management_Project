# HotelPro — Setup, Configuration, and Deployment Guide

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (default port 27017) or MongoDB Atlas connection string. (Note: The backend also includes a resilient local in-memory fallback for zero-friction evaluation).

---

## 2. Project Directory Structure
```
HotelPro/
├── client/           # React + Vite frontend application
├── server/           # Node.js + Express backend application
├── docs/             # Full system architecture, API, and database docs
├── .gitignore        # Git rules
└── README.md         # Master project documentation
```

---

## 3. Local Development Setup

### 3.1 Backend Configuration (`server/`)
1. Open a terminal and navigate to `server/`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   Configure the following variables:
   ```env
   PORT=8001
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/hotelpro
   JWT_SECRET=super_secret_hotelpro_jwt_key_2026
   CLIENT_URL=http://localhost:5173
   PAYMENT_PROVIDER=dev_adapter
   # Optional Stripe Keys:
   # STRIPE_SECRET_KEY=sk_test_...
   # STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Seed the database with realistic demo hotels, rooms, and test user accounts:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # Server will listen on http://localhost:8001
   ```

### 3.2 Frontend Configuration (`client/`)
1. Open a new terminal and navigate to `client/`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Add:
   ```env
   VITE_API_BASE_URL=http://localhost:8001/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   # Vite frontend will run on http://localhost:5173
   ```

---

## 4. Default Seed Credentials

After running `npm run seed` in the `server` folder, you can test all roles immediately:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@hotelpro.com` | `Admin@123` | Full dashboard, room management, user roles, analytics |
| **Staff** | `staff@hotelpro.com` | `Staff@123` | Front-desk operations, check-in, check-out, room cleaning |
| **Customer** | `customer@hotelpro.com` | `User@123` | Browse rooms, create reservations, payment, cancellation |

---

## 5. Production Build & Deployment

### 5.1 Frontend Build
```bash
cd client
npm run build
```
This produces an optimized static build in `client/dist/`. The backend Express server is configured to serve `client/dist/` in production if configured as a unified deployment, or `client/dist/` can be deployed independently to Vercel, Netlify, or Cloudflare Pages.

### 5.2 Production Backend
```bash
cd server
NODE_ENV=production npm start
```
Use a process manager such as `pm2` or a Docker container for production deployment.
