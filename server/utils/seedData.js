const path = require('path');
// Ensure environment variables are loaded regardless of current working directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const connectDB = require('../config/db');

/**
 * Seeds baseline hotel, rooms, users, and sample operations.
 * 
 * @param {boolean|object} [options] 
 *   - exitOnFinish: whether to terminate process on completion (default: true for CLI, false for programmatic)
 *   - cleanExisting: whether to wipe collections before inserting (default: true for CLI, false for auto-seed)
 */
const seedDatabase = async (options = {}) => {
  const exitOnFinish = typeof options === 'boolean' ? options : (options.exitOnFinish ?? false);
  const cleanExisting = typeof options === 'object' && options.cleanExisting !== undefined ? options.cleanExisting : (typeof options === 'boolean' ? options : true);

  try {
    // 1. Ensure database connection is active (reuse existing connection if already connected)
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Establishing database connection...');
      await connectDB();
    } else {
      console.log('[Seed] Reusing active database connection.');
    }

    // 2. Clean existing data only if explicitly requested (e.g. manual CLI seed)
    if (cleanExisting) {
      if (process.env.NODE_ENV === 'production' && process.env.CONFIRM_PRODUCTION_WIPE !== 'true') {
        throw new Error('[Seed] Safety Guard: Cannot wipe database in production mode without CONFIRM_PRODUCTION_WIPE=true');
      }
      console.log('[Seed] Clearing existing demo collections...');
      await User.deleteMany();
      await Hotel.deleteMany();
      await Room.deleteMany();
      await Booking.deleteMany();
      await Payment.deleteMany();
      await Review.deleteMany();
      await ServiceRequest.deleteMany();
    } else {
      // If auto-seeding without cleanExisting, check if data already exists to prevent duplicate seeding
      const existingRooms = await Room.countDocuments();
      if (existingRooms > 0) {
        console.log(`[Seed] Database already contains ${existingRooms} rooms. Skipping duplicate seeding.`);
        if (exitOnFinish) process.exit(0);
        return;
      }
    }

    console.log('[Seed] Creating Hotel...');
    const hotel = await Hotel.create({
      name: 'HotelPro Grand Resort & Spa',
      description: 'An idyllic coastal haven offering world-class luxury accommodations, oceanfront fine dining, private beach club access, and serene wellness retreats.',
      address: '777 Ocean Drive, Marina Boulevard',
      city: 'Miami Beach',
      country: 'United States',
      phone: '+1 (305) 555-0199',
      email: 'concierge@hotelpro.com',
      amenities: [
        'High-speed Wi-Fi',
        'Infinity Swimming Pool',
        'Holistic Spa & Sauna',
        'Valet Parking',
        'Michelin-Star Restaurant',
        '24/7 Room Service',
        'Beachfront Cabanas',
        'Fitness & Wellness Center'
      ],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
      ],
      isActive: true
    });

    console.log('[Seed] Creating Demo Users...');
    // Password hashing handled automatically by User schema pre-save hook
    const adminUser = await User.create({
      name: 'Alexander Sterling (Admin)',
      email: 'admin@hotelpro.com',
      password: 'Admin@123',
      phone: '+1 (555) 010-0001',
      role: 'admin',
      status: 'active'
    });

    const staffUser = await User.create({
      name: 'Elena Rostova (Front Desk)',
      email: 'staff@hotelpro.com',
      password: 'Staff@123',
      phone: '+1 (555) 010-0002',
      role: 'staff',
      status: 'active'
    });

    const customerUser = await User.create({
      name: 'Jonathan Miller',
      email: 'customer@hotelpro.com',
      password: 'User@123',
      phone: '+1 (555) 010-0003',
      role: 'customer',
      status: 'active'
    });

    const customerJane = await User.create({
      name: 'Jane Elizabeth Watson',
      email: 'jane@example.com',
      password: 'User@123',
      phone: '+1 (555) 010-0004',
      role: 'customer',
      status: 'active'
    });

    console.log('[Seed] Creating Rooms...');
    const roomData = [
      {
        hotel: hotel._id,
        roomNumber: '101',
        type: 'Single',
        description: 'Chic and serene sanctuary tailored for business travelers and solo explorers. Features an ergonomic workspace, plush queen bed, and garden view.',
        rent: 140,
        capacity: 1,
        count: 1,
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Espresso Machine', 'Work Desk'],
        photos: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
        ],
        operationalStatus: 'available'
      },
      {
        hotel: hotel._id,
        roomNumber: '202',
        type: 'Double',
        description: 'Spacious and gracefully designed room with panoramic views of the landscaped courtyard. Features a handcrafted king bed and Italian marble bathroom.',
        rent: 210,
        capacity: 2,
        count: 1,
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Italian Marble Bath', 'Balcony', 'Mini Bar'],
        photos: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
        ],
        operationalStatus: 'available'
      },
      {
        hotel: hotel._id,
        roomNumber: '305',
        type: 'Deluxe',
        description: 'Immaculate seaside deluxe room with a private sun terrace overlooking turquoise waters. Includes luxury bath amenities, rainfall shower, and lounge corner.',
        rent: 320,
        capacity: 2,
        count: 1,
        amenities: ['High-speed Wi-Fi', 'Ocean View Balcony', 'Rainfall Shower', 'King Size Bed', 'Espresso Bar', '24/7 Room Service'],
        photos: [
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
        ],
        operationalStatus: 'available'
      },
      {
        hotel: hotel._id,
        roomNumber: '401',
        type: 'Suite',
        description: 'Opulent corner suite featuring a separate living salon, dining area, jacuzzi bath, and sweeping dual-aspect horizon views of the coastline.',
        rent: 480,
        capacity: 4,
        count: 1,
        amenities: ['Private Living Room', 'Whirlpool Tub', 'Panoramic Windows', 'Butler Service', 'High-speed Wi-Fi', 'Complimentary Champagne'],
        photos: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
        ],
        operationalStatus: 'available'
      },
      {
        hotel: hotel._id,
        roomNumber: '502',
        type: 'Family Suite',
        description: 'A grand multi-room family residence with interconnecting suites, gaming lounge for children, and expansive balcony overlooking the grand pool.',
        rent: 420,
        capacity: 5,
        count: 1,
        amenities: ['Two Master Bedrooms', 'Kids Entertainment Hub', 'Two Bathrooms', 'Kitchenette', 'High-speed Wi-Fi', 'Balcony'],
        photos: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
        ],
        operationalStatus: 'available'
      },
      {
        hotel: hotel._id,
        roomNumber: 'PH-1',
        type: 'Presidential Suite',
        description: 'The pinnacle of luxury hospitality. Private rooftop infinity plunge pool, private elevator access, 24-hour dedicated chef and butler, and panoramic 360-degree ocean views.',
        rent: 890,
        capacity: 6,
        count: 1,
        amenities: ['Private Rooftop Pool', 'Dedicated Butler & Chef', 'Grand Piano Salon', 'Steam Room & Sauna', 'Helipad Access', 'VIP Airport Transfer'],
        photos: [
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
        ],
        operationalStatus: 'available'
      }
    ];

    const createdRooms = await Room.insertMany(roomData);
    console.log(`[Seed] Created ${createdRooms.length} rooms.`);

    console.log('[Seed] Creating Sample Bookings & Payments...');
    // Booking 1: Upcoming confirmed booking for Jonathan Miller
    const checkIn1 = new Date();
    checkIn1.setDate(checkIn1.getDate() + 5);
    checkIn1.setHours(0, 0, 0, 0);
    const checkOut1 = new Date(checkIn1);
    checkOut1.setDate(checkOut1.getDate() + 3);

    const booking1 = await Booking.create({
      bookingId: 'HP-BK-20261101-9A4B',
      user: customerUser._id,
      room: createdRooms[1]._id, // Room 202 ($210/night)
      fromdate: checkIn1,
      todate: checkOut1,
      totaldays: 3,
      nightlyPriceSnapshot: 210,
      totalAmount: 711.90, // (210*3) + 10% tax + 3% fee
      guestName: customerUser.name,
      guestEmail: customerUser.email,
      guestPhone: customerUser.phone,
      guestCount: 2,
      specialRequests: 'Late arrival around 8:00 PM. High floor preferred.',
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    await Payment.create({
      booking: booking1._id,
      user: customerUser._id,
      provider: 'dev_adapter',
      transactionId: 'TX-DEV-20261101-78912',
      amount: 711.90,
      currency: 'USD',
      status: 'completed',
      cardLast4: '4242',
      receiptNumber: 'REC-2026-004128'
    });

    // Booking 2: Currently active checked-in booking for Jane
    const checkIn2 = new Date();
    checkIn2.setDate(checkIn2.getDate() - 1);
    checkIn2.setHours(0, 0, 0, 0);
    const checkOut2 = new Date();
    checkOut2.setDate(checkOut2.getDate() + 2);
    checkOut2.setHours(0, 0, 0, 0);

    const booking2 = await Booking.create({
      bookingId: 'HP-BK-20261027-C381',
      user: customerJane._id,
      room: createdRooms[2]._id, // Room 305 ($320/night)
      fromdate: checkIn2,
      todate: checkOut2,
      totaldays: 3,
      nightlyPriceSnapshot: 320,
      totalAmount: 1084.80,
      guestName: customerJane.name,
      guestEmail: customerJane.email,
      guestPhone: customerJane.phone,
      guestCount: 2,
      status: 'checked-in',
      paymentStatus: 'paid'
    });

    await Payment.create({
      booking: booking2._id,
      user: customerJane._id,
      provider: 'dev_adapter',
      transactionId: 'TX-DEV-20261027-99182',
      amount: 1084.80,
      currency: 'USD',
      status: 'completed',
      cardLast4: '5521',
      receiptNumber: 'REC-2026-003892'
    });

    // Mark room 305 operationalStatus to occupied
    await Room.findByIdAndUpdate(createdRooms[2]._id, { operationalStatus: 'occupied' });

    // Booking 3: Past completed stay
    const pastCheckIn = new Date();
    pastCheckIn.setDate(pastCheckIn.getDate() - 10);
    pastCheckIn.setHours(0, 0, 0, 0);
    const pastCheckOut = new Date();
    pastCheckOut.setDate(pastCheckOut.getDate() - 7);
    pastCheckOut.setHours(0, 0, 0, 0);

    const booking3 = await Booking.create({
      bookingId: 'HP-BK-20261018-88F2',
      user: customerUser._id,
      room: createdRooms[0]._id, // Room 101 ($140/night)
      fromdate: pastCheckIn,
      todate: pastCheckOut,
      totaldays: 3,
      nightlyPriceSnapshot: 140,
      totalAmount: 474.60,
      guestName: customerUser.name,
      guestEmail: customerUser.email,
      guestPhone: customerUser.phone,
      guestCount: 1,
      status: 'checked-out',
      paymentStatus: 'paid'
    });

    await Payment.create({
      booking: booking3._id,
      user: customerUser._id,
      provider: 'dev_adapter',
      transactionId: 'TX-DEV-20261018-11234',
      amount: 474.60,
      currency: 'USD',
      status: 'completed',
      cardLast4: '4242',
      receiptNumber: 'REC-2026-002914'
    });

    // Reviews
    await Review.create({
      user: customerUser._id,
      room: createdRooms[0]._id,
      rating: 5,
      title: 'Unbelievable hospitality and peace!',
      comment: 'The room was pristine, fast Wi-Fi made my remote workday seamless, and the espresso machine in the room was top notch.'
    });

    await Review.create({
      user: customerJane._id,
      room: createdRooms[2]._id,
      rating: 5,
      title: 'The ocean terrace view is unmatched',
      comment: 'Waking up to the sunrise over the turquoise water was unforgettable. Staff was remarkably polite and attentive.'
    });

    // Service requests
    await ServiceRequest.create({
      room: createdRooms[2]._id,
      requestedBy: customerJane._id,
      assignedTo: staffUser._id,
      type: 'amenities',
      priority: 'medium',
      description: 'Extra plush towels and down pillows requested for Room 305.',
      status: 'in_progress'
    });

    console.log('[Seed] Database seeded successfully with demo records!');
    console.log('------------------------------------------------------------------------');
    console.log('Created Seed Records Summary:');
    console.log('  - Hotel:            1 Resort Profile (HotelPro Grand Resort & Spa)');
    console.log('  - Users:            3 Accounts (Admin, Staff, Customer)');
    console.log('  - Rooms:            6 Inventory Units (Single, Double, Deluxe, Suite, etc.)');
    console.log('  - Bookings:         2 Sample Bookings with Paid Transactions');
    console.log('  - Reviews:          2 Verified Guest Ratings & Feedback');
    console.log('  - Service Requests: 1 Amenity Request Assigned to Staff');
    console.log('========================================================================');
    console.log('Demo Login Credentials:');
    console.log('  Admin:    admin@hotelpro.com    / Admin@123');
    console.log('  Staff:    staff@hotelpro.com    / Staff@123');
    console.log('  Customer: customer@hotelpro.com / User@123');
    console.log('========================================================================');

    if (exitOnFinish) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Error seeding database:', error.message || error);
    if (exitOnFinish) {
      process.exit(1);
    }
    throw error;
  }
};

// If run directly from command line (npm run seed)
if (require.main === module) {
  seedDatabase({ exitOnFinish: true, cleanExisting: true });
}

module.exports = seedDatabase;
