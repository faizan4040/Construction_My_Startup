import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReturnModel from "@/models/Return.model"

export async function GET(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.trim() || ""

    const filter = {
      deliveryPartner: auth.userId,
      pickupMethod: "delivery_boy",
      trackingStatus: { $in: ["approved", "picked_up", "in_transit"] },
      deletedAt: null,
    }

    if (query) {
      filter.customerName = { $regex: query, $options: "i" }
    }

    const returns = await ReturnModel.find(filter)
      .select("orderId productName qty customerName trackingStatus reasonCategory createdAt")
      .sort({ createdAt: -1 })
      .limit(50)

    return response(true, 200, "Returns fetched.", returns)
  } catch (error) {
    return catchError(error, "Failed to fetch returns.")
  }
}