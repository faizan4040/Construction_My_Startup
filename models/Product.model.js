import mongoose from "mongoose"
import "./Media.model"

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    category:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Category',
       required: true
    },

    mrp: {
        type: Number,
        required: true,
    },

    sellingPrice: {
        type: Number,
        required: true,
    },

    discountPercentage: {
        type: Number,
        required: true,
    },

    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            required: true
        },
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        default: null,   // null = admin ka product, ObjectId = us shop owner ka product
    },

    description: {
        type: String,
        required: true
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, {timestamps: true})


productSchema.index({ category: 1 })
productSchema.index({ shop: 1 })
const ProductModel = mongoose.models.Product || mongoose.model('Product', 
productSchema, 'products')
export default ProductModel


















// import mongoose from "mongoose"
// import "./Media.model" 

// const productSchema = new mongoose.Schema({
//     name:{
//         type: String,
//         required: true,
//         trim: true,
//     },

//     slug: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//     },

//     category:{
//        type: mongoose.Schema.Types.ObjectId,
//        ref: 'Category',
//        required: true
//     },

//     mrp: {
//         type: Number,
//         required: true,
//     },

//     sellingPrice: {
//         type: Number,
//         required: true,
//     },

//     discountPercentage: {
//         type: Number,
//         required: true,
//     },

//     media: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Media",
//             required: true
//         },
//     ],

//     description: {
//         type: String,
//         required: true
//     },

//     deletedAt: {
//         type: Date,
//         default: null,
//         index: true
//     },

// }, {timestamps: true})


// productSchema.index({ category: 1 })
// const ProductModel = mongoose.models.Product || mongoose.model('Product', 
// productSchema, 'products')
// export default ProductModel

