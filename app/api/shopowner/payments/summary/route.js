import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import WalletTransactionModel from "@/models/WalletTransaction.model"
import UserModel from "@/models/User.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const lastPayment = await WalletTransactionModel.findOne({ shop: user.shop, status: "paid_out" }).sort({ paidOutAt: -1 })

    const outstandingAgg = await WalletTransactionModel.aggregate([
      { $match: { shop: user.shop, status: { $in: ["on_hold", "eligible"] } } },
      { $group: { _id: null, total: { $sum: "$netAmount" } } },
    ])
    const totalOutstanding = outstandingAgg[0]?.total || 0

    const nextPayment = await WalletTransactionModel.findOne({ shop: user.shop, status: { $in: ["on_hold", "eligible"] } }).sort({ eligibleAt: 1 })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const chartData = await WalletTransactionModel.aggregate([
      { $match: { shop: user.shop, status: "paid_out", paidOutAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidOutAt" } }, total: { $sum: "$netAmount" } } },
      { $sort: { _id: 1 } },
    ])

    return response(true, 200, "Summary fetched.", {
      lastPayment: lastPayment ? { amount: lastPayment.netAmount, date: lastPayment.paidOutAt } : null,
      totalOutstanding,
      nextPayment: nextPayment ? { amount: nextPayment.netAmount, dueDate: nextPayment.eligibleAt } : null,
      chartData: chartData.map((c) => ({ date: c._id, amount: c.total })),
    })
  } catch (error) {
    return catchError(error, "Failed to fetch summary.")
  }
}