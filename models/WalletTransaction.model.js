import mongoose from "mongoose"

const walletTransactionSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  orderId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  qty: { type: Number, required: true },

  grossAmount: { type: Number, required: true },
  commissionPercent: { type: Number, required: true }, // snapshot at delivery time
  platformRecovery: { type: Number, required: true },  // admin ka cut
  platformCompensation: { type: Number, default: 0 },  // future: claim compensation credit
  netAmount: { type: Number, required: true },         // shopowner ko milne wala amount

  status: {
    type: String,
    enum: ["on_hold", "eligible", "paid_out", "cancelled"],
    default: "on_hold",
  },

  deliveredAt: { type: Date, required: true },
  eligibleAt: { type: Date, required: true }, // deliveredAt + 7 days

  paidOutAt: { type: Date, default: null },
  payoutId: { type: String, default: null },
  utr: { type: String, default: null },
  payoutMode: { type: String, default: null },
  failureReason: { type: String, default: null },
}, { timestamps: true })

walletTransactionSchema.index({ shop: 1, status: 1 })
walletTransactionSchema.index({ order: 1, productId: 1 })

const WalletTransactionModel = mongoose.models.WalletTransaction || mongoose.model("WalletTransaction", walletTransactionSchema, "wallettransactions")
export default WalletTransactionModel