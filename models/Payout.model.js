import mongoose from "mongoose";
const S = mongoose.Schema.Types;

const payoutSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ["labour", "admin"], required: true },
    owner: { type: S.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["requested", "approved", "processing", "paid", "rejected", "failed"], default: "requested" },
    method: { type: String, enum: ["manual", "razorpayx"], default: "manual" },
    razorpayPayoutId: String,
    utr: String,
    failureReason: String,
    account: { holderName: String, last4: String, ifsc: String, upiId: String },
    reviewedBy: { type: S.ObjectId, ref: "User" },
    reviewedAt: Date,
    processedAt: Date,
  },
  { timestamps: true }
);
payoutSchema.index({ owner: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Payout || mongoose.model("Payout", payoutSchema);