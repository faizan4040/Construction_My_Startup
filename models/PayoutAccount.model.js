import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    holderName: { type: String, required: true, trim: true },
    accountNumberEnc: { type: String, select: false },
    last4: String,
    ifsc: String,
    upiId: String,
    status: { type: String, enum: ["unverified", "verified", "rejected"], default: "unverified" },
    razorpayContactId: String,
    razorpayFundAccountId: String,
    version: { type: Number, default: 0 }, // payout requests bump this: acts as a per-user lock
  },
  { timestamps: true }
);

export default mongoose.models.PayoutAccount || mongoose.model("PayoutAccount", schema);