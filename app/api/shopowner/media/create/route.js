import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import MediaModel from "@/models/Media.model"

export async function POST(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const payload = await request.json()
    const { asset_id, public_id, secure_url, format } = payload

    if (!asset_id || !public_id || !secure_url) {
      return response(false, 400, "Incomplete media data from Cloudinary.")
    }

    // build a lightweight thumbnail via Cloudinary transformation (no extra upload needed)
    const thumbnail_url = secure_url.replace("/upload/", "/upload/w_200,h_200,c_fill,q_auto/")

    const media = new MediaModel({
      asset_id,
      public_id,
      path: public_id,
      thumbnail_url,
      secure_url,
    })

    await media.save()

    return response(true, 200, "Media saved.", media)
  } catch (error) {
    return catchError(error)
  }
}