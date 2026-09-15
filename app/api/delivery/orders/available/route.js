import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    // Simple version: sabhi on_hold orders dikhao. Baad me zone/pincode
    // filter add kar sakte ho (DeliveryProfile.serviceZones se match karke)
    const orders = await OrderModel.find({
      status: "on_hold",
      deleteAt: null,
    })
      .select("order_id name city state pincode totalAmount createdAt products")
      .sort({ createdAt: 1 }) // oldest first — jo zyada der se wait kar raha hai wo pehle
      .limit(50)

    return response(true, 200, "Available orders fetched.", orders)
  } catch (error) {
    return catchError(error, "Failed to fetch orders.")
  }
}