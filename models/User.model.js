// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const UserSchema = new mongoose.Schema(
//   {
//     role: {
//       type: String,
//       required: true,
//       enum: ["user", "shop_owner", "delivery_boy", "labour", "admin"],
//       default: "user",
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       trim: true,
//       select: false,
//     },
//     avatar: {
//       url: { type: String, trim: true },
//       public_id: { type: String, trim: true },
//     },
//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },
//     phone: {
//       type: String,
//       trim: true,
//     },
//     address: {
//       type: String,
//       trim: true,
//     },

//     /* ── Role-specific permission flags ─────────────────────────── */

//     // shop_owner permissions
//     canListProducts:    { type: Boolean, default: false }, // true after approval
//     shopApproved:       { type: Boolean, default: false },

//     // delivery_boy permissions
//     canAcceptDelivery:  { type: Boolean, default: false },
//     deliveryApproved:   { type: Boolean, default: false },

//     // labour permissions
//     canBeHired:         { type: Boolean, default: false },
//     labourApproved:     { type: Boolean, default: false },

//     // admin: full access is determined by role === 'admin' in middleware
//     // user (buyer): can browse, add to cart, place orders — no extra flags needed

//     deletedAt: {
//       type: Date,
//       default: null,
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// /* ── Hash password before save ─────────────────────────────────── */
// UserSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

// /* ── Auto-set permission flags based on role ───────────────────── */
// UserSchema.pre("save", function (next) {
//   if (this.isNew) {
//     switch (this.role) {
//       case "shop_owner":
//         // shop owners start unapproved; admin approves them
//         this.canListProducts = false;
//         this.shopApproved = false;
//         break;
//       case "delivery_boy":
//         this.canAcceptDelivery = false;
//         this.deliveryApproved = false;
//         break;
//       case "labour":
//         this.canBeHired = false;
//         this.labourApproved = false;
//         break;
//       default:
//         break;
//     }
//   }
//   next();
// });

// /* ── Compare password ──────────────────────────────────────────── */
// UserSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// /* ── Helper: get role permissions summary ──────────────────────── */
// UserSchema.methods.getPermissions = function () {
//   const base = { role: this.role };

//   switch (this.role) {
//     case "user":
//       return {
//         ...base,
//         canBrowse: true,
//         canAddToCart: true,
//         canPlaceOrder: true,
//         canTrackOrder: true,
//       };

//     case "shop_owner":
//       return {
//         ...base,
//         canListProducts: this.canListProducts,
//         shopApproved: this.shopApproved,
//         canManageOrders: this.shopApproved,
//         canViewEarnings: this.shopApproved,
//       };

//     case "delivery_boy":
//       return {
//         ...base,
//         canAcceptDelivery: this.canAcceptDelivery,
//         deliveryApproved: this.deliveryApproved,
//         canViewAssignedOrders: this.deliveryApproved,
//         canUpdateDeliveryStatus: this.deliveryApproved,
//       };

//     case "labour":
//       return {
//         ...base,
//         canBeHired: this.canBeHired,
//         labourApproved: this.labourApproved,
//         canReceiveJobOffers: this.labourApproved,
//       };

//     case "admin":
//       return {
//         ...base,
//         canManageUsers: true,
//         canApproveShops: true,
//         canApproveDelivery: true,
//         canApproveLabour: true,
//         canManageOrders: true,
//         canAccessAnalytics: true,
//         canManageSettings: true,
//         fullAccess: true,
//       };

//     default:
//       return base;
//   }
// };

// const UserModel =
//   mongoose.models.User || mongoose.model("User", UserSchema, "users");

// export default UserModel;

















import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  role:{
    type: String,
    required: true,
    enum: ['user', 'admin'],
    //  enum: ["user", "admin", "office_staff", "dispatch_team"],
    default: 'user'
  },
  name: {
    type: String,
    required: true,
    trim: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    select: false,
  },
  
  avatar: {
    url: {
        type: String,
        trim: true,
    },
    public_id: {
        type: String,
        trim: true,
    },

  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    trim: true,
  },

  address:{
    type: String,
    trim: true,
  },
  deletedAt:{
    type: Date,
    default: null,
    index: true,
  },

}, { timestamps: true })


// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});



UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



const UserModel = mongoose.models.User || mongoose.model('User', UserSchema, 'users');
export default UserModel;



