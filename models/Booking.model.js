import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Distinguishes a vehicle ride booking from a labour hire booking
    bookingType: {
      type: String,
      enum: ["vehicle", "labour"],
      required: true,
      default: "vehicle",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // For vehicle bookings: the driver. For labour bookings: the labour
    // partner. Kept as one field so earning/stat queries can stay simple.
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Only required for bookingType "vehicle"
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: function () {
        return this.bookingType === "vehicle";
      },
    },

    // Only relevant for bookingType "labour" — snapshot of category at
    // booking time (helpers, masons, electricians, etc.)
    category: {
      type: String,
      required: function () {
        return this.bookingType === "labour";
      },
    },

    pickUpAddress: {
      type: String,
      required: true,
    },
    dropAddress: {
      type: String,
      required: function () {
        return this.bookingType === "vehicle";
      },
    },

    pickUpLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    dropLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },

    fare: {
      type: Number,
      required: true,
    },
    pricingType: {
      type: String,
      enum: ["hourly", "daily"],
    },
    duration: {
      type: Number,
    },
    ratePerUnit: {
      type: Number,
    },

    userMobileNumber: {
      type: String,
      required: true,
    },
    driverMobileNumber: {
      type: String,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: [
        "idle",
        "requested",
        "awaiting_payment",
        "confirmed",
        "started",
        "completed",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "idle",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash", "failed"],
      default: "pending",
    },
    paymentDeadline: {
      type: Date,
    },
    adminCommission: {
      type: Number,
      default: 0,
    },
    partnerAmount: {
      type: Number,
      default: 0,
    },

    pickUpOtp: {
      type: String,
    },
    dropOtp: {
      type: String,
    },
    pickUpOtpExpires: {
      type: Date,
    },
    dropOtpExpires: {
      type: Date,
    },

    cancellationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;