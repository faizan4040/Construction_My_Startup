import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import UserModel from "@/models/User.model"

export async function POST(request) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { lat, lng } = await request.json()

    if (typeof lat !== "number" || typeof lng !== "number") {
      return response(false, 400, "Valid lat/lng required.")
    }

    // GeoJSON format me save — future me admin-tracking-map / nearest-delivery-boy
    // jaisi features ke liye reuse ho sakega
    await UserModel.findByIdAndUpdate(auth.userId, {
      location: { type: "Point", coordinates: [lng, lat] },
      isOnline: true,
    })

    return response(true, 200, "Location updated.")
  } catch (error) {
    return catchError(error, "Failed to update location.")
  }
}