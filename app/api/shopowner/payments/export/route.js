import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import WalletTransactionModel from "@/models/WalletTransaction.model"
import UserModel from "@/models/User.model"
import ExcelJS from "exceljs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const transactions = await WalletTransactionModel.find({ shop: user.shop }).sort({ createdAt: -1 })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("Payments")

    sheet.columns = [
      { header: "Order ID", key: "orderId", width: 22 },
      { header: "Product", key: "productName", width: 30 },
      { header: "Payment Date", key: "date", width: 18 },
      { header: "Order Amount", key: "grossAmount", width: 15 },
      { header: "Platform Recovery", key: "platformRecovery", width: 18 },
      { header: "Platform Compensation", key: "platformCompensation", width: 20 },
      { header: "Net Amount", key: "netAmount", width: 15 },
      { header: "Status", key: "status", width: 14 },
      { header: "UTR", key: "utr", width: 20 },
    ]

    transactions.forEach((t) => {
      sheet.addRow({
        orderId: t.orderId,
        productName: t.productName,
        date: t.paidOutAt ? new Date(t.paidOutAt).toLocaleDateString("en-IN") : "-",
        grossAmount: t.grossAmount,
        platformRecovery: t.platformRecovery,
        platformCompensation: t.platformCompensation,
        netAmount: t.netAmount,
        status: t.status,
        utr: t.utr || "-",
      })
    })

    sheet.getRow(1).font = { bold: true }
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="payments-${Date.now()}.xlsx"`,
      },
    })
  } catch (error) {
    return catchError(error, "Failed to export payments.")
  }
}