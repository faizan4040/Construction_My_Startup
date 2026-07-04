import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import UserModel from "@/models/User.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function DELETE(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const { id } = await request.json()
    if (!id) return response(false, 400, "Variant id is required.")

    const variant = await ProductVariantModel.findOne({ _id: id, deletedAt: null }).populate("product", "shop")
    if (!variant) return response(false, 404, "Variant not found.")

    if (String(variant.product.shop) !== String(user.shop)) {
      return response(false, 404, "Variant not found or not owned by you.")
    }

    variant.deletedAt = new Date()
    await variant.save()

    return response(true, 200, "Variant deleted successfully.")
  } catch (error) {
    return catchError(error)
  }
}