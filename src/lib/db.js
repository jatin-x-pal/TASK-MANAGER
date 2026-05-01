import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  let uri = process.env.MONGODB_URI;
  const maskedURI = uri ? uri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
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

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB Atlas');
      return mongoose;
    }).catch(async (error) => {
      console.warn('Failed to connect to MongoDB Atlas. Error:', error.message);
      console.warn('Falling back to local in-memory MongoDB server for development...');
      
      try {
        if (!mongoServer) {
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
