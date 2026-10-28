# HotelPro — Requirements Traceability Checklist

This checklist tracks all requirements from the specification PDFs and master project prompt, mapping each requirement to its architectural domain, implementation files, verification method, and current status.

---

## 1. Environment & Architecture Setup

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-ENV-01 | Client-Server Architecture (`client/`, `server/`, `docs/`) | Project root layout | Directory structure inspection | Verified |
| REQ-ENV-02 | Node.js + Express.js backend with modular MVC architecture | `server/` | Start backend server, check health endpoint | Verified |
| REQ-ENV-03 | React + Vite frontend with React Router DOM | `client/` | Start Vite dev server & production build | Verified |
| REQ-ENV-04 | Environment configuration & `.env.example` templates | `server/.env.example`, `client/.env.example` | Inspect variables & runtime validation | Verified |
| REQ-ENV-05 | MongoDB connection with robust fallback | `server/config/db.js` | Connection logs & auto-seed fallback | Verified |

---

## 2. Authentication & Authorization

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-AUTH-01 | User registration with input validation (name, email, password, phone) | `server/controllers/authController.js` | Automated API test / POST `/api/auth/register` | Verified |
| REQ-AUTH-02 | Password hashing with bcryptjs (salt cost 10) | `server/models/User.js` | Automated test: verify bcrypt hashing | Verified |
| REQ-AUTH-03 | Rejection of duplicate email addresses | `server/controllers/authController.js` | Automated test: duplicate registration 400 | Verified |
| REQ-AUTH-04 | User login with JWT generation & secure credential checking | `server/controllers/authController.js` | Automated test: JWT token generation | Verified |
| REQ-AUTH-05 | Safe public registration (prevent privilege escalation) | `server/controllers/authController.js` | Automated test: role=admin rejected to customer | Verified |
| REQ-AUTH-06 | Role-based access control (Customer, Staff, Admin) | `server/middleware/authMiddleware.js` | Automated test: 401 & 403 route guards | Verified |
| REQ-AUTH-07 | Frontend protected routes for user, staff, and admin | `client/src/routes/ProtectedRoute.jsx` | Navigation redirection & role check | Verified |

---

## 3. Database Models & Schema Design

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-DB-01 | User Model (name, email, password, phone, role, status, timestamps) | `server/models/User.js` | Mongoose schema validation tests | Verified |
| REQ-DB-02 | Hotel Model (name, description, address, amenities, images) | `server/models/Hotel.js` | Seed validation | Verified |
| REQ-DB-03 | Room Model (hotel, roomNumber, type, rent, capacity, amenities, photos, operationalStatus, count) | `server/models/Room.js` | Model & inventory tests | Verified |
| REQ-DB-04 | Booking Model (bookingId, room, user, fromdate/todate, totaldays, totalAmount, status) | `server/models/Booking.js` | Booking CRUD tests | Verified |
| REQ-DB-05 | Payment Model (bookingId, user, provider, transactionId, amount, status, timestamps) | `server/models/Payment.js` | Payment creation & verification tests | Verified |
| REQ-DB-06 | Review Model (user, room, rating, comment) | `server/models/Review.js` | Review model & room details query | Verified |
| REQ-DB-07 | Service Request / Housekeeping Model (room, user, staff, type, status) | `server/models/ServiceRequest.js` | Staff workflow tests | Verified |
| REQ-DB-08 | Notification Model (user, title, message, readStatus, type) | `server/models/Notification.js` | In-app notification creation | Verified |

---

## 4. Booking Engine & Availability Logic

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-BOK-01 | Check-in inclusive / Check-out exclusive date logic | `server/services/availabilityService.js` | Unit test date boundary cases | Verified |
| REQ-BOK-02 | Prevent overlapping reservations for identical room units | `server/controllers/bookingController.js` | Automated test: conflicting dates rejected (400) | Verified |
| REQ-BOK-03 | Server-side pricing calculation (`totaldays * pricePerNight` + taxes) | `server/services/pricingService.js` | Automated test: authoritative formula verified | Verified |
| REQ-BOK-04 | Adjacent non-overlapping reservation support | `server/services/availabilityService.js` | Automated test: check-out day re-booked (201) | Verified |
| REQ-BOK-05 | Booking status lifecycle (`pending`, `confirmed`, `checked-in`, `checked-out`, `cancelled`) | `server/models/Booking.js` | State transitions tested | Verified |
| REQ-BOK-06 | Customer cancellation workflow with availability release | `server/controllers/bookingController.js` | Automated test: POST `/api/bookings/:id/cancel` | Verified |

---

## 5. Payments & Invoicing

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-PAY-01 | Configurable payment architecture (Stripe + Development Adapter) | `server/services/paymentService.js` | Automated payment recording test | Verified |
| REQ-PAY-02 | Secure checkout session / order creation | `server/controllers/paymentController.js` | `/api/payments/create-intent` endpoint | Verified |
| REQ-PAY-03 | Payment verification & idempotency | `server/services/paymentService.js` | Transaction hash uniqueness | Verified |
| REQ-PAY-04 | Digital invoice / receipt summary generation | `client/src/components/booking/InvoiceModal.jsx` | Printable modal rendering | Verified |

