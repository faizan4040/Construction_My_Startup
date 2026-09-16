import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import SupportTicketModel from "@/models/SupportTicket.model"

export async function GET() {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const tickets = await SupportTicketModel.find({ user: auth.userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(100)

    return response(true, 200, "Tickets fetched.", tickets)
  } catch (error) {
    return catchError(error, "Failed to fetch tickets.")
  }
}