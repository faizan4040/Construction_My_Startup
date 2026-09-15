import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import NotificationModel from "@/models/Notification.model"

export async function GET(request) {
  try {
    const auth = await isAuthenticated() // koi bhi logged-in role
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const notifications = await NotificationModel
      .find({ user: auth.userId })
      .sort({ createdAt: -1 })
      .limit(limit)

    const unreadCount = await NotificationModel.countDocuments({ user: auth.userId, isRead: false })

    return response(true, 200, "Notifications fetched.", { notifications, unreadCount })
  } catch (error) {
    return catchError(error, "Failed to fetch notifications.")
  }
}