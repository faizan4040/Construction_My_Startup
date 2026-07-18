import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import UserModel from "@/models/User.model"
import ProductModel from "@/models/Product.model"
import OrderModel from "@/models/Order.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")

    await connectDB()

    const shopOwners = await UserModel.find({ role: "shop owner", deletedAt: null })
      .select("name email avatar isBlocked blockedAt blockReason shop createdAt")
      .populate("shop", "name slug logo")
      .sort({ createdAt: -1 })
      .lean()

    // product count per shop (single query for all shops)
    const productCounts = await ProductModel.aggregate([
      { $match: { shop: { $ne: null }, deletedAt: null } },
      { $group: { _id: "$shop", count: { $sum: 1 } } },
    ])
    const productCountMap = {}
    productCounts.forEach((p) => { productCountMap[p._id.toString()] = p.count })

    // earnings + order count per shop (single query for all shops, via $lookup to Product)
    const earningsAgg = await OrderModel.aggregate([
      { $match: { deleteAt: null } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      { $unwind: "$productDoc" },
      { $match: { "productDoc.shop": { $ne: null } } },
      {
        $group: {
          _id: "$productDoc.shop",
          earnings: { $sum: { $multiply: ["$products.qty", "$products.sellingPrice"] } },
          orderIds: { $addToSet: "$_id" },
        },
      },
      { $project: { _id: 1, earnings: 1, orderCount: { $size: "$orderIds" } } },
    ])
    const earningsMap = {}
    earningsAgg.forEach((e) => { earningsMap[e._id.toString()] = e })

    const result = shopOwners.map((owner) => {
      const shopId = owner.shop?._id?.toString()
      return {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        avatar: owner.avatar,
        isBlocked: owner.isBlocked,
        blockedAt: owner.blockedAt,
        blockReason: owner.blockReason,
        joinedAt: owner.createdAt,
        shop: owner.shop,
        productCount: shopId ? productCountMap[shopId] || 0 : 0,
        orderCount: shopId ? earningsMap[shopId]?.orderCount || 0 : 0,
        earnings: shopId ? earningsMap[shopId]?.earnings || 0 : 0,
      }
    })

    return response(true, 200, "Shopowners fetched successfully.", result)
  } catch (error) {
    return catchError(error)
  }
}