import mongoose from 'mongoose';

let mongoServer = null;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  let uri = process.env.MONGODB_URI || 'UNDEFINED_URI';
  const maskedURI = uri !== 'UNDEFINED_URI' ? uri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
  console.log('Attempting to connect to database:', maskedURI);

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      family: 4,
      serverSelectionTimeoutMS: 5000,
    };

    if (!uri) {
      console.warn('MONGODB_URI is not defined in environment variables.');
      uri = 'mongodb://localhost:27017/taskflow'; // Fallback to trigger the catch block below
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB Atlas');
      return mongoose;
    }).catch(async (error) => {
      console.warn('Failed to connect to MongoDB Atlas. Error:', error.message);
      
      // Never use MemoryServer in production (causes libcurl.so.4 errors on Railway)
      if (process.env.NODE_ENV === 'production' || !process.env.MONGODB_URI?.includes('mongodb')) {
         console.error('Critical: MongoDB connection failed in production.');
         throw error;
      }

      console.warn('Falling back to local in-memory MongoDB server for development...');
      
      try {
        if (!mongoServer) {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          mongoServer = await MongoMemoryServer.create();
        }
        uri = mongoServer.getUri();
        console.log('Started local in-memory MongoDB at', uri);
        
        return mongoose.connect(uri, opts);
      } catch (fallbackError) {
        console.error('Failed to start in-memory MongoDB:', fallbackError);
        throw fallbackError;
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
