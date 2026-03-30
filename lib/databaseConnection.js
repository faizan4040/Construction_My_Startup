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












// MONGODB_URI="mongodb+srv://faizangtech85040_db_user:jmpWG8bEcJUVUyB1@cluster0.zu8tnvd.mongodb.net/?appName=Cluster0"
 
// SECRET_KEY="pi6+yYYPymcRrgd5jJl9Xh5V8RYxKRukxl1mobDdDs4="
 
// NODEMAILER_HOST="smtp.gmail.com"
// NODEMAILER_PORT="587"
// NODEMAILER_EMAIL="faizangtech85040@gmail.com"
// NODEMAILER_PASSWORD="pqnzuqasrdzuizls"
 
 
// NEXT_PUBLIC_BASE_URL="http://localhost:3000"
// NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
// NODE_ENV="development"
 
 
 
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dkxj5ip15"
// NEXT_PUBLIC_CLOUDINARY_API_KEY="624212573342424"
// NEXT_PUBLIC_CLOUDINARY_UPDATE_PRESET="Homify-construction"
// CLOUDINARY_SECRET_KEY="-42p469j8lHdFQxHQ0dWvihLdBg"
 
// # NEXT_PUBLIC_CLOUDINARY_UPDATE_PRESET="Homify-construction"
 
// NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_SEkRlwtRMxC78I"
// RAZORPAY_KEY_SECRET="bpHJLPF570PqGK2V6xpAGkeC"
 
 
// SMTP_FROM_NAME="Homify"
// NEXT_PUBLIC_STORE_NAME="Homify"
 