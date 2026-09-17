import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const orders = await OrderModel.find({
      deliveryPartner: auth.userId,
      deleteAt: null,
      status: { $ne: "cancelled" },
    })
      .select("order_id name phone city state pincode address landmark totalAmount status paymentMode paymentStatus products")
      .sort({ createdAt: -1 })
      .limit(50)

    return response(true, 200, "My orders fetched.", orders)
  } catch (error) {
    return catchError(error, "Failed to fetch orders.")
  }
}