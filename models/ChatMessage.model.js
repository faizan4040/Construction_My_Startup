import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    sender: { type: String, enum: ["user", "labour"], required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", schema);