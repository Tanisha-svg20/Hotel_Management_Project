const path = require('path');
// Ensure environment variables are loaded regardless of process working directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const mongoose = require('mongoose');

let cachedMemoryServer = null;
let isUsingMemoryServer = false;
let activeDatabaseInfo = {
  isConnected: false,
  isAtlas: false,
  isMemory: false,
  host: null,
  port: null,
  dbName: null
};

/**
 * Connects to MongoDB with clear distinction between:
 * 1. Persistent MongoDB Atlas cluster (mongodb+srv://...)
 * 2. Persistent Local MongoDB instance (mongodb://127.0.0.1:27017/...)
 * 3. Ephemeral In-Memory MongoDB instance (mongodb-memory-server) - ONLY for offline local fallback
 * 
 * Guaranteed to be idempotent: calling multiple times reuses the existing active connection.
 */
const connectDB = async () => {
  // 1. If Mongoose is already connected or connecting, reuse the existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    return mongoose.connection;
  }

  let rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro';
  rawUri = rawUri.trim();

  // Defensive parsing: strip duplicate "MONGODB_URI=" prefix if pasted by accident
  if (rawUri.startsWith('MONGODB_URI=')) {
    rawUri = rawUri.replace(/^MONGODB_URI=/, '').trim();
  }
  // Strip enclosing quotes if present
  if ((rawUri.startsWith('"') && rawUri.endsWith('"')) || (rawUri.startsWith("'") && rawUri.endsWith("'"))) {
    rawUri = rawUri.slice(1, -1).trim();
  }

  const uri = rawUri;

  const isAtlas = uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net');
  const isRemote = isAtlas || (!uri.includes('127.0.0.1') && !uri.includes('localhost'));
  const allowFallback = process.env.ALLOW_IN_MEMORY_FALLBACK === 'true' || 
                        (!isRemote && process.env.ALLOW_IN_MEMORY_FALLBACK !== 'false');

  // Sanitize URI for safe console logging (mask password if present)
  const sanitizedUri = uri.replace(/\/\/(.*?):(.*?)@/, '//***:***@');

  // Check for unreplaced placeholder tokens (e.g. <username>, <password>, <your-cluster>)
  if (uri.includes('<') && uri.includes('>')) {
    const errorMsg = 'Placeholder tokens (<...>) detected in MONGODB_URI. Please replace <username>, <password>, and cluster hostname with your actual MongoDB Atlas credentials.';
    console.error(`\n========================================================================`);
    console.error(` [MongoDB Configuration Error]`);
    console.error(` ${errorMsg}`);
    console.error(` Example of a real connection string:`);
    console.error(`   MONGODB_URI=mongodb+srv://hotelpro_admin:YourPass123@cluster0.abcde.mongodb.net/hotelpro?retryWrites=true&w=majority`);
    console.error(`========================================================================\n`);
    throw new Error(errorMsg);
  }

  // 2. Attempt direct connection to configured Persistent MongoDB
  try {
    const connectionTimeout = isAtlas ? 10000 : 3000;
    
    console.log(`[MongoDB] Connecting to: ${sanitizedUri}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: connectionTimeout,
      autoIndex: true
    });

    isUsingMemoryServer = false;
    const dbHost = conn.connection.host;
    const dbPort = conn.connection.port || (isAtlas ? 27017 : '');
    const dbName = conn.connection.name;

    activeDatabaseInfo = {
      isConnected: true,
      isAtlas: isAtlas || dbHost.includes('mongodb.net'),
      isMemory: false,
      host: dbHost,
      port: dbPort,
      dbName: dbName
    };

    console.log(`========================================================================`);
    if (activeDatabaseInfo.isAtlas) {
      console.log(` [MongoDB] PERSISTENT STORAGE: Successfully connected to MongoDB Atlas!`);
      console.log(` [MongoDB] Cluster Host: ${dbHost}`);
      console.log(` [MongoDB] Database:     ${dbName}`);
    } else {
      console.log(` [MongoDB] PERSISTENT STORAGE: Connected to Persistent Local MongoDB`);
      console.log(` [MongoDB] Host:         ${dbHost}:${dbPort}`);
      console.log(` [MongoDB] Database:     ${dbName}`);
    }
    console.log(`========================================================================`);

    if (dbName === 'test') {
      console.warn(`[MongoDB Warning] Connected to the default database 'test'.`);
      console.warn(`[MongoDB Tip] To save data to 'hotelpro', ensure your connection string includes '/hotelpro':`);
      console.warn(`  mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/hotelpro?retryWrites=true&w=majority`);
    }

    return conn;
  } catch (error) {
    // 3. Handle connection failure
    if (!allowFallback) {
      // Atlas / Remote / Fallback-disabled MUST NOT silently drop to in-memory!
      console.error(`\n========================================================================`);
      console.error(` [MongoDB Fatal] Failed to connect to Persistent Database (${sanitizedUri})`);
      console.error(` [Error Message] ${error.message}`);
      console.error(`------------------------------------------------------------------------`);
      console.error(` ACTIONABLE TROUBLESHOOTING GUIDE FOR MONGODB ATLAS:`);
      console.error(` 1. IP Whitelist (Network Access):`);
      console.error(`    - Open MongoDB Atlas -> Security -> Network Access.`);
      console.error(`    - Ensure your current public IP is listed with status 'Active'.`);
      console.error(`    - For local development, you can temporarily allow '0.0.0.0/0' (Allow anywhere).`);
      console.error(` 2. User Credentials (Database Access):`);
      console.error(`    - Verify your Database User username & password in server/.env.`);
      console.error(`    - Make sure you are using a Database User (Database Access), NOT your Atlas login email.`);
      console.error(`    - If your password contains special characters (@, :, ?, #, %), URL-encode them.`);
      console.error(` 3. Target Database Name:`);
      console.error(`    - Ensure the connection URI has '/hotelpro' before '?retryWrites=true'.`);
      console.error(` 4. Ephemeral In-Memory Fallback was NOT triggered because persistent mode is required.`);
      console.error(`========================================================================\n`);

      activeDatabaseInfo = {
        isConnected: false,
        isAtlas,
        isMemory: false,
        host: null,
        port: null,
        dbName: null
      };

      throw error;
    }

    // 4. Fallback to singleton In-Memory MongoDB ONLY for local default development
    console.warn(`[MongoDB] Notice: Direct connection to local '${sanitizedUri}' failed (${error.code || error.message}).`);
    console.warn(`[MongoDB] A local MongoDB daemon was not detected at ${sanitizedUri}.`);

    try {
      if (!cachedMemoryServer) {
        console.log('[MongoDB] Initializing single-instance In-Memory MongoDB fallback for local testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        cachedMemoryServer = await MongoMemoryServer.create();
      }

      const memoryUri = cachedMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      isUsingMemoryServer = true;

      activeDatabaseInfo = {
        isConnected: true,
        isAtlas: false,
        isMemory: true,
        host: '127.0.0.1 (In-Memory)',
        port: conn.connection.port,
        dbName: conn.connection.name
      };

      console.log(`[MongoDB] Connected to In-Memory MongoDB instance at: ${memoryUri}`);
      console.log(`[MongoDB] NOTE: You are currently running in EPHEMERAL DEVELOPMENT MODE.`);
      console.log(`[MongoDB] Data will NOT persist on disk after the server process exits.`);
      console.log(`[MongoDB] To enable persistent storage: Set MONGODB_URI in server/.env to your MongoDB Atlas connection string.`);

      return conn;
    } catch (fallbackErr) {
      console.error('[MongoDB] Critical: Could not establish any MongoDB connection:', fallbackErr.message);
      activeDatabaseInfo = { isConnected: false, isAtlas: false, isMemory: false };
      throw fallbackErr;
    }
  }
};

const isMemoryMode = () => isUsingMemoryServer;
const getDatabaseInfo = () => ({ ...activeDatabaseInfo });

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (cachedMemoryServer) {
    await cachedMemoryServer.stop();
    cachedMemoryServer = null;
    isUsingMemoryServer = false;
  }
  activeDatabaseInfo = { isConnected: false, isAtlas: false, isMemory: false };
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.isMemoryMode = isMemoryMode;
module.exports.getDatabaseInfo = getDatabaseInfo;
module.exports.disconnectDB = disconnectDB;
