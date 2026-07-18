import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { sendShopStatusEmail } from "@/lib/email/shopStatusEmail"
import UserModel from "@/models/User.model"

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")

    await connectDB()

    const { userId, block, reason = "" } = await request.json()
    if (!userId || typeof block !== "boolean") {
      return response(false, 400, "userId and block (boolean) are required.")
    }

    const user = await UserModel.findOne({ _id: userId, role: "shop owner", deletedAt: null })
      .populate("shop", "name")

    if (!user) return response(false, 404, "Shop owner not found.")

    user.isBlocked = block
    user.blockedAt = block ? new Date() : null
    user.blockReason = block ? reason : ""
    await user.save()

    let emailSent = false
    try {
      await sendShopStatusEmail({
        to: user.email,
        shopOwnerName: user.name,
        shopName: user.shop?.name,
        blocked: block,
        reason,
      })
      emailSent = true
    } catch (err) {
      console.error("[toggle-block] email failed:", err.message)
    }

    return response(true, 200, block
      ? `Shop owner blocked.${emailSent ? " Email sent." : " (Email failed to send.)"}`
      : `Shop owner unblocked.${emailSent ? " Email sent." : " (Email failed to send.)"}`
    )
  } catch (error) {
    return catchError(error)
  }
}