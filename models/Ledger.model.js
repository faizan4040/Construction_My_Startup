import mongoose from "mongoose";
const S = mongoose.Schema.Types;

const ledgerSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ["labour", "platform"], required: true },
    owner: { type: S.ObjectId, ref: "User" },
    booking: { type: S.ObjectId, ref: "Booking" },
    payout: { type: S.ObjectId, ref: "Payout" },
    type: {
      type: String,
      required: true,
      enum: ["labour_credit", "cash_commission_due", "platform_commission", "payout_debit",
        "payout_reversal", "platform_withdrawal", "platform_withdrawal_reversal"],
    },
    channel: { type: String, enum: ["online", "cash", ""], default: "" },
    amount: { type: Number, required: true }, // whole rupees, signed
    availableAt: { type: Date, default: Date.now },
    note: String,
  },
  { timestamps: true }
);

ledgerSchema.index({ ownerType: 1, owner: 1, availableAt: 1 });
ledgerSchema.index({ booking: 1, ownerType: 1, type: 1 }, { unique: true, partialFilterExpression: { booking: { $exists: true } } });
ledgerSchema.index({ payout: 1, type: 1 }, { unique: true, partialFilterExpression: { payout: { $exists: true } } });

export default mongoose.models.Ledger || mongoose.model("Ledger", ledgerSchema);