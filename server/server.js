const path = require('path');
// Guarantee that environment variables are loaded regardless of current working directory
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8001;

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const Room = require('./models/Room');
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      console.log('[Server] Database is empty (0 rooms found). Initializing default seed data...');
      const seedDatabase = require('./utils/seedData');
      await seedDatabase({ exitOnFinish: false, cleanExisting: false });
    } else {
      console.log(`[Server] Database contains ${roomCount} rooms. Skipping auto-seed.`);
    }
  } catch (seedErr) {
    console.warn('[Server] Auto-seed check warning:', seedErr.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` HotelPro Server Running on Port ${PORT}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api`);
    console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('\n[Server Fatal] Startup aborted due to database connection error.');
  process.exit(1);
});
