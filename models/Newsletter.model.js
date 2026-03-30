import mongoose from "mongoose"

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const NewsletterModel = mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema)
export default NewsletterModel