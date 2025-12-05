const mongoose = require("mongoose");

let isConnected = false;

module.exports = async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.COSMOS_CONNECTION_STR, {
      dbName: "visitors-data", 
    });
    isConnected = true;
    console.log("MongoDB Connected via Mongoose");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
