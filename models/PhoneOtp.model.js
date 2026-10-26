import mongoose from "mongoose";

const PhoneOtpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otpHash: { type: String, default: "" }, // HMAC of the code, never the code itself
  otpExpiresAt: { type: Date, default: () => new Date(0) },
  attempts: { type: Number, default: 0 },
  sendCount: { type: Number, default: 0 }, // sends inside the current 1h window
  windowStart: { type: Date, default: () => new Date() },
  lastSentAt: { type: Date, default: () => new Date(0) },
  expiresAt: { type: Date, required: true }, // whole document is removed by Mongo TTL
});

PhoneOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PhoneOtpModel =
  mongoose.models.PhoneOtp || mongoose.model("PhoneOtp", PhoneOtpSchema, "phoneotps");

export default PhoneOtpModel;