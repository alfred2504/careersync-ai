import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in the environment.");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn("Database connection failed:", error.message);

    if (error.name) {
      console.warn(`Error name: ${error.name}`);
    }

    if (error.code) {
      console.warn(`Error code: ${error.code}`);
    }

    if (error.reason) {
      console.warn("Connection reason:", error.reason);
    }

    console.warn("Starting server without a MongoDB connection.");
  }
};

export default connectDB;