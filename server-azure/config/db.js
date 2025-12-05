const mongoose = require("mongoose");

let isConnected = false;

module.exports = async function connectDB() {
  if (isConnected) {
    return; // Use existing connection
  }

  try {
    await mongoose.connect(process.env.COSMOS_CONNECTION_STR, {
      dbName: "visitors-data", // Forces connection to your Terraform-created DB
    });
    isConnected = true;
    console.log("MongoDB Connected via Mongoose");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
