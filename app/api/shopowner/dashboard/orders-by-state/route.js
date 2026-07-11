import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ProductModel from "@/models/Product.model"
import OrderModel from "@/models/Order.model"
import UserModel from "@/models/User.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    // real schema uses a flat "state" string (e.g. "Rajasthan"), not shippingAddress.stateCode
    const ordersByState = await OrderModel.aggregate([
      {
        $match: {
          deleteAt: null,
          state: { $exists: true, $ne: null },
          "products.productId": { $in: shopProductIds },
        },
      },
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    return response(true, 200, "Orders by state found.", ordersByState)
  } catch (error) {
    return catchError(error)
  }
}