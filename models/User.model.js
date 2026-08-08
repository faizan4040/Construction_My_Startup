import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["admin", "customer", "shop owner", "laber", "delivery boy"],
      default: "customer",
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
      url: { type: String, trim: true },
      public_id: { type: String, trim: true },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    blockReason: {
      type: String,
      default: "",
    },

    // ── Partner onboarding (labour ) ──
    partnerOnBoardingSteps: {
      type: Number,
      min: 0,
      max: 8,
      default: 0,
    },
    partnerStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },

    // ── Socket.io ──
    socketId: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── Video KYC ──
    videoKycStatus: {
      type: String,
      enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
      default: "not_required"
    },
    videoKycRoomId: {
      type: String,
      default: null,
    },
    videoKycRejectionReason: {
      type: String,
      default: "",
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema, "users");

export default UserModel;







// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const UserSchema = new mongoose.Schema(
//   {
//     role: {
//       type: String,
//       required: true,
//       enum: ["admin", "customer", "shop owner", "laber", "delivery boy"],
//       default: "customer",
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
//     shop: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Shop",
//       default: null,
//     },
//     isBlocked: {
//       type: Boolean,
//       default: false,
//     },
//     blockedAt: {
//       type: Date,
//       default: null,
//     },
//     blockReason: {
//       type: String,
//       default: "",
//     },

//     // ── Partner onboarding (labour ) ──
//     partnerOnBoardingSteps: {
//       type: Number,
//       min: 0,
//       max: 8,
//       default: 0,
//     },
//     partnerStatus: {
//       type: String,
//       enum: ["pending", "approved", "rejected"],
//       default: "pending",
//     },
//     rejectionReason: {
//       type: String,
//       default: "",
//     },

//     // socket io
//    socketId:{
//     type:String,
//     default:null
// },
// location:{
//     type:{
//         type:String,
//         enum:["Point"]
//     },
//     coordinates:[Number]
// }
// ,
// isOnline:{
//     type:Boolean,
//     default:false,
//     index:true
// }
 
//     // ── Video KYC ──
//     videoKycStatus: {
//       type: String,
//       enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
//       default: "not_required"
//     },
//     videoKycRoomId: {
//       type: String,
//       default: null,
//     },
//     videoKycRejectionReason: {
//       type: String,
//       default: "",
//     },

//     deletedAt: {
//       type: Date,
//       default: null,
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// userSchema.index({location:"2dsphere"})

// UserSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

// UserSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// const UserModel =
//   mongoose.models.User || mongoose.model("User", UserSchema, "users");

// export default UserModel;







