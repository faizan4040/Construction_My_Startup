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

    const now = new Date()
    const currentYear = now.getFullYear()

    const monthlySales = await OrderModel.aggregate([
      {
        $match: {
          deleteAt: null,
          status: { $in: ["processing", "shipped", "delivered"] },
          createdAt: { $gte: new Date(currentYear, 0, 1), $lte: new Date(currentYear, 11, 31) },
          "products.productId": { $in: shopProductIds },
        },
      },
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: shopProductIds } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalSales: { $sum: { $multiply: ["$products.qty", "$products.sellingPrice"] } },
          orderSet: { $addToSet: "$_id" },
        },
      },
      { $project: { _id: 1, totalSales: 1, orders: { $size: "$orderSet" } } },
      { $sort: { "_id.month": 1 } },
    ])

    return response(true, 200, "Monthly sales data found.", monthlySales)
  } catch (error) {
    return catchError(error)
  }
}