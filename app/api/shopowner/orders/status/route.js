import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"
import { NextResponse } from "next/server"

const EMPTY = { PaymentRefund: 0, OrderCancel: 0, OrderShipped: 0, OrderDelivering: 0, PendingReview: 0, PendingPayment: 0, Delivered: 0, InProgress: 0 }

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return NextResponse.json(EMPTY, { status: 401 })

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return NextResponse.json(EMPTY, { status: 400 })

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const counts = await OrderModel.aggregate([
      { $match: { deleteAt: null, "products.productId": { $in: shopProductIds } } },
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: shopProductIds } } },
      { $group: { _id: { $ifNull: ["$products.status", "pending"] }, count: { $sum: 1 } } },
    ])

    const map = {}
    counts.forEach((c) => { map[c._id] = c.count })

    return NextResponse.json({
      ...EMPTY,
      OrderCancel: map["cancelled"] || 0,
      OrderShipped: map["shipped"] || 0,
      Delivered: map["delivered"] || 0,
      InProgress: map["processing"] || 0,
    })
  } catch (error) {
    console.error("SHOP STATUS API ERROR:", error)
    return NextResponse.json(EMPTY, { status: 500 })
  }
}