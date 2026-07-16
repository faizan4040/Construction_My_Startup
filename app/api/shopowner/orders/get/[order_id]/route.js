import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const { order_id } = await params
    if (!order_id) return response(false, 404, "Order not found.")

    const orderData = await OrderModel.findOne({ order_id })
      .populate("products.productId", "name slug")
      .populate({ path: "products.variantId", populate: { path: "media" } })
      .lean()

    if (!orderData) return response(false, 404, "Order not found.")

    // keep only this shop's own line-items — never expose other sellers' items/data
    orderData.products = orderData.products.filter((p) =>
      shopProductIds.some((id) => id.toString() === p.productId?._id?.toString())
    )
    if (!orderData.products.length) return response(false, 404, "Order not found.")

    // recompute totals as THIS shop's slice — the order-level discount/coupon
    // can't be honestly split per-seller without a business rule, so it's zeroed
    // here rather than shown as if it were exact
    const subtotal = orderData.products.reduce((sum, p) => sum + p.qty * p.sellingPrice, 0)
    orderData.subtotal = subtotal
    orderData.totalAmount = subtotal
    orderData.discount = 0
    orderData.couponDiscount = 0

    return response(true, 200, "Order found.", orderData)
  } catch (error) {
    return catchError(error)
  }
}