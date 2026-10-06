const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vquiz';
  
  try {
    // Attempt fast connection with 2.5s timeout
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}).`);
    console.log(`⚡ V-Quiz active in Standalone Adaptive Storage mode (zero external database dependency required).`);
  }
};

const getStatus = () => isMongoConnected;

module.exports = { connectDB, getStatus };
