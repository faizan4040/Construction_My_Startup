import mongoose from "mongoose";
const S = mongoose.Schema.Types;

/*
  Double-entry style money log. A labour's wallet balance = sum of their entries
  whose availableAt has passed. Negative balance = commission they owe (cash dues).
  Online earnings automatically cover cash dues because both live in the same sum.

  labour entries:   labour_credit (+, online job), cash_commission_due (-, cash job),
                    dues_payment (+, labour paid dues online), dues_settlement (+, admin marked paid),
                    payout_debit (-), payout_reversal (+)
  platform entries: platform_commission (+, channel online|cash),
                    platform_withdrawal (-), platform_withdrawal_reversal (+)
*/
const ledgerSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ["labour", "platform"], required: true },
    owner: { type: S.ObjectId, ref: "User" },
    booking: { type: S.ObjectId, ref: "Booking" },               // live labour job
    serviceBooking: { type: S.ObjectId, ref: "ServiceBooking" }, // scheduled service job
    payout: { type: S.ObjectId, ref: "Payout" },
    ref: { type: String },                                       // external id, e.g. Razorpay payment id
    type: {
      type: String,
      required: true,
      enum: ["labour_credit", "cash_commission_due", "platform_commission", "payout_debit",
        "payout_reversal", "platform_withdrawal", "platform_withdrawal_reversal",
        "dues_payment", "dues_settlement"],
    },
    channel: { type: String, enum: ["online", "cash", "manual", ""], default: "" },
    amount: { type: Number, required: true }, // whole rupees, signed
    availableAt: { type: Date, default: Date.now },
    by: { type: S.ObjectId, ref: "User" },
    note: String,
  },
  { timestamps: true }
);

ledgerSchema.index({ ownerType: 1, owner: 1, availableAt: 1 });
ledgerSchema.index({ booking: 1, ownerType: 1, type: 1 }, { unique: true, partialFilterExpression: { booking: { $exists: true } } });
ledgerSchema.index({ serviceBooking: 1, ownerType: 1, type: 1 }, { unique: true, partialFilterExpression: { serviceBooking: { $exists: true } } });
ledgerSchema.index({ payout: 1, type: 1 }, { unique: true, partialFilterExpression: { payout: { $exists: true } } });
ledgerSchema.index({ ref: 1, type: 1 }, { unique: true, partialFilterExpression: { ref: { $exists: true } } });

export default mongoose.models.Ledger || mongoose.model("Ledger", ledgerSchema);
