const mongoose = require("mongoose");

/**
 * Connect to MongoDB using Mongoose.
 * Exits the process if the connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn(`⚠️  Server will continue without database. Some features may not work.`);
  }
};

module.exports = connectDB;
