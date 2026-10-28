# HotelPro — RESTful API Documentation

All API responses follow a standardized JSON envelope structure:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```
Errors return:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (name, email, password, phone). Defaults to `customer`. |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials, returns signed JWT & user profile. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve currently authenticated user profile. |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name and phone. |

---

## 2. Rooms & Availability (`/api/rooms`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/rooms` | Public | Query rooms with filters: `type`, `minPrice`, `maxPrice`, `capacity`, `fromdate`, `todate`. |
| `GET` | `/api/rooms/:id` | Public | Get single room details, amenities, photos, and current availability status. |
| `GET` | `/api/rooms/check-availability` | Public | Check room availability for a specific room and date range (`fromdate`, `todate`). |
| `POST` | `/api/rooms` | Admin | Create a new room with image upload support. |
| `PUT` | `/api/rooms/:id` | Admin | Update room details, price, capacity, or amenities. |
| `DELETE` | `/api/rooms/:id` | Admin | Deactivate/delete room (with protection against active bookings). |

---

## 3. Bookings (`/api/bookings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Authenticated (Customer) | Create a reservation after verifying room availability and calculating pricing. |
| `GET` | `/api/bookings/my` | Authenticated (Customer) | Retrieve personal booking history with status badges and payment summary. |
| `GET` | `/api/bookings/:id` | Authenticated (Customer/Admin/Staff) | Retrieve full booking details, guest info, and receipt. |
| `POST` | `/api/bookings/:id/cancel` | Authenticated (Customer/Admin) | Cancel eligible booking, release room calendar, initiate refund if eligible. |

---

## 4. Payments (`/api/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-intent` | Authenticated | Initialize payment session (Stripe client secret or Dev Adapter token). |
| `POST` | `/api/payments/verify` | Authenticated | Confirm payment success idempotently and link transaction to booking. |
| `GET` | `/api/payments/receipt/:bookingId`| Authenticated | Retrieve transaction receipt and printable invoice metadata. |

---

## 5. Administration (`/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | High-level statistics: total rooms, occupancy, total bookings, verified revenue. |
| `GET` | `/api/admin/bookings` | Admin | List all bookings across the platform with search, status filters, and pagination. |
| `PATCH`| `/api/admin/bookings/:id/status` | Admin | Update booking status (`confirmed`, `cancelled`, `checked-out`). |
| `GET` | `/api/admin/users` | Admin | List all registered users. |
| `PATCH`| `/api/admin/users/:id/role` | Admin | Update user role (`customer`, `staff`, `admin`). |
| `GET` | `/api/admin/reports` | Admin | Detailed analytics: monthly revenue breakdown, occupancy rate, room-type popularity. |

---

## 6. Staff Operations (`/api/staff`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/staff/overview` | Staff / Admin | Today's expected check-ins, check-outs, and pending service tickets. |
| `GET` | `/api/staff/bookings` | Staff / Admin | Search guest reservations for front-desk check-in/out. |
| `POST` | `/api/staff/bookings/:id/check-in` | Staff / Admin | Process guest check-in (marks room occupied). |
| `POST` | `/api/staff/bookings/:id/check-out`| Staff / Admin | Process guest check-out (marks room cleaning). |
| `GET` | `/api/staff/rooms` | Staff / Admin | Room operational status dashboard. |
| `PATCH`| `/api/staff/rooms/:id/status` | Staff / Admin | Change operational status (`available`, `cleaning`, `maintenance`, `occupied`). |
| `GET` | `/api/staff/services` | Staff / Admin | List open housekeeping and guest service requests. |
| `POST` | `/api/staff/services` | Staff / Admin / Guest | Create a new service request. |
| `PATCH`| `/api/staff/services/:id/status` | Staff / Admin | Update service request status (`pending`, `in_progress`, `resolved`). |

