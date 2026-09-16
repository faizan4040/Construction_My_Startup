import mongoose from "mongoose"

const claimSchema = new mongoose.Schema({
  return: { type: mongoose.Schema.Types.ObjectId, ref: "Return", required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },

  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["open", "approved", "rejected"],
    default: "open",
  },
  resolutionNote: { type: String, default: "" },
  resolvedAt: { type: Date, default: null },

  deletedAt: { type: Date, default: null },
}, { timestamps: true })

const ClaimModel = mongoose.models.Claim || mongoose.model("Claim", claimSchema, "claims")
export default ClaimModel