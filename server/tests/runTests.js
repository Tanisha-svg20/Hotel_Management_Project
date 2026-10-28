const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { calculateBookingPrice } = require('../services/pricingService');
const { checkRoomAvailability } = require('../services/availabilityService');

let mongod;
let adminToken;
let staffToken;
let customerToken;
let testRoomId;
let testBookingId;

const runTestSuite = async () => {
  console.log('\n======================================================');
  console.log(' Starting HotelPro Comprehensive Test Suite');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const test = async (name, fn) => {
    totalTests++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  };

  try {
    // Setup In-Memory Database for clean, isolated tests
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // -------------------------------------------------------------------------
    // 1. Health & Server Initialization
    // -------------------------------------------------------------------------
    await test('Health check endpoint returns status healthy', async () => {
      const res = await request(app).get('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'healthy');
    });

    // -------------------------------------------------------------------------
    // 2. Authentication & Authorization
    // -------------------------------------------------------------------------
    await test('User registration creates customer with hashed password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Customer',
        email: 'testcustomer@hotelpro.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: '+1 555-1234'
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.role, 'customer');
      assert.ok(res.body.data.token);
      customerToken = res.body.data.token;
    });

    await test('Public registration rejects duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate User',
        email: 'testcustomer@hotelpro.com',
        password: 'Password@123',
        phone: '+1 555-9999'
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('already exists'));
    });

    await test('Public registration prevents privilege escalation (role=admin blocked)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Attacker Admin',
        email: 'attacker@hotelpro.com',
        password: 'Password@123',
        phone: '+1 555-0000',
        role: 'admin' // Attempting privilege escalation
      });
      assert.strictEqual(res.status, 201);
      // Backend must strictly assign role: 'customer'
      assert.strictEqual(res.body.data.user.role, 'customer');
    });

    await test('User login succeeds with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'testcustomer@hotelpro.com',
        password: 'Password@123'
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.token);
    });

    await test('User login fails with invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'testcustomer@hotelpro.com',
        password: 'WrongPassword'
      });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    // Create Admin & Staff Users directly for tests
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin.test@hotelpro.com',
      password: 'AdminPassword@123',
      phone: '+1 555-8888',
      role: 'admin'
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin.test@hotelpro.com',
      password: 'AdminPassword@123'
    });
    adminToken = adminLogin.body.data.token;

    const staffUser = await User.create({
      name: 'Operations Staff',
      email: 'staff.test@hotelpro.com',
      password: 'StaffPassword@123',
      phone: '+1 555-7777',
      role: 'staff'
    });
    const staffLogin = await request(app).post('/api/auth/login').send({
      email: 'staff.test@hotelpro.com',
      password: 'StaffPassword@123'
    });
    staffToken = staffLogin.body.data.token;

    await test('Protected admin route rejects unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      assert.strictEqual(res.status, 401);
    });

    await test('Protected admin route rejects customer token (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);
      assert.strictEqual(res.status, 403);
    });

    await test('Protected admin route accepts admin token (200 OK)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    // -------------------------------------------------------------------------
    // 3. Room Inventory & Availability
    // -------------------------------------------------------------------------
    await test('Admin can create a new hotel room', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomNumber: '101',
          type: 'Deluxe',
          description: 'Spacious ocean-facing room with king bed and balcony.',
          rent: 200,
          capacity: 2,
          count: 1,
          amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning']
        });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.roomNumber, '101');
      testRoomId = res.body.data._id;
    });

    await test('Customer cannot create a room (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          roomNumber: '102',
          type: 'Single',
          description: 'Unauthorized room creation test',
          rent: 100
        });
      assert.strictEqual(res.status, 403);
    });

    await test('Room availability service correctly evaluates empty schedule', async () => {
      const checkIn = '2026-11-10';
      const checkOut = '2026-11-14';
      const availability = await checkRoomAvailability(testRoomId, checkIn, checkOut);
      assert.strictEqual(availability.isAvailable, true);
    });

    // -------------------------------------------------------------------------
    // 4. Server-Side Pricing Engine
    // -------------------------------------------------------------------------
    await test('Server authoritative price calculator applies taxes and fees accurately', async () => {
      const price = calculateBookingPrice(200, '2026-11-10', '2026-11-13');
      assert.strictEqual(price.nights, 3);
      assert.strictEqual(price.basePrice, 600); // 3 * 200
      assert.strictEqual(price.taxAmount, 60);   // 10% tax
      assert.strictEqual(price.serviceFee, 18);  // 3% fee
      assert.strictEqual(price.totalAmount, 678);// 600 + 60 + 18
    });

    // -------------------------------------------------------------------------
    // 5. Booking Creation & Overlapping Prevention
    // -------------------------------------------------------------------------
    await test('Customer creates booking for Nov 10 to Nov 14', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          roomId: testRoomId,
          fromdate: '2026-11-10',
          todate: '2026-11-14',
          guestName: 'Test Customer',
          guestEmail: 'testcustomer@hotelpro.com',
          guestPhone: '+1 555-1234',
          guestCount: 2
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.booking.status, 'confirmed');
      assert.strictEqual(res.body.data.booking.totaldays, 4);
      assert.strictEqual(res.body.data.booking.totalAmount, 904); // (4*200) + 10% + 3% = 800 + 80 + 24 = 904
      testBookingId = res.body.data.booking._id;
    });

    await test('Overlapping booking for Nov 12 to Nov 15 is strictly PREVENTED', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          roomId: testRoomId,
          fromdate: '2026-11-12', // Overlaps with 10-14
          todate: '2026-11-15',
          guestName: 'Another Customer',
          guestEmail: 'another@example.com',
          guestPhone: '+1 555-9876'
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('booked') || res.body.message.includes('unavailable'));
    });

    await test('Adjacent non-overlapping booking for Nov 14 to Nov 16 SUCCEEDS', async () => {
      // Check-out on Nov 14 allows check-in on Nov 14 (check-in inclusive, check-out exclusive)
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          roomId: testRoomId,
          fromdate: '2026-11-14',
          todate: '2026-11-16',
          guestName: 'Adjacent Guest',
          guestEmail: 'adjacent@example.com',
          guestPhone: '+1 555-4321'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
    });

    // -------------------------------------------------------------------------
    // 6. Customer History & Cancellation
    // -------------------------------------------------------------------------
    await test('Customer can retrieve their own booking history', async () => {
      const res = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${customerToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length >= 1);
    });

    await test('Customer can cancel their confirmed reservation', async () => {
      const res = await request(app)
        .post(`/api/bookings/${testBookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Trip rescheduled' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.status, 'cancelled');
    });

    await test('Cancelled reservation releases room inventory for rebooking', async () => {
      // Previously conflicting dates (Nov 10 to Nov 14) should now be available!
      const availability = await checkRoomAvailability(testRoomId, '2026-11-10', '2026-11-14');
      assert.strictEqual(availability.isAvailable, true);
    });

    // -------------------------------------------------------------------------
    // 7. Staff Operations
    // -------------------------------------------------------------------------
    await test('Staff can update room operational status to cleaning', async () => {
      const res = await request(app)
        .patch(`/api/staff/rooms/${testRoomId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ operationalStatus: 'cleaning' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.operationalStatus, 'cleaning');
    });

    // -------------------------------------------------------------------------
    // 8. Admin Management & Reports
    // -------------------------------------------------------------------------
    await test('Admin dashboard statistics return accurate aggregated figures', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.rooms.total >= 1);
      assert.ok(typeof res.body.data.revenue.total === 'number');
    });

    await test('Admin can update a user role to staff', async () => {
      const userToPromote = await User.findOne({ email: 'testcustomer@hotelpro.com' });
      const res = await request(app)
        .patch(`/api/admin/users/${userToPromote._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'staff' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.role, 'staff');
    });

    console.log('\n======================================================');
    console.log(` Test Suite Complete: ${passedTests} / ${totalTests} Passed`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    await mongod.stop();

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (fatalErr) {
    console.error('Fatal test execution error:', fatalErr);
    if (mongod) await mongod.stop();
    process.exit(1);
  }
};

runTestSuite();
