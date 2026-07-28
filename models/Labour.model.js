import mongoose from "mongoose";

const labourSchema = new mongoose.Schema(
  {
    // User who owns this labour profile
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Labour Category
    category: {
      type: String,
      enum: [
        "helpers",
        "masons",
        "electricians",
        "plumbers",
        "carpenters",
        "painters",
        "tile-experts",
        "welders",
        "jcb-operators",
        "contractors",
        "engineers",
      ],
      required: true,
    },

    // Basic Information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
      maxlength: 500,
    },

    // Experience
    experienceYears: {
      type: Number,
      default: 0,
    },

    // Pricing — labour chooses how they charge, then only the relevant
    // price field(s) become required
    rateType: {
      type: String,
      enum: ["hour", "day", "both"],
      required: true,
    },

    pricePerHour: {
      type: Number,
      required: function () {
        return this.rateType === "hour" || this.rateType === "both";
      },
    },

    pricePerDay: {
      type: Number,
      required: function () {
        return this.rateType === "day" || this.rateType === "both";
      },
    },

    // Skills
    skills: [
      {
        type: String,
      },
    ],

    // Current Location
    location: {
      latitude: {
        type: Number,
        default: 0,
      },

      longitude: {
        type: Number,
        default: 0,
      },

      address: {
        type: String,
        default: "",
      },
    },

    // Service Area
    serviceRadius: {
      type: Number,
      default: 10,
    },

    // Ratings
    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
    },

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    aadhaarNumber: {
      type: String,
      default: "",
    },

    aadhaarImage: {
      type: String,
      default: "",
    },

    // Availability
    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    // Admin Approval
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    // Active Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Labour =
  mongoose.models.Labour || mongoose.model("Labour", labourSchema);

export default Labour;