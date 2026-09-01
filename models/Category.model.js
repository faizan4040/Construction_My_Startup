import mongoose from "mongoose"

// One "attribute type" for a subcategory — e.g. { label: "Weight", presets: ["25kg","50kg"], allowCustom: true }
const attributeSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true,
    },
    presets: [
        {
            type: String,
            trim: true,
        }
    ],
    // if true, Shopowner/Admin can type a custom value (not just pick from presets)
    allowCustom: {
        type: Boolean,
        default: true,
    },
}, { _id: false })

const categorySchema = new mongoose.Schema({

    name:{
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },

    // null = top-level group (e.g. "Civil & Interiors")
    // ObjectId = subcategory, points to its parent group (e.g. "Cement")
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
        index: true,
    },

    // Only meaningful for subcategories (parent != null).
    // Defines what "Size / Weight / Diameter / Color" options show up
    // when someone adds a Product Variant for a product under this subcategory.
    // Fully dynamic — Admin controls this from the dashboard, nothing hardcoded in code.
    attributes: {
        type: [attributeSchema],
        default: [],
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, {timestamps: true})

// Duplicate prevention scoped to the same parent —
// "Cement" can exist only once under the same parent,
// but a name can repeat under a DIFFERENT parent.
categorySchema.index({ parent: 1, slug: 1 }, { unique: true })

const CategoryModel = mongoose.models.Category || mongoose.model('Category',
categorySchema, 'categories')
export default CategoryModel


