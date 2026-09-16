import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ShopCourierPreferenceModel from "@/models/ShopCourierPreference.model"
import UserModel from "@/models/User.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const prefs = await ShopCourierPreferenceModel.find({ shop: user.shop })
      .populate("courierPartner", "name code reverseShippingCharge")
      .sort({ preference: 1 })

    return response(true, 200, "Preferences fetched.", prefs)
  } catch (error) {
    return catchError(error, "Failed to fetch preferences.")
  }
}

export async function POST(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const { order } = await request.json() // array of courierPartner IDs in preferred order

    await ShopCourierPreferenceModel.deleteMany({ shop: user.shop })
    const docs = order.map((courierPartnerId, index) => ({
      shop: user.shop,
      courierPartner: courierPartnerId,
      preference: index + 1,
    }))
    await ShopCourierPreferenceModel.insertMany(docs)

    return response(true, 200, "Preference saved.")
  } catch (error) {
    return catchError(error, "Failed to save preference.")
  }
}