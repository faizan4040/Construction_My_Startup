// import mongoose from "mongoose"

// const categorySchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     slug: {
//         type: String,
//         required: true,
//         lowercase: true,
//         trim: true,
//     },
//     shop: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Shop",
//         default: null,   // null = global/admin category, ObjectId = shop-specific
//     },
//     deletedAt: {
//         type: Date,
//         default: null,
//         index: true
//     },

// }, {timestamps: true})

// // unique per shop scope (global categories unique among themselves, shop categories unique within that shop)
// categorySchema.index({ name: 1, shop: 1 }, { unique: true })
// categorySchema.index({ slug: 1, shop: 1 }, { unique: true })

// const CategoryModel = mongoose.models.Category || mongoose.model('Category',
// categorySchema, 'categories')
// export default CategoryModel
























import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
 
    name:{
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, {timestamps: true})


const CategoryModel = mongoose.models.Category || mongoose.model('Category', 
categorySchema, 'categories')
export default CategoryModel

