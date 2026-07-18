import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import UserModel from "@/models/User.model"
import ProductModel from "@/models/Product.model"
import OrderModel from "@/models/Order.model"

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")

    await connectDB()

    const { shop_owner_id } = await params
    const owner = await UserModel.findOne({ _id: shop_owner_id, role: "shop owner", deletedAt: null })
      .select("name email phone avatar isBlocked blockedAt blockReason shop createdAt")
      .populate("shop", "name slug description logo createdAt")
      .lean()

    if (!owner) return response(false, 404, "Shop owner not found.")
    if (!owner.shop) return response(false, 400, "No shop linked to this account.")

    const shopId = owner.shop._id

    const products = await ProductModel.find({ shop: shopId, deletedAt: null })
      .populate("media", "secure_url")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean()

    const productIds = products.map((p) => p._id)

    const earningsAgg = await OrderModel.aggregate([
      { $match: { deleteAt: null, "products.productId": { $in: productIds } } },
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: productIds } } },
      {
        $group: {
          _id: null,
          earnings: { $sum: { $multiply: ["$products.qty", "$products.sellingPrice"] } },
          orderIds: { $addToSet: "$_id" },
          itemsSold: { $sum: "$products.qty" },
        },
      },
    ])

    const stats = earningsAgg[0] || { earnings: 0, itemsSold: 0 }

    const recentOrders = await OrderModel.aggregate([
      { $match: { deleteAt: null, "products.productId": { $in: productIds } } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          order_id: 1,
          name: 1,
          status: 1,
          createdAt: 1,
          products: {
            $filter: { input: "$products", as: "p", cond: { $in: ["$$p.productId", productIds] } },
          },
        },
      },
    ])

    return response(true, 200, "Shop details fetched.", {
      owner: {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        avatar: owner.avatar,
        isBlocked: owner.isBlocked,
        blockedAt: owner.blockedAt,
        blockReason: owner.blockReason,
        joinedAt: owner.createdAt,
      },
      shop: owner.shop,
      productCount: products.length,
      orderCount: earningsAgg[0]?.orderIds?.length || 0,
      earnings: stats.earnings,
      itemsSold: stats.itemsSold,
      products,
      recentOrders,
    })
  } catch (error) {
    return catchError(error)
  }
}