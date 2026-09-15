import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { applyTransition } from "@/lib/orderStateMachine"
import { getOrderStatusEmail } from "@/lib/mail/orderStatusMail"
import { sendMail } from "@/lib/sendMail"
import OrderModel from "@/models/Order.model"

export async function POST(request, { params }) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params
    const { reason } = await request.json()

    const order = await OrderModel.findOne({ order_id, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    order.products.forEach((item) => {
      if (["on_hold", "pending"].includes(item.status)) {
        applyTransition(item, "cancelled", "shopowner", auth.userId, reason || "")
      }
    })

    if (order.products.every((p) => p.status === "cancelled")) {
      applyTransition(order, "cancelled", "shopowner", auth.userId, reason || "")
    }

    await order.save()

    const html = getOrderStatusEmail("cancelled", order)
    if (html) await sendMail(order.email, "Order Cancelled - ConstructEzy", html)

    return response(true, 200, "Order cancelled.", order)
  } catch (error) {
    return catchError(error, "Failed to cancel order.")
  }
}