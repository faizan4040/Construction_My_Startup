import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { geocodeAddress } from "@/lib/geocode"
import OrderModel from "@/models/Order.model"

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params

    const order = await OrderModel.findOne({ order_id, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    // ── Cache: geocode only once per order, reuse afterwards ──
    if (order.customerLocation?.lat) {
      return response(true, 200, "Location fetched.", order.customerLocation)
    }

    const fullAddress = `${order.address}, ${order.city}, ${order.state} ${order.pincode}, India`
    const location = await geocodeAddress(fullAddress)

    if (!location) return response(false, 400, "Could not locate this address on the map.")

    order.customerLocation = location
    await order.save()

    return response(true, 200, "Location fetched.", location)
  } catch (error) {
    return catchError(error, "Failed to fetch location.")
  }
}