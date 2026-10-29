# HotelPro — Full-Stack Hotel Booking & Management Solution

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Tanisha-svg20/Hotel_Management_Project)

HotelPro is an enterprise-grade hospitality reservation and property management web platform built using the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js). It offers a rich, responsive guest experience for discovering luxury rooms, validating real-time availability, and completing bookings, alongside specialized, role-protected management dashboards for hotel front-desk staff and system administrators.

---

## 🌟 Key Features

### 🏨 Guest & Customer Experience
- **Hero & Curated Discovery**: Explore signature rooms and suites with high-resolution photography, amenity tags, and guest ratings.
- **Real-Time Date-Based Search**: Check-in inclusive / check-out exclusive date logic preventing double-bookings.
- **Transparent Server Pricing**: Automatic calculations including nightly rates, 10% state tourism tax, and 3% resort service fee.
- **Seamless Instant Reservation**: Book rooms with instant confirmation and simulated payment integration via the Development Payment Adapter or Stripe.
- **My Bookings Dashboard**: Filter bookings by status (`confirmed`, `checked-in`, `checked-out`, `cancelled`), view itineraries, and download itemized tax invoices.
- **One-Click Cancellation**: Cancel upcoming stays with instant release of the room inventory back into the schedule.

### 🛎️ Staff Operations Hub
- **Front-Desk Check-In & Check-Out**: Quick lookup of today's expected arrivals and departures with single-click check-in and check-out.
- **Housekeeping Room Board**: Real-time room status tracking (`available`, `cleaning`, `occupied`, `maintenance`).
- **Automated Turnover Workflows**: Checking out a guest automatically sets the room to `cleaning` and creates a housekeeping ticket.
- **Service Request Desk**: Manage guest requests (amenities, towels, maintenance, room service) from intake to resolution.

### 👑 Administrator Control Center
- **Tab-Based Management**: Tabbed navigation covering Overview, All Bookings, All Rooms, Add Room, All Users, and Reports.
- **Verified Financial Metrics**: Real MongoDB aggregations tracking total bookings, occupancy, and verified revenue.
- **Room Lifecycle Management**: Add new rooms with amenities and image upload support; safely deactivate rooms with active reservation safeguards.
- **User Role Management**: Elevate or demote users between `customer`, `staff`, and `admin` roles, and toggle account statuses.
- **Analytics & Data Visualizations**: Interactive Chart.js graphs displaying 6-month revenue trends and room-type distribution.

---

## 🏛️ System Architecture

```
HotelPro/
├── client/                      # React.js Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI, Room Cards, Modals, Nav, Footer
│   │   ├── context/            # React AuthContext (JWT + Session state)
│   │   ├── pages/              # Public, Customer, Staff, and Admin Pages
│   │   ├── routes/             # ProtectedRoute guards with role enforcement
│   │   ├── services/           # Axios HTTP client with auth interceptors
│   │   └── styles/             # Luxury hospitality design system tokens
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js + Express REST API
│   ├── config/                 # MongoDB connection with zero-friction fallback
│   ├── controllers/            # Auth, Rooms, Bookings, Payments, Admin, Staff
│   ├── middleware/             # JWT verification, Role authorization, Multer
│   ├── models/                 # Mongoose schemas (User, Hotel, Room, Booking, etc.)
│   ├── routes/                 # Express REST endpoint routers
│   ├── services/               # Availability engine, Pricing, Payments, Email
│   ├── tests/                  # Automated test suite (Supertest + In-Memory DB)
│   ├── utils/                  # Seed script and demo data generator
│   ├── app.js                  # Express app setup & middleware
│   └── server.js               # Entry point & startup listener
│
└── docs/                       # Technical specifications & documentation
    ├── architecture.md
    ├── database-design.md
    ├── api-documentation.md
    ├── setup-and-deployment.md
    └── requirements-checklist.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Backend Setup
```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Seed the database with demo rooms, users, and bookings
npm run seed

# Run the comprehensive test suite (22/22 tests)
npm test

# Start the backend server (Runs on http://localhost:8001)
npm run dev
```

### 3. Frontend Setup
```bash
# In a new terminal, navigate to the client directory
cd client

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Build for production (verified bundle in client/dist/)
npm run build

# Start the Vite development server (Runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Demo Login Credentials

The application includes one-click demo login buttons directly on the `/login` page for fast evaluation:

| Role | Email Address | Password | Permissions & Available Features |
|---|---|---|---|
| **Administrator** | `admin@hotelpro.com` | `Admin@123` | Complete control center, revenue reports, room CRUD, user role management |
| **Front Desk Staff** | `staff@hotelpro.com` | `Staff@123` | Operational hub, check-ins, check-outs, room housekeeping board, service tickets |
| **Registered Guest** | `customer@hotelpro.com` | `User@123` | Room reservation, booking history, tax invoice download, cancellation |

---

## 🧪 Automated Test Suite

HotelPro includes an automated test suite verifying all critical business and security logic:

```bash
cd server
npm test
```

### Verified Test Cases:
1. `Health check endpoint returns status healthy`
2. `User registration creates customer with hashed password`
3. `Public registration rejects duplicate email`
4. `Public registration prevents privilege escalation (role=admin blocked)`
5. `User login succeeds with correct credentials`
6. `User login fails with invalid password`
7. `Protected admin route rejects unauthenticated request (401)`
8. `Protected admin route rejects customer token (403 Forbidden)`
9. `Protected admin route accepts admin token (200 OK)`
10. `Admin can create a new hotel room`
11. `Customer cannot create a room (403 Forbidden)`
12. `Room availability service correctly evaluates empty schedule`
13. `Server authoritative price calculator applies taxes and fees accurately`
14. `Customer creates booking for Nov 10 to Nov 14`
15. `Overlapping booking for Nov 12 to Nov 15 is strictly PREVENTED`
16. `Adjacent non-overlapping booking for Nov 14 to Nov 16 SUCCEEDS`
17. `Customer can retrieve their own booking history`
18. `Customer can cancel their confirmed reservation`
19. `Cancelled reservation releases room inventory for rebooking`
20. `Staff can update room operational status to cleaning`
21. `Admin dashboard statistics return accurate aggregated figures`
22. `Admin can update a user role to staff`

---

## 🔒 Security Highlights
- **Authoritative Server Calculations**: Client-submitted totals are never trusted; prices, taxes, and duration are calculated purely on the backend.
- **Strict Role-Based Access Control**: Route middleware intercepts all requests, verifying JWT tokens and ensuring proper roles.
- **Safe Public Registration**: Self-registration enforces the `customer` role on the server, preventing privilege escalation.
- **PCI-DSS Compliance Principle**: Raw card details or CVVs are never saved on the server.
- **Referential Integrity**: Rooms with active reservations cannot be deleted, safeguarding guest history.

