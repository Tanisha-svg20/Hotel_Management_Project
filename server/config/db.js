const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Warning: Direct connection to ${uri} failed: ${error.message}`);
    
    // Attempt fallback or retry if configured
    try {
      console.log('[MongoDB] Checking for fallback connection...');
      // If mongodb-memory-server is installed, use it as local development fallback
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB fallback: ${memoryUri}`);
      return conn;
    } catch (fallbackErr) {
      console.error('[MongoDB] Critical: Could not establish MongoDB connection.');
      console.error('[MongoDB] Please ensure MongoDB is running or configure MONGODB_URI in server/.env');
      // Do not exit abruptly in dev mode so API diagnostic endpoints remain inspectable
      return null;
    }
  }
};

module.exports = connectDB;
