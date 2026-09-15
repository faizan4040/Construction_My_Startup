import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import OrderModel from "@/models/Order.model"
import UserModel from "@/models/User.model"

const LOW_STOCK_LIMIT = 5

const getLastNMonths = (n) => {
  const months = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("en-US", { month: "short" })
    months.push({ key, label })
  }
  return months
}

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    // ---------- COUNT ----------
    const [product, category, customerAgg, orderAgg] = await Promise.all([
      ProductModel.countDocuments({ shop: user.shop, deletedAt: null }),

      ProductModel.distinct("category", { shop: user.shop, deletedAt: null }),

      OrderModel.aggregate([
        { $match: { deletedAt: null, "products.productId": { $in: shopProductIds } } },
        { $unwind: "$products" },
        { $match: { "products.productId": { $in: shopProductIds } } },
        { $group: { _id: "$user" } },
        { $count: "total" },
      ]),

      OrderModel.aggregate([
        { $match: { deletedAt: null, "products.productId": { $in: shopProductIds } } },
        { $unwind: "$products" },
        { $match: { "products.productId": { $in: shopProductIds } } },
        { $group: { _id: "$_id" } },
        { $count: "total" },
      ]),
    ])

    const count = {
      category: category.length,
      product,
      customer: customerAgg[0]?.total || 0,
      order: orderAgg[0]?.total || 0,
    }

    // ---------- ORDER STATUS ----------
    const orderStatus = await OrderModel.aggregate([
      { $match: { deletedAt: null, "products.productId": { $in: shopProductIds } } },
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: shopProductIds } } },
      { $group: { _id: "$_id", status: { $first: "$status" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // ---------- LATEST ORDERS ----------
    const latestOrder = await OrderModel.find({
      deletedAt: null,
      "products.productId": { $in: shopProductIds },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: "products.productId", select: "name" })
      .populate({
        path: "products.variantId",
        populate: { path: "media", select: "secure_url url path" },
      })
      .select("_id payment_id products status totalAmount createdAt")
      .lean()

    // ---------- STOCK OVERVIEW / STOCK REPORT ----------
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
      { $match: { deletedAt: null, "products.variantId": { $in: variantIds } } },
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

    // ---------- PERFORMANCE (last 12 months) ----------
    const monthBuckets = getLastNMonths(12)

    const performanceRaw = await OrderModel.aggregate([
      { $match: { deletedAt: null, "products.productId": { $in: shopProductIds } } },
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: shopProductIds } } },
      { $group: { _id: "$_id", createdAt: { $first: "$createdAt" }, totalAmount: { $first: "$totalAmount" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ])

    const perfMap = {}
    performanceRaw.forEach((p) => { perfMap[p._id] = p })

    const performance = monthBuckets.map(({ key, label }) => ({
      month: label,
      orders: perfMap[key]?.orders || 0,
      revenue: perfMap[key]?.revenue || 0,
    }))

    return response(true, 200, "Dashboard overview fetched.", {
      count,
      orderStatus,
      latestOrder,
      stockOverview: { stockTable, mostSold },
      stockReport: { lowStock, mostSold },
      performance,
    })
  } catch (error) {
    return catchError(error)
  }
}