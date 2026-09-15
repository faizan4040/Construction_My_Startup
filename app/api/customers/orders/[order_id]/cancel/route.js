import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { applyTransition } from "@/lib/orderStateMachine"
import { getOrderStatusEmail } from "@/lib/email/orderStatusMail"
import { sendMail } from "@/lib/sendMail"
import OrderModel from "@/models/Order.model"

export async function POST(request, { params }) {
  try {
    const auth = await isAuthenticated("customer")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params

    const order = await OrderModel.findOne({ order_id, user: auth.userId, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    // Cancel allowed only up to on_hold/pending — packed/shipped items ka waste na ho
    const uncancellable = order.products.some((p) => ["ready_to_ship", "shipped", "delivered"].includes(p.status))
    if (uncancellable) return response(false, 400, "This order can no longer be cancelled — it's already being processed.")

    order.products.forEach((item) => applyTransition(item, "cancelled", "customer", auth.userId))
    applyTransition(order, "cancelled", "customer", auth.userId)

    await order.save()

    const html = getOrderStatusEmail("cancelled", order)
    if (html) await sendMail(order.email, "Order Cancelled - ConstructEzy", html)

    return response(true, 200, "Order cancelled successfully.")
  } catch (error) {
    return catchError(error, "Cancellation failed.")
  }
}