import mongoose from "mongoose";

// Single document (key: "global") holding the money rules the admin can change
// from the dashboard. Every field is optional: lib/settings.js falls back to .env.
const schema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "global" },
    labourCommissionPercent: { type: Number, min: 0, max: 50 },  // live (instant) labour jobs
    serviceCommissionPercent: { type: Number, min: 0, max: 50 }, // scheduled service jobs (on top of the booking fee)
    settlementHoldHours: { type: Number, min: 0, max: 720 },     // online earning becomes withdrawable after this
    maxCashDues: { type: Number, min: 0, max: 100000 },          // labour stops getting jobs above this unpaid commission
    minPayout: { type: Number, min: 1, max: 100000 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.PlatformSetting || mongoose.model("PlatformSetting", schema);
