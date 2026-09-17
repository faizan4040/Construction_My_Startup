import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { applyTransition } from "@/lib/orderStateMachine"
import { getOrderStatusEmail } from "@/lib/email/orderStatusMail"
import { sendMail } from "@/lib/sendMail"
import { isAuthenticated } from "@/lib/authentication"
import OrderModel from "@/models/Order.model"

export async function POST(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { labelCode: rawScanned } = await request.json()

    if (!rawScanned) return response(false, 400, "No label data received.")

    // Safety-net: agar purana URL-wala QR scan ho gaya, uska last segment nikaal lo
    // (naye labels ab plain labelCode hi encode karte hain)
    const labelCode = rawScanned.includes("/")
      ? rawScanned.split("/").filter(Boolean).pop()
      : rawScanned

    const order = await OrderModel.findOne({ "products.labelCode": labelCode, deleteAt: null })
    if (!order) return response(false, 404, "Invalid or unknown label.")

    const item = order.products.find((p) => p.labelCode === labelCode)
    if (!item) return response(false, 404, "Label matched order but item not found.")

    if (item.status !== "ready_to_ship") {
      return response(false, 400, `Cannot ship item in status: ${item.status}`)
    }

    applyTransition(item, "shipped", "courier", auth.userId)

    if (order.products.every((p) => p.status === "shipped" || p.status === "cancelled")) {
      applyTransition(order, "shipped", "courier", auth.userId)
    }

    await order.save()

    const html = getOrderStatusEmail("shipped", order)
    if (html) await sendMail(order.email, "Order Shipped - ConstructEzy", html)

    return response(true, 200, `Scanned: ${item.name}`, { item })
  } catch (error) {
    return catchError(error, "Scan failed.")
  }
}