# HotelPro — Database Design & Data Models

## 1. Entity Relationship Overview

The HotelPro database uses MongoDB with Mongoose ODM. Collections are structured according to a normalized model with targeted embedded snapshots for historical auditability (such as prices at the time of booking).

```mermaid
erDiagram
    USER ||--o{ BOOKING : "places"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ NOTIFICATION : "receives"
    HOTEL ||--o{ ROOM : "contains"
    ROOM ||--o{ BOOKING : "reserved in"
    ROOM ||--o{ REVIEW : "reviewed in"
    ROOM ||--o{ SERVICE_REQUEST : "located in"
    BOOKING ||--|| PAYMENT : "settled by"
    BOOKING ||--o| CHECK_RECORD : "records"
    STAFF ||--o{ SERVICE_REQUEST : "assigned to"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string phone
        string role "customer | staff | admin"
        string status "active | suspended"
        date createdAt
    }

    HOTEL {
        ObjectId _id PK
        string name
        string description
        string address
        string city
        string country
        string[] amenities
        string[] images
        boolean isActive
    }

    ROOM {
        ObjectId _id PK
        ObjectId hotel FK
        string roomNumber
        string type "Single | Double | Deluxe | Suite | Presidential"
        string description
        number rent "nightly rate"
        number capacity
        string[] amenities
        string[] photos
        string operationalStatus "available | occupied | cleaning | maintenance"
        boolean isActive
    }

    BOOKING {
        ObjectId _id PK
        string bookingId UK
        ObjectId user FK
        ObjectId room FK
        date fromdate "Check-in"
        date todate "Check-out"
        number totaldays
        number nightlyPriceSnapshot
        number totalAmount
        string status "pending | confirmed | checked-in | checked-out | cancelled"
        string guestName
        string guestEmail
        string guestPhone
        date createdAt
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId booking FK
        ObjectId user FK
        string provider "stripe | razorpay | dev_adapter"
        string transactionId UK
        number amount
        string currency
        string status "pending | completed | failed | refunded"
        date paidAt
    }

    SERVICE_REQUEST {
        ObjectId _id PK
        ObjectId room FK
        ObjectId requestedBy FK
        ObjectId assignedTo FK
        string type "housekeeping | maintenance | room_service | amenities"
        string description
        string priority "low | medium | high | urgent"
        string status "pending | in_progress | resolved"
        date createdAt
    }
```

---

## 2. Core Mongoose Schemas

### 2.1 Users Collection (`users`)
- `name` (String, required, trim)
- `email` (String, required, unique, lowercase, trim)
- `password` (String, required, minlength 6)
- `phone` (String, required)
- `role` (String, enum: `['customer', 'staff', 'admin']`, default: `'customer'`)
- `status` (String, enum: `['active', 'suspended']`, default: `'active'`)
- `timestamps`: true

### 2.2 Rooms Collection (`rooms`)
- `hotel`: ObjectId -> `Hotel`
- `roomNumber`: String, required, unique per hotel
- `type`: String, enum: `['Single', 'Double', 'Deluxe', 'Suite', 'Family Suite']`
- `description`: String, required
- `rent`: Number, required (price per night in USD)
- `capacity`: Number, required (default: 2)
- `amenities`: [String] (e.g., `["WiFi", "AC", "TV", "Mini Bar", "Balcony"]`)
- `photos`: [String] (URLs or upload filenames)
- `operationalStatus`: String, enum: `['available', 'occupied', 'cleaning', 'maintenance']`, default: `'available'`
- `isActive`: Boolean, default: true
- `timestamps`: true

### 2.3 Bookings Collection (`bookings`)
- `bookingId`: String, required, unique (e.g., `HP-BK-20261028-1234`)
- `user`: ObjectId -> `User`, required
- `room`: ObjectId -> `Room`, required
- `fromdate`: Date, required (Check-in, 00:00 UTC)
- `todate`: Date, required (Check-out, 00:00 UTC)
- `totaldays`: Number, required
- `nightlyPriceSnapshot`: Number, required
- `totalAmount`: Number, required
- `guestName`: String, required
- `guestEmail`: String, required
- `guestPhone`: String, required
- `status`: String, enum: `['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']`, default: `'confirmed'`
- `paymentStatus`: String, enum: `['unpaid', 'paid', 'refunded']`, default: `'paid'`
- `cancellationReason`: String
- `cancelledAt`: Date
- `timestamps`: true

### 2.4 Payments Collection (`payments`)
- `booking`: ObjectId -> `Booking`, required
- `user`: ObjectId -> `User`, required
- `provider`: String, enum: `['stripe', 'razorpay', 'dev_adapter']`, default: `'dev_adapter'`
- `transactionId`: String, required, unique
- `amount`: Number, required
- `currency`: String, default: `'USD'`
- `status`: String, enum: `['pending', 'completed', 'failed', 'refunded']`, default: `'completed'`
- `cardLast4`: String (optional masked display)
- `timestamps`: true

### 2.5 ServiceRequests Collection (`servicerequests`)
- `room`: ObjectId -> `Room`, required
- `requestedBy`: ObjectId -> `User`, required
- `assignedTo`: ObjectId -> `User` (Staff member)
- `type`: String, enum: `['housekeeping', 'maintenance', 'room_service', 'amenities', 'other']`
- `priority`: String, enum: `['low', 'medium', 'high', 'urgent']`, default: `'medium'`
- `description`: String, required
- `status`: String, enum: `['pending', 'in_progress', 'resolved']`, default: `'pending'`
- `notes`: String
- `timestamps`: true

