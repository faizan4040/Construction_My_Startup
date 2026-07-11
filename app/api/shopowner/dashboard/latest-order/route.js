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

    // fetch matching orders, but only the line-items belonging to THIS shop
    const latestOrder = await OrderModel.aggregate([
      { $match: { deleteAt: null, "products.productId": { $in: shopProductIds } } },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 1,
          payment_id: 1,
          status: 1,
          createdAt: 1,
          products: {
            $filter: {
              input: "$products",
              as: "p",
              cond: { $in: ["$$p.productId", shopProductIds] },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          payment_id: 1,
          status: 1,
          products: 1,
          // shop-specific amount, not the whole order's total
          totalAmount: {
            $sum: {
              $map: {
                input: "$products",
                as: "p",
                in: { $multiply: ["$$p.qty", "$$p.sellingPrice"] },
              },
            },
          },
        },
      },
    ])

    // populate productId/variantId+media manually (aggregate doesn't auto-populate)
    await OrderModel.populate(latestOrder, [
      { path: "products.productId", select: "name" },
      { path: "products.variantId", populate: { path: "media", select: "secure_url url path" } },
    ])

    return response(true, 200, "Latest orders found.", latestOrder)
  } catch (error) {
    return catchError(error)
  }
}