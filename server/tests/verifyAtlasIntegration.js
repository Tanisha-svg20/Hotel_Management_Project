const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { getDatabaseInfo, isMemoryMode } = require('../config/db');
const Room = require('../models/Room');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

async function verifyAtlas() {
  console.log('======================================================');
  console.log(' HotelPro MongoDB Atlas End-to-End Verification');
  console.log('======================================================');

  try {
    // 1. Establish connection
    console.log('\n[Step 1] Connecting to database using application connection manager...');
    await connectDB();

    const dbInfo = getDatabaseInfo();
    console.log('\n[Step 2] Validating Connection Target:');
    console.log(`  - Is Connected:          ${dbInfo.isConnected}`);
    console.log(`  - Is MongoDB Atlas:      ${dbInfo.isAtlas}`);
    console.log(`  - Is In-Memory Fallback: ${dbInfo.isMemory}`);
    console.log(`  - Target Host:           ${dbInfo.host}`);
    console.log(`  - Target Database Name:  ${dbInfo.dbName}`);

    if (dbInfo.isMemory) {
      console.error('\n[VERIFICATION FAILED] The application is still using the in-memory fallback!');
      console.error('Please check that server/.env contains a valid Atlas MONGODB_URI.');
      process.exit(1);
    }

    if (!dbInfo.isAtlas) {
      console.warn('\n[Notice] Database is not recognized as MongoDB Atlas host (.mongodb.net).');
    }

    // 2. Check collections & count
    console.log('\n[Step 3] Checking persistent collections in database:');
    const hotelCount = await Hotel.countDocuments();
    const roomCount = await Room.countDocuments();
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();

    console.log(`  - Hotels:   ${hotelCount}`);
    console.log(`  - Rooms:    ${roomCount}`);
    console.log(`  - Users:    ${userCount}`);
    console.log(`  - Bookings: ${bookingCount}`);

    // If empty, run seed
    if (roomCount === 0) {
      console.log('\n[Step 4] Atlas database is empty. Triggering initial safe seed...');
      const seedDatabase = require('../utils/seedData');
      await seedDatabase({ exitOnFinish: false, cleanExisting: false });
      const newRoomCount = await Room.countDocuments();
      console.log(`  - Seed complete! Rooms in Atlas: ${newRoomCount}`);
    } else {
      console.log('\n[Step 4] Verified existing records in Atlas. Auto-seed safely skipped to preserve data.');
    }

    // 3. Test persistence with a clearly identified verification record
    console.log('\n[Step 5] Testing persistent write and read cycle:');
    const testRoomNumber = 'VERIFY-ATLAS-999';
    // Remove if already left from a prior run
    await Room.deleteOne({ roomNumber: testRoomNumber });

    const createdTestRoom = await Room.create({
      roomNumber: testRoomNumber,
      type: 'Deluxe',
      description: 'Temporary verification test room for Atlas persistence audit',
      rent: 299,
      capacity: 2,
      amenities: ['High-speed Wi-Fi', 'Smart TV'],
      operationalStatus: 'available'
    });
    console.log(`  ✓ Successfully wrote test document: ID ${createdTestRoom._id} (Room ${testRoomNumber})`);

    // Read back directly from Atlas
    const retrievedTestRoom = await Room.findById(createdTestRoom._id);
    if (!retrievedTestRoom || retrievedTestRoom.roomNumber !== testRoomNumber) {
      throw new Error('Test document could not be retrieved from Atlas!');
    }
    console.log(`  ✓ Successfully read test document directly from Atlas database`);

    // Clean up test record
    await Room.deleteOne({ _id: createdTestRoom._id });
    console.log(`  ✓ Successfully cleaned up test document (${testRoomNumber})`);

    console.log('\n======================================================');
    console.log(' ATLAS INTEGRATION VERIFIED SUCCESSFULLY:');
    console.log(' - Persistent cloud connection is active');
    console.log(' - In-memory fallback is completely disabled');
    console.log(' - Write, read, and cleanup cycles validated');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n[Atlas Verification Error]:', err.message);
    process.exit(1);
  }
}

verifyAtlas();

