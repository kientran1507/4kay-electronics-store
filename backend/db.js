const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required. Copy .env.example to backend/.env and configure it.");
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB.");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

module.exports = mongoose;
