import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    // Mask URI for logging
    const maskedURI = MONGODB_URI ? MONGODB_URI.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
    console.log(`[Database] Attempting connection to: ${maskedURI}`);

    if (!MONGODB_URI) {
      console.warn('[Database] MONGODB_URI is not defined. Falling back to local/memory server...');
    }

    cached.promise = mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/taskflow_temp', opts)
      .then((mongoose) => {
        console.log('[Database] MongoDB Connected Successfully');
        return mongoose;
      })
      .catch(async (error) => {
        console.error(`[Database] Connection Error: ${error.message}`);
        
        // Handle Authentication Errors Specifically
        if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
          console.error('[Database] CRITICAL: MongoDB Atlas authentication failed. Please check your credentials in .env');
        }

        // Fallback to In-Memory Database for development if not in production
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Database] --- STARTING IN SAFE MODE (In-Memory Database) ---');
          try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            console.log(`[Database] In-Memory MongoDB started at: ${uri}`);
            return mongoose.connect(uri, opts);
          } catch (memError) {
            console.error(`[Database] Failed to start In-Memory MongoDB: ${memError.message}`);
            throw memError;
          }
        } else {
          throw error;
        }
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

