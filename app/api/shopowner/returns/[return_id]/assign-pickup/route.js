import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReturnModel from "@/models/Return.model"
import UserModel from "@/models/User.model"

export async function POST(request, { params }) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { return_id } = await params
    const { pickupMethod, courierPartnerId, deliveryPartnerId } = await request.json()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    const ret = await ReturnModel.findOne({ _id: return_id, shop: user.shop, deletedAt: null })
    if (!ret) return response(false, 404, "Return not found.")

    if (!["courier_partner", "delivery_boy"].includes(pickupMethod)) {
      return response(false, 400, "Invalid pickup method.")
    }

    if (pickupMethod === "courier_partner") {
      if (!courierPartnerId) return response(false, 400, "courierPartnerId required.")
      ret.pickupMethod = "courier_partner"
      ret.courierPartner = courierPartnerId
      ret.deliveryPartner = null
    } else {
      if (!deliveryPartnerId) return response(false, 400, "deliveryPartnerId required.")
      ret.pickupMethod = "delivery_boy"
      ret.deliveryPartner = deliveryPartnerId
      ret.courierPartner = null
    }

    ret.trackingHistory.push({ status: "approved", note: `Pickup assigned via ${pickupMethod}`, at: new Date() })
    ret.trackingStatus = "approved"
    await ret.save()

    return response(true, 200, "Pickup assigned successfully.", ret)
  } catch (error) {
    return catchError(error, "Failed to assign pickup.")
  }
}