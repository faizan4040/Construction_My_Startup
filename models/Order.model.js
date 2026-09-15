import { orderstatus } from "@/lib/utils";
import mongoose from "mongoose";

// One entry per status change — this is what makes automation auditable.
// Every API route that changes status MUST push here instead of just
// setting `status` directly.
const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: orderstatus, required: true },
  changedBy: { type: String, enum: ["system", "delivery_partner", "shopowner", "courier", "customer"], required: true },
  changedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  note: { type: String, default: "" },
  at: { type: Date, default: Date.now },
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String, required: true },
    ordernote: { type: String, required: false },

    paymentMode: { type: String, enum: ["online", "cod"], default: "online" },
    paymentStatus: { type: String, enum: ["Paid", "Pending", "Refunded", "Failed"], default: "Pending" },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            mrp: { type: Number, required: true },
            sellingPrice: { type: Number, required: true },
            status: { type: String, enum: orderstatus, default: "on_hold" },
            statusHistory: [statusHistorySchema],

            // ── NEW: label & tracking ──
            labelCode: { type: String, default: null, index: true }, // unique barcode value, one per line item
            labelGeneratedAt: { type: Date, default: null },
            shippedAt: { type: Date, default: null },
            deliveredAt: { type: Date, default: null },
            deliveryOtp: { type: String, default: null }, // set when courier starts delivery attempt
        }
    ],

    // ── NEW: which delivery boy accepted the pickup job for this order ──
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    subtotal: { type: Number, required: true },
    discount: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    payment_id: { type: String, required: true },
    order_id: { type: String, required: true },
    status: { type: String, enum: orderstatus, default: "on_hold" },
    statusHistory: [statusHistorySchema],

    deleteAt: { type: Date, default: null, index: true }
}, { timestamps: true })

const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders')
export default OrderModel

