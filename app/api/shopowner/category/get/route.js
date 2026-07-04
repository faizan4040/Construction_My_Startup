import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import CategoryModel from "@/models/Category.model"

export async function GET() {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const categories = await CategoryModel.find({ deletedAt: null })
      .sort({ name: 1 })
      .lean()

    return response(true, 200, "Categories found.", categories)
  } catch (error) {
    return catchError(error)
  }
}