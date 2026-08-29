import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const { ids, deleteType } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "No order id(s) provided.")
    }

    // 🔒 security: shopowner sirf un orders ko delete kar sake jinme uske
    // apne shop ke products hain — kisi bhi random order-id ko delete
    // karne se rokne ke liye
    const shopProductIds = await ProductModel
      .find({ shop: user.shop, deletedAt: null })
      .distinct("_id")

    const allowedOrderIds = await OrderModel
      .find({ _id: { $in: ids }, "products.productId": { $in: shopProductIds } })
      .distinct("_id")

    if (!allowedOrderIds.length) {
      return response(false, 404, "None of the selected orders belong to you.")
    }

    if (deleteType === "PD") {
      // permanent delete
      await OrderModel.deleteMany({ _id: { $in: allowedOrderIds } })
      return response(true, 200, "Order(s) permanently deleted.")
    }

    if (deleteType === "RSD") {
      await OrderModel.updateMany(
        { _id: { $in: allowedOrderIds } },
        { $set: { deleteAt: null } }
      )
      return response(true, 200, "Order(s) restored.")
    }

    // default: "SD" — soft delete
    await OrderModel.updateMany(
      { _id: { $in: allowedOrderIds } },
      { $set: { deleteAt: new Date() } }
    )
    return response(true, 200, "Order(s) moved to trash.")
  } catch (error) {
    return catchError(error)
  }
}