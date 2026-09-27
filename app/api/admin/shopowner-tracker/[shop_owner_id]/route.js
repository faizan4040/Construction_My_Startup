import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import UserModel from "@/models/User.model"
import ShopModel from "@/models/Shop.model"
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
    if (!owner) return response(false, 404, "Shopowner not found.")

    const shop = owner.shop ? await ShopModel.findById(owner.shop).select("name slug logo") : null
    if (!shop) return response(false, 404, "This user has no shop linked.")

    const products = await ProductModel.find({ shop: shop._id, deletedAt: null })
      .select("name sellingPrice category media")
      .populate("category", "name")
      .populate("media", "secure_url url")
      .lean()

    const shopProductIds = products.map((p) => p._id)

    const earningsAgg = await OrderModel.aggregate([
      { $match: { deleteAt: null } },
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: shopProductIds } } },
      {
        $group: {
          _id: null,
          earnings: { $sum: { $multiply: ["$products.qty", "$products.sellingPrice"] } },
          itemsSold: { $sum: "$products.qty" },
          orderIds: { $addToSet: "$_id" },
        },
      },
    ])
    const stats = earningsAgg[0] || { earnings: 0, itemsSold: 0, orderIds: [] }

    const recentOrders = await OrderModel.find({ "products.productId": { $in: shopProductIds }, deleteAt: null })
      .select("order_id name status createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return response(true, 200, "Shopowner details fetched.", {
      owner,
      shop,
      productCount: products.length,
      orderCount: stats.orderIds.length,
      earnings: stats.earnings,
      itemsSold: stats.itemsSold,
      products,
      recentOrders,
    })
  } catch (error) {
    return catchError(error, "Failed to fetch shopowner details.")
  }
}