---

## 6. Frontend Public Website

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-FE-01 | Elegant, responsive navigation bar and footer | `client/src/components/common/Navbar.jsx`, `Footer.jsx` | Responsive navigation test | Verified |
| REQ-FE-02 | Home page with Hero, room search filter, featured rooms, amenities | `client/src/pages/HomePage.jsx` | Vite production build | Verified |
| REQ-FE-03 | Room listing page with category, price, and date filters | `client/src/pages/RoomsPage.jsx` | Filter query parameters & sorting | Verified |
| REQ-FE-04 | Room details page with image gallery, amenities, and booking modal | `client/src/pages/RoomDetailsPage.jsx` | Component integration | Verified |
| REQ-FE-05 | Login and Registration pages with 1-click demo login buttons | `client/src/pages/LoginPage.jsx`, `RegisterPage.jsx` | Fast test credential fill | Verified |
| REQ-FE-06 | About & Contact pages | `client/src/pages/AboutPage.jsx`, `ContactPage.jsx` | Public route accessibility | Verified |

---

## 7. Customer Dashboard

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-CUST-01 | Personalized welcome dashboard (`UserHome`) | `client/src/pages/customer/UserHome.jsx` | Logged-in customer view | Verified |
| REQ-CUST-02 | My Bookings list with status badges & filter tabs | `client/src/pages/customer/MyBookings.jsx` | Automated & UI retrieval | Verified |
| REQ-CUST-03 | Detailed booking view with cancellation action | `client/src/pages/customer/MyBookings.jsx` | Automated cancel test | Verified |
| REQ-CUST-04 | Printable receipt modal with itemized taxes | `client/src/components/booking/InvoiceModal.jsx` | Component rendering | Verified |

---

## 8. Admin Dashboard

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-ADM-01 | Tabbed Admin Dashboard (`AdminDashboard`) | `client/src/pages/admin/AdminDashboard.jsx` | Tab navigation test | Verified |
| REQ-ADM-02 | Real metrics: room occupancy, active bookings, verified revenue | `server/controllers/adminController.js` | Automated test: `/api/admin/dashboard` | Verified |
| REQ-ADM-03 | Room management (List, Add Room with validation, Deactivate) | `client/src/pages/admin/AdminDashboard.jsx` | Automated test: room CRUD | Verified |
| REQ-ADM-04 | Booking management (status modification, guest search) | `client/src/pages/admin/AdminDashboard.jsx` | Automated test: status patch | Verified |
| REQ-ADM-05 | User management & role assignment | `client/src/pages/admin/AdminDashboard.jsx` | Automated test: role update to staff | Verified |
| REQ-ADM-06 | Reports & analytics charts (Chart.js / Recharts) | `client/src/pages/admin/AdminDashboard.jsx` | Monthly revenue & room pie charts | Verified |

---

## 9. Staff Operations Dashboard

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-STF-01 | Operational Staff Dashboard | `client/src/pages/staff/StaffDashboard.jsx` | Staff role restricted view | Verified |
| REQ-STF-02 | Guest Check-in & Check-out actions | `server/controllers/staffController.js` | Automated status transition | Verified |
| REQ-STF-03 | Room housekeeping status updates (Available, Cleaning, Maintenance) | `server/controllers/staffController.js` | Automated test: status to cleaning | Verified |
| REQ-STF-04 | Service request management (towels, room service, maintenance) | `client/src/pages/staff/StaffDashboard.jsx` | Service ticket lifecycle | Verified |

---

## 10. Notifications, File Uploads & Security

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-SEC-01 | Multer image upload with file type/size validation | `server/middleware/uploadMiddleware.js` | Multipart image handling | Verified |
| REQ-SEC-02 | Nodemailer email service with development fallback logger | `server/services/emailService.js` | Automated test: confirmation logger | Verified |
| REQ-SEC-03 | Security headers, CORS origin restrictions, input sanitization | `server/app.js` | CORS & middleware configuration | Verified |
| REQ-SEC-04 | Seeding script with realistic demo data (hotels, rooms, users, bookings) | `server/utils/seedData.js` | Automated seed execution | Verified |

---

## 11. Verification & Testing

| ID | Requirement | Implementation Target | Verification Method | Status |
|---|---|---|---|---|
| REQ-TST-01 | Backend automated tests (auth, rooms, booking overlap, pricing) | `server/tests/runTests.js` | `node server/tests/runTests.js` (22/22 Pass) | Verified |
| REQ-TST-02 | Frontend production build verification | `client/` | `npm --prefix client run build` (Exit code 0) | Verified |
| REQ-TST-03 | Complete manual end-to-end acceptance testing | Full stack | Guest -> Booking -> Payment -> Admin -> Staff | Verified |
