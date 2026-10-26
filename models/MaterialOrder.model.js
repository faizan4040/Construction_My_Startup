import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    name: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    resourceType: { type: String, default: "image" },
    bytes: { type: Number, default: 0 },
  },
  { _id: false }
);

const MaterialOrderSchema = new mongoose.Schema(
  {
    // set only when the customer was logged in while ordering
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    files: { type: [FileSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    adminNote: { type: String, default: "", maxlength: 1000 },
    phoneVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MaterialOrderSchema.index({ createdAt: -1 });

const MaterialOrderModel =
  mongoose.models.MaterialOrder ||
  mongoose.model("MaterialOrder", MaterialOrderSchema, "materialorders");

export default MaterialOrderModel;