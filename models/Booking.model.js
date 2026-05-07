import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderRole: { type: String, enum: ["client", "labour"] },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const BookingSchema = new mongoose.Schema(
  {
    labour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabourProfile",
      required: true,
    },
    labourUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },
    workDate: { type: Date, required: true },
    description: { type: String, required: true },
    address: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    // Chat messages between client and labour
    messages: [MessageSchema],

    // Notification read status for labour
    labourRead: { type: Boolean, default: false },
    clientRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema)

export default Booking