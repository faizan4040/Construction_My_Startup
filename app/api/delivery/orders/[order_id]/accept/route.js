import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { applyTransition } from "@/lib/orderStateMachine"
import { getOrderStatusEmail } from "@/lib/email/orderStatusMail"
import { sendMail } from "@/lib/sendMail"
import OrderModel from "@/models/Order.model"

export async function POST(request, { params }) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params

    const order = await OrderModel.findOne({ order_id, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    // Order-level transition
    applyTransition(order, "pending", "delivery_partner", auth.userId)
    // Every line item that's still on_hold moves too
    order.products.forEach((item) => {
      if (item.status === "on_hold") applyTransition(item, "pending", "delivery_partner", auth.userId)
    })
    order.deliveryPartner = auth.userId

    await order.save()

    const html = getOrderStatusEmail("pending", order)
    if (html) await sendMail(order.email, "Order Update - ConstructEzy", html)

    return response(true, 200, "Order moved to pending.", order)
  } catch (error) {
    return catchError(error, "Failed to accept pickup.")
  }
}