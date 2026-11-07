import mongoose from "mongoose";
const S = mongoose.Schema;

// Customer -> labour review for a live Booking (one per booking).
// Kept separate from Review.model, which is the product review collection.
const schema = new S(
  {
    booking: { type: S.Types.ObjectId, ref: "Booking", required: true, unique: true },
    user: { type: S.Types.ObjectId, ref: "User", required: true },
    labour: { type: S.Types.ObjectId, ref: "User", required: true },
    labourProfile: { type: S.Types.ObjectId, ref: "Labour" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);
schema.index({ labour: 1, createdAt: -1 });

export default mongoose.models.LabourReview || mongoose.model("LabourReview", schema);
