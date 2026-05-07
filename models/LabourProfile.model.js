import mongoose from "mongoose"

const LabourProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    // Step 1 - Personal Info
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    bio: { type: String, default: "" },

    // Step 2 - Address / Location
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

    // Step 3 - Document
    documentType: {
      type: String,
      enum: ["aadhaar", "pan", "driving_license", "voter_id", "passport"],
      required: true,
    },
    documentNumber: { type: String, required: true },
    documentImageUrl: { type: String, default: "" },
    documentPublicId: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },

    // Step 4 - Work Profile
    profession: { type: String, required: true }, // mistri, plumber, electrician, etc.
    professionType: { type: String, default: "" }, // sub-type
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ["full_time", "part_time", "weekends"],
      default: "full_time",
    },
    workingHours: { type: String, default: "9 AM - 6 PM" },

    // Step 5 - Profile Photo
    profileImageUrl: { type: String, default: "" },
    profilePublicId: { type: String, default: "" },

    // Stats
    totalBookings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Auto-generate slug from firstName + lastName + random id
LabourProfileSchema.pre("save", function (next) {
  if (!this.slug) {
    const base = `${this.firstName}-${this.lastName}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
    this.slug = `${base}-${Date.now().toString(36)}`
  }
  next()
})

const LabourProfile =
  mongoose.models.LabourProfile ||
  mongoose.model("LabourProfile", LabourProfileSchema)

export default LabourProfile