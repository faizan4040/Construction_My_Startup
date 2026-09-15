import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { applyTransition } from "@/lib/orderStateMachine"
import { getOrderStatusEmail } from "@/lib/email/orderStatusMail"
import { sendMail } from "@/lib/sendMail"
import { isAuthenticated } from "@/lib/authentication"
import { generateOTP } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"

// Step 1: courier requests OTP be sent to customer before handover
export async function PUT(request) {
  const auth = await isAuthenticated("delivery boy")
  if (!auth.isAuth) return response(false, 401, "Unauthorized.")

  await connectDB()
  const { labelCode } = await request.json()

  const order = await OrderModel.findOne({ "products.labelCode": labelCode, deleteAt: null })
  const item = order?.products.find((p) => p.labelCode === labelCode)
  if (!item || item.status !== "shipped") return response(false, 400, "Item not in shipped state.")

  const otp = generateOTP()
  item.deliveryOtp = otp
  await order.save()

  // send OTP to customer's email/phone (SMS integration can go here)
  return response(true, 200, "OTP sent to customer.")
}

// Step 2: customer reads OTP to courier, courier submits it here to confirm
export async function POST(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { labelCode, otp } = await request.json()

    const order = await OrderModel.findOne({ "products.labelCode": labelCode, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    const item = order.products.find((p) => p.labelCode === labelCode)
    if (item.deliveryOtp !== otp) return response(false, 400, "Invalid OTP.")

    applyTransition(item, "delivered", "courier", auth.userId)
    item.deliveryOtp = null

    if (order.products.every((p) => p.status === "delivered" || p.status === "cancelled")) {
      applyTransition(order, "delivered", "courier", auth.userId)
    }

    await order.save()

    const html = getOrderStatusEmail("delivered", order)
    if (html) await sendMail(order.email, "Order Delivered - ConstructEzy", html)

    return response(true, 200, "Delivery confirmed.")
  } catch (error) {
    return catchError(error, "Delivery confirmation failed.")
  }
}