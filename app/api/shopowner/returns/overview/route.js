import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReturnModel from "@/models/Return.model"
import ClaimModel from "@/models/Claim.model"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"

// ── Date-range presets — mirrors the "Last 6 Months" style dropdown ──
function getDateRange(preset) {
  const now = new Date()
  const start = new Date()
  switch (preset) {
    case "today": start.setHours(0, 0, 0, 0); break
    case "7d": start.setDate(now.getDate() - 7); break
    case "30d": start.setDate(now.getDate() - 30); break
    case "6m": start.setMonth(now.getMonth() - 6); break
    case "1y": start.setFullYear(now.getFullYear() - 1); break
    default: start.setMonth(now.getMonth() - 6) // default 6 months
  }
  return { start, end: now }
}

export async function GET(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const { searchParams } = new URL(request.url)
    const preset = searchParams.get("range") || "6m"
    const { start, end } = getDateRange(preset)

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    // ── Delivered count (denominator for return rate) ──
    const deliveredAgg = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.productId": { $in: shopProductIds },
          "products.status": "delivered",
          "products.deliveredAt": { $gte: start, $lte: end },
        },
      },
      { $count: "count" },
    ])
    const totalDelivered = deliveredAgg[0]?.count || 0

    // ── Dispatched count (denominator for RTO rate) ──
    const dispatchedAgg = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.productId": { $in: shopProductIds },
          "products.status": { $in: ["shipped", "delivered", "rto"] },
          "products.shippedAt": { $gte: start, $lte: end },
        },
      },
      { $count: "count" },
    ])
    const totalDispatched = dispatchedAgg[0]?.count || 0

    const rtoAgg = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.productId": { $in: shopProductIds },
          "products.status": "rto",
          "products.shippedAt": { $gte: start, $lte: end },
        },
      },
      { $count: "count" },
    ])
    const totalRTO = rtoAgg[0]?.count || 0

    // ── Returns in range ──
    const returnsInRange = await ReturnModel.find({
      shop: user.shop,
      deletedAt: null,
      createdAt: { $gte: start, $lte: end },
    })

    const totalReturns = returnsInRange.length
    const wrongDefectiveReturns = returnsInRange.filter((r) => r.reasonCategory === "wrong_defective").length
    const otherReturns = totalReturns - wrongDefectiveReturns

    const customerReturnRate = totalDelivered > 0 ? (totalReturns / totalDelivered) * 100 : 0
    const wrongDefectiveRate = totalDelivered > 0 ? (wrongDefectiveReturns / totalDelivered) * 100 : 0
    const constructEzyRate = totalDelivered > 0 ? (otherReturns / totalDelivered) * 100 : 0
    const rtoRate = totalDispatched > 0 ? (totalRTO / totalDispatched) * 100 : 0

    // ── Claims ──
    const totalClaimsRaised = await ClaimModel.countDocuments({ shop: user.shop, deletedAt: null })
    const totalClaimsApproved = await ClaimModel.countDocuments({ shop: user.shop, deletedAt: null, status: "approved" })

    // ── Product performance table ──
    const products = await ProductModel.find({ shop: user.shop, deletedAt: null })
  .select("name media")
  .populate("media", "secure_url url path")

    const performance = await Promise.all(
      products.map(async (p) => {
        const deliveredForProduct = await OrderModel.aggregate([
          { $unwind: "$products" },
          { $match: { "products.productId": p._id, "products.status": "delivered", "products.deliveredAt": { $gte: start, $lte: end } } },
          { $count: "count" },
        ])
        const delivered = deliveredForProduct[0]?.count || 0

        const returnsForProduct = returnsInRange.filter((r) => String(r.productId) === String(p._id)).length
        const lastReturn = returnsInRange
          .filter((r) => String(r.productId) === String(p._id))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

          return {
          productId: p._id,
          name: p.name,
          image: p.media?.[0]?.secure_url || p.media?.[0]?.url || p.media?.[0]?.path || null,   // ✅ ADD
          ordersDelivered: delivered,
          customerReturn: returnsForProduct,
          customerReturnRate: delivered > 0 ? ((returnsForProduct / delivered) * 100).toFixed(2) : "0.00",
          lastReturnAt: lastReturn?.createdAt || null,
        }
      })
    )

    performance.sort((a, b) => new Date(b.lastReturnAt || 0) - new Date(a.lastReturnAt || 0))

    return response(true, 200, "Overview fetched.", {
      range: preset,
      customerReturnRate: customerReturnRate.toFixed(2),
      totalReturns,
      totalDelivered,
      wrongDefectiveRate: wrongDefectiveRate.toFixed(2),
      constructEzyRate: constructEzyRate.toFixed(2),
      rtoRate: rtoRate.toFixed(2),
      totalRTO,
      totalDispatched,
      totalClaimsRaised,
      totalClaimsApproved,
      products: performance,
    })
  } catch (error) {
    return catchError(error, "Failed to fetch return overview.")
  }
}