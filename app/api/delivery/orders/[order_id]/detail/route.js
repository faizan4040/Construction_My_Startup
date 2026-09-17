import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params

    const order = await OrderModel.findOne({
      order_id,
      deliveryPartner: auth.userId, // ── sirf apna assigned order hi dekh sake ──
      deleteAt: null,
    })

    if (!order) return response(false, 404, "Order not found or not assigned to you.")

    return response(true, 200, "Order detail fetched.", order)
  } catch (error) {
    return catchError(error, "Failed to fetch order detail.")
  }
}