import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ProductModel from "@/models/Product.model"
import ReviewModel from "@/models/Review.model"
import UserModel from "@/models/User.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const latestReview = await ReviewModel.find({
      deletedAt: null,
      product: { $in: shopProductIds },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: "product", select: "name media", populate: { path: "media", select: "secure_url" } })
      .lean()

    return response(true, 200, "Latest reviews found.", latestReview)
  } catch (error) {
    return catchError(error)
  }
}