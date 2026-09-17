import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { getPaymentQRStatus } from "@/lib/razorpayQR"
import OrderModel from "@/models/Order.model"

export async function GET(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    const order = await OrderModel.findOne({ order_id: orderId, deliveryPartner: auth.userId, deleteAt: null })
    if (!order?.paymentQRId) return response(false, 400, "No active QR for this order.")

    const qrStatus = await getPaymentQRStatus(order.paymentQRId)
    const isPaid = qrStatus.status === "closed" && qrStatus.payments_amount_received > 0

    if (isPaid && order.paymentStatus !== "Paid") {
      order.paymentStatus = "Paid"
      await order.save()
    }

    return response(true, 200, "Status checked.", { paid: isPaid })
  } catch (error) {
    return catchError(error, "Failed to check payment status.")
  }
}