import mongoose from "mongoose";
import { SERVICE_TYPES } from "@/lib/serviceConfig";

const S = mongoose.Schema;
const schema = new S(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true }, // ADMIN ONLY, never sent to customers
    category: { type: S.Types.ObjectId, ref: "ServiceCategory", required: true },
    image: { url: String, public_id: String },
    headline: { type: String, trim: true, maxlength: 140, default: "" },
    description: { type: String, trim: true, maxlength: 1500, default: "" },
    inclusions: [{ type: String, maxlength: 120 }],
    process: [{ type: String, maxlength: 160 }],
    startingPrice: { type: Number, required: true, min: 1, max: 10000000 },
    priceUnit: { type: String, enum: ["visit", "hour", "day", "sq.ft", "project"], default: "visit" },
    experienceYears: { type: Number, default: 0, min: 0, max: 60 },
    responseText: { type: String, default: "Same-day service", maxlength: 60 },
    serviceType: { type: String, enum: SERVICE_TYPES, default: SERVICE_TYPES[0] },
    professionalType: { type: String, enum: ["individual", "company"], default: "individual" },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    jobsDone: { type: Number, default: 0 },
    sourceLabour: { type: S.Types.ObjectId, ref: "Labour" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
schema.index({ isActive: 1, deletedAt: 1, category: 1, startingPrice: 1 });

export default mongoose.models.ServiceProvider || mongoose.model("ServiceProvider", schema);