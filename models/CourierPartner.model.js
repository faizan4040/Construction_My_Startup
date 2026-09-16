import mongoose from "mongoose"

const courierPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, lowercase: true }, // e.g. "xpressbees"
  reverseShippingCharge: { type: Number, required: true }, // ₹ for first 500g
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const CourierPartnerModel = mongoose.models.CourierPartner || mongoose.model("CourierPartner", courierPartnerSchema, "courierpartners")
export default CourierPartnerModel