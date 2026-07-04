import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import { zSchema } from "@/lib/zodSchema"
import CategoryModel from "@/models/Category.model"

export async function POST(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const payload = await request.json()

    const validationSchema = zSchema.pick({ name: true, slug: true })
    const validatedData = validationSchema.safeParse(payload)
    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error)
    }

    const category = new CategoryModel(validatedData.data)
    await category.save()

    return response(true, 200, "Category added successfully.", category)
  } catch (error) {
    return catchError(error)
  }
}