import { isAuthenticated } from "@/lib/authentication"
import { catchError, response } from "@/lib/helperfunction"
import connectDB from "@/lib/databaseConnection"
import OrderModel from "@/models/Order.model"
import mongoose from "mongoose"

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 401, "Unauthorized")
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const after = searchParams.get("after")

    const match = { deletedAt: null }
    if (after && mongoose.Types.ObjectId.isValid(after)) {
      match._id = { $gt: new mongoose.Types.ObjectId(after) }
    }

    const newOrders = await OrderModel.find(match)
      .sort({ _id: -1 })
      .limit(50)
      .select("_id payment_id status totalAmount createdAt")
      .lean()

    return response(true, 200, "New orders found.", newOrders)
  } catch (error) {
    return catchError(error)
  }
}