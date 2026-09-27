import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"
import ReturnModel from "@/models/Return.model"
import UserModel from "@/models/User.model"

export async function POST(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { type, id } = await request.json()
    // type: "order" | "return"

    if (!["order", "return"].includes(type) || !id) {
      return response(false, 400, "type and id required.")
    }

    let phone = null

    if (type === "order") {
      const order = await OrderModel.findOne({ order_id: id, deleteAt: null }).select("phone deliveryPartner")
      if (!order) return response(false, 404, "Order not found.")
      if (String(order.deliveryPartner) !== String(auth.userId)) {
        return response(false, 403, "This order is not assigned to you.")
      }
      phone = order.phone
    } else {
      const ret = await ReturnModel.findOne({
        _id: id,
        deliveryPartner: auth.userId,
        deletedAt: null,
      }).select("customerPhone")
      if (!ret) return response(false, 404, "Return not found or not assigned to you.")
      phone = ret.customerPhone
    }

    if (!phone) return response(false, 400, "Customer phone number not available.")

    if (!process.env.TELEPHONY_PROVIDER) {
      return response(
        false,
        501,
        "Calling feature setup pending — telephony provider (Exotel/Knowlarity) not configured yet."
      )
    }

    const deliveryBoy = await UserModel.findById(auth.userId).select("phone")
    if (!deliveryBoy?.phone) return response(false, 400, "Your phone number is not set on your profile.")

    // ── TODO: provider integration (Exotel/Knowlarity click-to-call) yahan aayegi ──

    return response(true, 200, "Calling customer now...")
  } catch (error) {
    return catchError(error, "Call failed.")
  }
}