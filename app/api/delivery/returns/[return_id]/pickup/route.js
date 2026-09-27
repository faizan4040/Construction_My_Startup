import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReturnModel from "@/models/Return.model"

const NEXT_STATUS = {
  approved: "picked_up",
  picked_up: "in_transit",
}

export async function POST(request, { params }) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { return_id } = await params

    const ret = await ReturnModel.findOne({
      _id: return_id,
      deliveryPartner: auth.userId,
      deletedAt: null,
    })
    if (!ret) return response(false, 404, "Return not found or not assigned to you.")

    const nextStatus = NEXT_STATUS[ret.trackingStatus]
    if (!nextStatus) {
      return response(false, 400, `Cannot advance from status: ${ret.trackingStatus}`)
    }

    ret.trackingStatus = nextStatus
    ret.trackingHistory.push({
      status: nextStatus,
      note: nextStatus === "picked_up" ? "Item picked up from customer" : "In transit to warehouse",
      at: new Date(),
    })
    await ret.save()

    return response(true, 200, `Marked as ${nextStatus.replace(/_/g, " ")}.`, ret)
  } catch (error) {
    return catchError(error, "Failed to update pickup status.")
  }
}