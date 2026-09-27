import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"

export async function GET(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.trim() || ""

    const filter = {
      deliveryPartner: auth.userId,
      deleteAt: null,
      status: { $ne: "cancelled" },
    }

    // customer-name se search — "delivery boy jab deliver karne jae to user
    // ke naam se product search kare" wala requirement
    if (query) {
      filter.name = { $regex: query, $options: "i" }
    }

    const orders = await OrderModel.find(filter)
      // SECURITY FIX: 'phone' field yahan se HATA diya — list-view me kabhi expose nahi hoga
      .select("order_id name city state pincode landmark totalAmount status paymentMode paymentStatus products")
      .sort({ createdAt: -1 })
      .limit(50)

    return response(true, 200, "My orders fetched.", orders)
  } catch (error) {
    return catchError(error, "Failed to fetch orders.")
  }
}