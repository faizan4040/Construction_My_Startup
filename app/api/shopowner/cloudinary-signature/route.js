import cloudinary from "@/lib/cloudinary"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import UserModel from "@/models/User.model"
import ShopModel from "@/models/Shop.model"

export async function POST() {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const shop = await ShopModel.findOne({ _id: user.shop, deletedAt: null }).select("slug")
    if (!shop) return response(false, 404, "Shop not found.")

    const timestamp = Math.round(Date.now() / 1000)
    const folder = `shops/${shop.slug}/products`

    // only sign the params you actually send back — must match cloudForm exactly
    const paramsToSign = { timestamp, folder }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_SECRET_KEY
    )

    return response(true, 200, "Signature generated.", {
      signature,
      timestamp,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder,
    })
  } catch (error) {
    return catchError(error)
  }
}