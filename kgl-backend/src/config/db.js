/**
 * File purpose: Initializes MongoDB connection for the backend service.
 */
const mongoose = require("mongoose");

module.exports = async function connectDb() {
  const env = globalThis.process?.env || {};
  
  // Local default DB for development, override in production via MONGO_URI.
  const uri = env.MONGO_URI || "mongodb://127.0.0.1:27017/kgl";
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};
