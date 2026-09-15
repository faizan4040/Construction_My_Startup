import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URI;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URI is missing");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null 
   };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: "Sport-Ecommerce",
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};

export default connectDB;







