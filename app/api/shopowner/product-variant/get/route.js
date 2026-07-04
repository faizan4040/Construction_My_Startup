import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import UserModel from "@/models/User.model"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function GET() {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    // find this shop's product ids first, then variants pointing at them
    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const variants = await ProductVariantModel.find({
      product: { $in: shopProductIds },
      deletedAt: null,
    })
      .populate("product", "name slug")
      .populate("media", "_id secure_url")
      .sort({ createdAt: -1 })
      .lean()

    return response(true, 200, "Variants found.", variants)
  } catch (error) {
    return catchError(error)
  }
}