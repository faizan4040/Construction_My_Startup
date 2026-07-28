import mongoose from "mongoose";

const labourDocsSchema = new mongoose.Schema(
  {
    // Labour User
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Aadhaar
    aadhaarNumber: {
      type: String,
      required: true,
      trim: true,
    },

    aadhaarFront: {
      type: String,
      required: true,
    },

    aadhaarBack: {
      type: String,
      required: true,
    },

    // Profile Verification
    selfieImage: {
      type: String,
      required: true,
    },

    // Address Proof (Optional)
    addressProof: {
      type: String,
      default: "",
    },

    // Skill / Experience Certificate (Optional)
    experienceCertificate: {
      type: String,
      default: "",
    },

    // Police Verification (Optional)
    policeVerification: {
      type: String,
      default: "",
    },

    // Bank Details (Optional)
    accountHolderName: {
      type: String,
      default: "",
    },

    bankName: {
      type: String,
      default: "",
    },

    accountNumber: {
      type: String,
      default: "",
    },

    ifscCode: {
      type: String,
      default: "",
    },

    // Verification Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const LabourDocs =
  mongoose.models.LabourDocs ||
  mongoose.model("LabourDocs", labourDocsSchema);

export default LabourDocs;