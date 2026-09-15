import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import NotificationModel from "@/models/Notification.model"

export async function POST(request) {
  try {
    const auth = await isAuthenticated()
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { ids } = await request.json() // array of notification _ids, ya "all"

    const filter = { user: auth.userId }
    if (ids !== "all") filter._id = { $in: ids }

    await NotificationModel.updateMany(filter, { $set: { isRead: true } })

    return response(true, 200, "Marked as read.")
  } catch (error) {
    return catchError(error, "Failed to update notifications.")
  }
}