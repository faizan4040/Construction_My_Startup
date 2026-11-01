import mongoose from "mongoose";
const S = mongoose.Schema;

const history = new S({ status: String, at: { type: Date, default: Date.now }, byRole: String, note: String }, { _id: false });

const schema = new S(
  {
    code: { type: String, required: true, unique: true },
    user: { type: S.Types.ObjectId, ref: "User", required: true },
    provider: { type: S.Types.ObjectId, ref: "ServiceProvider", required: true },
    // snapshots: the booking never changes even if admin edits the catalog later
    providerName: String,
    providerImage: String,
    categoryName: String,
    category: { type: S.Types.ObjectId, ref: "ServiceCategory" },

    slotDate: { type: String, required: true }, // YYYY-MM-DD
    slotTime: { type: String, required: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: { full: String, landmark: String, city: String, pincode: String },

    price: { type: Number, required: true },
    fee: { type: Number, required: true },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending_payment", "pending", "confirmed", "assigned", "in_progress", "completed", "cancelled"],
      default: "pending_payment",
    },
    paymentMethod: { type: String, enum: ["online", "cash"] },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cod", "failed", "refund_pending", "refunded"],
      default: "pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    refundId: String,
    paidAt: Date,

    assignedName: { type: String, default: "" }, // professional the admin sent to the site
    assignedPhone: { type: String, default: "" }, // admin only
    adminNote: { type: String, default: "" },
    adminSeen: { type: Boolean, default: false },

    confirmedAt: Date,
    completedAt: Date,
    cancelledBy: { type: String, enum: ["", "customer", "admin", "system"], default: "" },
    cancelReason: { type: String, default: "" },
    reviewed: { type: Boolean, default: false },
    history: [history],
  },
  { timestamps: true }
);

schema.index({ user: 1, createdAt: -1 });
schema.index({ status: 1, createdAt: -1 });
schema.index({ provider: 1, slotDate: 1, slotTime: 1 });
schema.index({ razorpayOrderId: 1 }, { sparse: true });

export default mongoose.models.ServiceBooking || mongoose.model("ServiceBooking", schema);