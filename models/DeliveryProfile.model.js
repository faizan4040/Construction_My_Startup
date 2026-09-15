import mongoose from "mongoose";

// Extra info for a User whose role === "delivery boy".
// Kept separate from User so User model stays clean/reusable.
const deliveryProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  vehicleType: { type: String, enum: ["bike", "mini_truck", "truck", "tempo"], required: true },
  vehicleNumber: { type: String, required: true, trim: true },
  serviceZones: [{ type: String, trim: true }], // pincodes or city names this partner covers
  isAvailable: { type: Boolean, default: true },
  currentLoad: { type: Number, default: 0 }, // how many active pickups assigned right now
}, { timestamps: true })

const DeliveryProfileModel = mongoose.models.DeliveryProfile || mongoose.model("DeliveryProfile", deliveryProfileSchema, "deliveryprofiles")
export default DeliveryProfileModel