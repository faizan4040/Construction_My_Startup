import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import WalletTransactionModel from "@/models/WalletTransaction.model"
import UserModel from "@/models/User.model"

export async function GET(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    const query = { shop: user.shop }
    if (search) query.orderId = new RegExp(search, "i")

    const transactions = await WalletTransactionModel.find(query).sort({ createdAt: -1 }).limit(200)

    const summary = transactions.reduce((acc, t) => {
      acc.totalNetOrderAmount += t.grossAmount
      acc.totalNetPlatformRecovery += t.platformRecovery
      acc.totalNetPlatformCompensation += t.platformCompensation
      acc.totalAmount += t.netAmount
      return acc
    }, { totalNetOrderAmount: 0, totalNetPlatformRecovery: 0, totalNetPlatformCompensation: 0, totalAmount: 0 })

    return response(true, 200, "Payments fetched.", { transactions, summary })
  } catch (error) {
    return catchError(error, "Failed to fetch payments.")
  }
}