import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ProductModel from "@/models/Product.model"
import OrderModel from "@/models/Order.model"
import UserModel from "@/models/User.model"
import mongoose from "mongoose"

export async function GET(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const { searchParams } = new URL(request.url)
    const after = searchParams.get("after")

    const match = {
      deleteAt: null,
      "products.productId": { $in: shopProductIds },
    }

    // Only fetch orders newer than the last one the client already saw.
    // On first load (no "after" yet), we just cap at the 50 most recent.
    if (after && mongoose.Types.ObjectId.isValid(after)) {
      match._id = { $gt: new mongoose.Types.ObjectId(after) }
    }

    const newOrders = await OrderModel.aggregate([
      { $match: match },
      { $sort: { _id: -1 } },
      { $limit: 50 },
      {
        $project: {
          _id: 1,
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
          status: 1,
          createdAt: 1,
          products: 1,
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

    return response(true, 200, "New orders found.", newOrders)
  } catch (error) {
    return catchError(error)
  }
}