import mongoose from "mongoose"

const shopCourierPreferenceSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  courierPartner: { type: mongoose.Schema.Types.ObjectId, ref: "CourierPartner", required: true },
  preference: { type: Number, required: true }, // 1 = 1st choice, 2 = 2nd, etc.
}, { timestamps: true })

shopCourierPreferenceSchema.index({ shop: 1, courierPartner: 1 }, { unique: true })

const ShopCourierPreferenceModel = mongoose.models.ShopCourierPreference || mongoose.model("ShopCourierPreference", shopCourierPreferenceSchema, "shopcourierpreferences")
export default ShopCourierPreferenceModel