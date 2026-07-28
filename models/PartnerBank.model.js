import mongoose from "mongoose";

const partnerBankSchema = new mongoose.Schema(
  {
    // Labour User
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Account Holder Name
    accountHolder: {
      type: String,
      required: true,
      trim: true,
    },

    // Bank Name
    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    // Branch Name
    branchName: {
      type: String,
      default: "",
      trim: true,
    },

    // Account Number
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // IFSC Code
    ifsc: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    // UPI ID (Optional)
    upi: {
      type: String,
      default: "",
      trim: true,
    },

    // Verification Status
    status: {
      type: String,
      enum: ["not_added", "added", "verified"],
      default: "not_added",
    },

    // Admin Verification
    isVerified: {
      type: Boolean,
      default: false,
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


const PartnerBank =
  mongoose.models.PartnerBank ||
  mongoose.model("PartnerBank", partnerBankSchema);

export default PartnerBank;


