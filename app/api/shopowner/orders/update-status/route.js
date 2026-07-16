import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { orderstatus } from "@/lib/utils"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const { _id, status } = await request.json()
    if (!_id || !status) return response(false, 400, "Order id and status are required.")

    const normalizedStatus = status.toLowerCase().trim()
    if (!orderstatus.includes(normalizedStatus)) return response(false, 400, "Invalid order status.")

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const order = await OrderModel.findOne({ _id, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    // only touch line-items belonging to THIS shop — the rest of the order is untouched
    let touched = false
    order.products.forEach((p) => {
      if (shopProductIds.some((id) => id.equals(p.productId))) {
        p.status = normalizedStatus
        touched = true
      }
    })

    if (!touched) return response(false, 404, "None of your products are in this order.")

    await order.save()
    return response(true, 200, "Your item status updated successfully.", order)
  } catch (error) {
    return catchError(error)
  }
}