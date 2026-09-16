import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReturnModel from "@/models/Return.model"
import UserModel from "@/models/User.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const returns = await ReturnModel.find({ shop: user.shop, deletedAt: null })
      .populate("courierPartner", "name code")
      .sort({ createdAt: -1 })
      .limit(100)

    return response(true, 200, "Tracking data fetched.", returns)
  } catch (error) {
    return catchError(error, "Failed to fetch tracking data.")
  }
}