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
      console.log('[Server] No rooms found in database. Initializing default seed data...');
      const seedDatabase = require('./utils/seedData');
      await seedDatabase(false);
    }
  } catch (seedErr) {
    console.warn('[Server] Auto-seed check warning:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` HotelPro Server Running on Port ${PORT}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api`);
    console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Failed to start server:', err.message);
});
