import mongoose from "mongoose"

const returnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  orderId: { type: String, required: true }, // human-readable order_id, for search
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
  productName: { type: String, required: true },
  qty: { type: Number, required: true },

  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },

  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },

  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["requested", "approved", "rejected", "picked_up", "refunded"],
    default: "requested",
  },

  deletedAt: { type: Date, default: null },
}, { timestamps: true })

const ReturnModel = mongoose.models.Return || mongoose.model("Return", returnSchema, "returns")
export default ReturnModel