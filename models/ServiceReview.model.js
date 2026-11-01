import mongoose from "mongoose";
const S = mongoose.Schema;

const schema = new S(
  {
    booking: { type: S.Types.ObjectId, ref: "ServiceBooking", required: true, unique: true },
    user: { type: S.Types.ObjectId, ref: "User", required: true },
    provider: { type: S.Types.ObjectId, ref: "ServiceProvider", required: true },
    userName: { type: String, default: "Customer" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "", maxlength: 500 },
    status: { type: String, enum: ["visible", "hidden"], default: "visible" },
  },
  { timestamps: true }
);
schema.index({ provider: 1, status: 1, createdAt: -1 });

export default mongoose.models.ServiceReview || mongoose.model("ServiceReview", schema);