import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { createPaymentQR } from "@/lib/razorpayQR"
import OrderModel from "@/models/Order.model"

export async function POST(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { orderId } = await request.json()

    const order = await OrderModel.findOne({ order_id: orderId, deliveryPartner: auth.userId, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")
    if (order.paymentStatus === "Paid") return response(false, 400, "This order is already paid.")

    const qr = await createPaymentQR({
      amount: order.totalAmount,
      orderId: order.order_id,
      description: `ConstructEzy order ${order.order_id}`,
    })

    order.paymentQRId = qr.id
    await order.save()

    return response(true, 200, "QR generated.", { qrCodeId: qr.id, imageUrl: qr.image_url })
  } catch (error) {
    return catchError(error, "Failed to generate payment QR.")
  }
}