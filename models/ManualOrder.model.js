import mongoose from 'mongoose'

/* ===================== PRODUCT SUB-SCHEMA ===================== */
const manualProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    media: { type: String, default: '' },
    subtotal: { type: Number, default: 0 },
  },
  { _id: false }
)

/* ===================== ORDER SCHEMA ===================== */
const manualOrderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true, index: true },

    /* ── Customer ── */
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    address: { type: String, required: true },

    /* ── Products ── */
    products: {
      type: [manualProductSchema],
      required: true,
      validate: (v) => v.length > 0,
    },

    /* ── Pricing ── */
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    /* ── Status ── */
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    payment_id: { type: String, default: '' },
    orderType: { type: String, default: 'MANUAL' },

    // FIX: deletedAt was MISSING from schema — soft delete was silently failing
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.models.ManualOrder || mongoose.model('ManualOrder', manualOrderSchema)

























// import mongoose from 'mongoose'

// /* ===================== PRODUCT SCHEMA ===================== */
// const manualProductSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Category',
//       required: true,
//     },

//     qty: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     // REQUIRED FOR PRODUCT IMAGE
//     media: {
//       type: String,
//       default: '',
//     },

//     // optional but useful
//     subtotal: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { _id: false }
// )

// /* ===================== ORDER SCHEMA ===================== */
// const manualOrderSchema = new mongoose.Schema(
//   {
//     order_id: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },

//     /* ---------- CUSTOMER INFO ---------- */
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       default: '',
//     },

//     phone: {
//       type: String,
//       required: true,
//     },

//     address: {
//       type: String,
//       required: true,
//     },

//     /* ---------- ORDER ---------- */
//     products: {
//       type: [manualProductSchema],
//       required: true,
//       validate: v => v.length > 0,
//     },

//     subtotal: {
//       type: Number,
//       required: true,
//     },

//     totalAmount: {
//       type: Number,
//       required: true,
//     },

//     /* ---------- STATUS ---------- */
//     status: {
//       type: String,
//       enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
//       default: 'pending',
//     },

//     paymentStatus: {
//       type: String,
//       enum: ['Pending', 'Paid'],
//       default: 'Pending',
//     },

//     orderType: {
//       type: String,
//       default: 'MANUAL',
//     },
//   },
//   {
//     timestamps: true,
//   }
// )

// /* ===================== EXPORT ===================== */
// export default mongoose.models.ManualOrder ||
//   mongoose.model('ManualOrder', manualOrderSchema)