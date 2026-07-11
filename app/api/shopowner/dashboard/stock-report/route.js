import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import OrderModel from "@/models/Order.model"
import UserModel from "@/models/User.model"

const LOW_STOCK_LIMIT = 5

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const variants = await ProductVariantModel.find({
      deletedAt: null,
      product: { $in: shopProductIds },
    })
      .populate({
        path: "product",
        select: "name media",
        populate: { path: "media", select: "secure_url url path" },
      })
      .lean()

    const variantIds = variants.map((v) => v._id)

    const soldData = await OrderModel.aggregate([
      { $match: { deleteAt: null, "products.variantId": { $in: variantIds } } },
      { $unwind: "$products" },
      { $match: { "products.variantId": { $in: variantIds } } },
      { $group: { _id: "$products.variantId", totalSold: { $sum: "$products.qty" } } },
    ])

    const soldMap = {}
    soldData.forEach((s) => { soldMap[s._id.toString()] = s.totalSold })

    const stockTable = variants.map((v) => {
      const sold = soldMap[v._id.toString()] || 0
      const remaining = Number(v.stock ?? 0)
      const image = v.product?.media?.[0]?.secure_url || v.product?.media?.[0]?.url || v.product?.media?.[0]?.path || null

      let status = "In Stock"
      if (remaining === 0) status = "Out of Stock"
      else if (remaining <= LOW_STOCK_LIMIT) status = "Low Stock"

      return {
        variantId: v._id,
        productName: v.product?.name || "—",
        sku: v.sku,
        image,
        totalSold: sold,
        remainingStock: remaining,
        status,
      }
    })

    const lowStock = stockTable.filter((i) => i.status === "Low Stock")
    const mostSold = [...stockTable].filter((i) => i.totalSold > 0).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5)

    return response(true, 200, "Stock report fetched.", { stockTable, mostSold, lowStock })
  } catch (error) {
    return catchError(error)
  }
}