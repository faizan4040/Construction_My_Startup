import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"

export async function POST(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { orderId } = await request.json()

    const order = await OrderModel.findOne({ order_id: orderId, deliveryPartner: auth.userId, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    order.paymentStatus = "Paid" // cash collected — treat as settled
    await order.save()

    return response(true, 200, "Cash collection recorded.")
  } catch (error) {
    return catchError(error, "Failed to record cash collection.")
  }
}