import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (uri) {
      console.log(`📡 Attempting to connect to MongoDB URI: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Successfully connected to MongoDB database.');
      return;
    }

    console.log('ℹ️ No MONGODB_URI found. Starting embedded MongoDB Memory Server for seamless instant development...');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'ffj_tree_aadhar'
      }
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`✅ Embedded MongoDB Memory Server started successfully at: ${memoryUri}`);
  } catch (error) {
    console.warn(`⚠️ Failed to connect to external MongoDB (${error.message}). Falling back to MongoMemoryServer...`);
    try {
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'ffj_tree_aadhar'
          }
        });
      }
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Fallback MongoMemoryServer connected successfully at: ${memoryUri}`);
    } catch (fallbackErr) {
      console.error('❌ Critical MongoDB connection failure:', fallbackErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
