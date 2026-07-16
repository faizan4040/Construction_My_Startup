import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReviewModel from "@/models/Review.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const payload = await request.json()
    const ids = payload.ids || []
    const deleteType = payload.deleteType

    if (!Array.isArray(ids) || ids.length === 0) return response(false, 403, "Invalid or empty id list.")
    if (!["SD", "RSD"].includes(deleteType)) return response(false, 400, "Invalid delete operation.")

    // ownership guard — only reviews on THIS shop's products
    const reviews = await ReviewModel.find({ _id: { $in: ids }, product: { $in: shopProductIds } })
    if (!reviews.length) return response(false, 404, "Reviews not found or not on your products.")

    const validIds = reviews.map((r) => r._id)

    if (deleteType === "SD") {
      await ReviewModel.updateMany({ _id: { $in: validIds } }, { $set: { deletedAt: new Date() } })
    } else {
      await ReviewModel.updateMany({ _id: { $in: validIds } }, { $set: { deletedAt: null } })
    }

    return response(true, 200, deleteType === "SD" ? "Review moved to trash." : "Review restored.")
  } catch (error) {
    return catchError(error)
  }
}