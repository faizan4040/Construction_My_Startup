import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { sendMail } from "@/lib/sendMail"
import { accountBlockedEmail } from "@/lib/email/accountBlocked"
import { accountUnblockedEmail } from "@/lib/email/accountUnblocked"
import UserModel from "@/models/User.model"
import ShopModel from "@/models/Shop.model"

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")

    await connectDB()
    const { userId, block, reason } = await request.json()

    if (!userId) return response(false, 400, "userId is required.")

    const user = await UserModel.findOne({ _id: userId, role: "shop owner", deletedAt: null })
    if (!user) return response(false, 404, "Shopowner not found.")

    const shop = user.shop ? await ShopModel.findById(user.shop).select("name") : null
    const shopName = shop?.name || "your shop"

    if (block) {
      user.isBlocked = true
      user.blockedAt = new Date()
      user.blockReason = reason || ""
    } else {
      user.isBlocked = false
      user.blockedAt = null
      user.blockReason = ""
    }
    await user.save()

    // ── Email — best-effort, doesn't block the response if it fails ──
    try {
      const html = block
        ? accountBlockedEmail({ shopOwnerName: user.name, shopName, reason })
        : accountUnblockedEmail({ shopOwnerName: user.name, shopName })

      await sendMail(
        block ? "Your ConstructEzy account has been suspended" : "Your ConstructEzy account has been restored",
        user.email,
        html
      )
    } catch (mailError) {
      // account status already saved — email failure shouldn't undo it
    }

    return response(true, 200, block ? "Shopowner blocked and notified via email." : "Shopowner unblocked and notified via email.")
  } catch (error) {
    return catchError(error, "Failed to update shopowner status.")
  }
}