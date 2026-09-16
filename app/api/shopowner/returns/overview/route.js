import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReturnModel from "@/models/Return.model"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    // ── Overall return rate ──
    const totalDelivered = await OrderModel.aggregate([
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: shopProductIds }, "products.status": "delivered" } },
      { $count: "count" },
    ])
    const deliveredCount = totalDelivered[0]?.count || 0

    const totalReturns = await ReturnModel.countDocuments({
      shop: user.shop,
      deletedAt: null,
      status: { $ne: "rejected" },
    })

    const returnRate = deliveredCount > 0 ? ((totalReturns / deliveredCount) * 100).toFixed(2) : "0.00"

    // ── Product Performance table ──
    const products = await ProductModel.find({ shop: user.shop, deletedAt: null }).select("name image")

    const performance = await Promise.all(
      products.map(async (p) => {
        const deliveredForProduct = await OrderModel.aggregate([
          { $unwind: "$products" },
          { $match: { "products.productId": p._id, "products.status": "delivered" } },
          { $count: "count" },
        ])
        const delivered = deliveredForProduct[0]?.count || 0

        const returnsForProduct = await ReturnModel.countDocuments({
          productId: p._id,
          deletedAt: null,
          status: { $ne: "rejected" },
        })

        const lastReturn = await ReturnModel.findOne({ productId: p._id, deletedAt: null }).sort({ createdAt: -1 })

        return {
          productId: p._id,
          name: p.name,
          image: p.image,
          ordersDelivered: delivered,
          customerReturn: returnsForProduct,
          customerReturnRate: delivered > 0 ? ((returnsForProduct / delivered) * 100).toFixed(2) : "0.00",
          lastReturnAt: lastReturn?.createdAt || null,
        }
      })
    )

    // ── Most recent return first (per Meesho's default sort) ──
    performance.sort((a, b) => new Date(b.lastReturnAt || 0) - new Date(a.lastReturnAt || 0))

    return response(true, 200, "Overview fetched.", {
      customerReturnRate: returnRate,
      totalDelivered: deliveredCount,
      totalReturns,
      products: performance,
    })
  } catch (error) {
    return catchError(error, "Failed to fetch return overview.")
  }
}