import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ClaimModel from "@/models/Claim.model"
import ReturnModel from "@/models/Return.model"
import UserModel from "@/models/User.model"

export async function GET(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status") // "open" | "approved" | "rejected" | null (=all)

    const query = { shop: user.shop, deletedAt: null }
    if (statusFilter && statusFilter !== "all") query.status = statusFilter

    const claims = await ClaimModel.find(query)
      .populate("return", "orderId productName qty reason")
      .sort({ createdAt: -1 })

    const counts = {
      all: await ClaimModel.countDocuments({ shop: user.shop, deletedAt: null }),
      open: await ClaimModel.countDocuments({ shop: user.shop, deletedAt: null, status: "open" }),
      approved: await ClaimModel.countDocuments({ shop: user.shop, deletedAt: null, status: "approved" }),
      rejected: await ClaimModel.countDocuments({ shop: user.shop, deletedAt: null, status: "rejected" }),
    }

    return response(true, 200, "Claims fetched.", { claims, counts })
  } catch (error) {
    return catchError(error, "Failed to fetch claims.")
  }
}

export async function POST(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const { returnId, reason } = await request.json()
    if (!returnId || !reason || reason.trim().length < 5) {
      return response(false, 400, "Return ID and a valid reason are required.")
    }

    const returnDoc = await ReturnModel.findOne({ _id: returnId, shop: user.shop, deletedAt: null })
    if (!returnDoc) return response(false, 404, "Return not found.")

    const claim = await ClaimModel.create({
      return: returnDoc._id,
      shop: user.shop,
      reason: reason.trim(),
    })

    return response(true, 200, "Claim raised successfully.", claim)
  } catch (error) {
    return catchError(error, "Failed to raise claim.")
  }
}