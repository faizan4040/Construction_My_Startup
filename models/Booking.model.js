import mongoose from "mongoose";

export const ACTIVE_STATUSES = ["requested", "confirmed", "arrived", "started", "work_completed"];
// labour is occupied with this booking
export const BUSY_STATUSES = ["confirmed", "arrived", "started", "work_completed"];

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: String,
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    byRole: String, // customer | labour | admin | system
    note: String,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    labour: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // partner's User id
    labourProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Labour" },
    category: { type: String, required: true },

    workAddress: { type: String, required: true },
    siteDetails: { type: String, default: "" }, // exact flat/floor/landmark
    workLocation: { type: pointSchema, required: true },

    fare: { type: Number, required: true },
    pricingType: { type: String, enum: ["hourly", "daily"], required: true },
    durationKey: { type: String },
    duration: { type: Number, required: true },
    ratePerUnit: { type: Number, required: true },

    userMobileNumber: { type: String, required: true },

    bookingStatus: {
      type: String,
      enum: [
        "idle", "requested", "confirmed", "arrived", "started",
        "work_completed", "completed", "cancelled", "rejected", "expired",
        "awaiting_payment", // legacy, unused
      ],
      default: "requested",
    },
    requestExpiresAt: { type: Date },
    acceptedAt: Date,
    arrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    workDurationMinutes: Number,

    paymentMethod: { type: String, enum: ["cash", "online"] },
    paymentStatus: { type: String, enum: ["pending", "paid", "cash", "failed"], default: "pending" },
    paymentDeadline: Date,
    commissionRate: { type: Number, default: 0 }, // snapshot at completion
    adminCommission: { type: Number, default: 0 },
    labourAmount: { type: Number, default: 0 },

    startOtp: { type: String, select: false },
    startOtpExpires: { type: Date, select: false },
    completeOtp: { type: String, select: false },
    completeOtpExpires: { type: Date, select: false },

    cancellationReason: { type: String, default: "" },
    cancelledBy: { type: String, default: "" },

    // admin soft delete: hidden from the admin bookings table only,
    // earnings / analytics keep counting it
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    history: [historySchema], // audit trail
  },
  { timestamps: true }
);

bookingSchema.index({ labour: 1, bookingStatus: 1, requestExpiresAt: 1 });
bookingSchema.index({ user: 1, bookingStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// DB-level guarantees (needs MongoDB 6.0+ for $in in partial indexes):
// 1) a customer can have only one active booking
bookingSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { bookingStatus: { $in: ACTIVE_STATUSES } } }
);
// 2) a labour can be busy with only one job
bookingSchema.index(
  { labour: 1 },
  { unique: true, partialFilterExpression: { bookingStatus: { $in: BUSY_STATUSES } } }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;



























// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // The labour being hired
//     labour: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // Snapshot of category at booking time (helpers, masons, electricians, etc.)
//     category: {
//       type: String,
//       required: true,
//     },

//     // Where the labour needs to work
//     workAddress: {
//       type: String,
//       required: true,
//     },
//     workLocation: {
//       type: {
//         type: String,
//         enum: ["Point"],
//       },
//       coordinates: [Number],
//     },

//     fare: {
//       type: Number,
//       required: true,
//     },
//     pricingType: {
//       type: String,
//       enum: ["hourly", "daily"],
//       required: true,
//     },
//     duration: {
//       type: Number,
//       required: true,
//     },
//     ratePerUnit: {
//       type: Number,
//       required: true,
//     },

//     userMobileNumber: {
//       type: String,
//       required: true,
//     },
//     labourMobileNumber: {
//       type: String,
//       required: true,
//     },

//     bookingStatus: {
//       type: String,
//       enum: [
//         "idle",
//         "requested",
//         "awaiting_payment",
//         "confirmed",
//         "started",
//         "completed",
//         "cancelled",
//         "rejected",
//         "expired",
//       ],
//       default: "idle",
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "paid", "cash", "failed"],
//       default: "pending",
//     },
//     paymentDeadline: {
//       type: Date,
//     },
//     adminCommission: {
//       type: Number,
//       default: 0,
//     },
//     labourAmount: {
//       type: Number,
//       default: 0,
//     },

//     // OTP to confirm labour has started work at the site
//     startOtp: {
//       type: String,
//     },
//     startOtpExpires: {
//       type: Date,
//     },
//     // OTP to confirm work completion
//     completeOtp: {
//       type: String,
//     },
//     completeOtpExpires: {
//       type: Date,
//     },

//     cancellationReason: {
//       type: String,
//       default: "",
//     },
//   },
//   { timestamps: true }
// );

// const Booking =
//   mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
// export default Booking;














