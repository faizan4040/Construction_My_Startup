import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import UserModel from "@/models/User.model"
import z from "zod"

const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional(),
})

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()

    const payload = await request.json()
    const validated = updateSchema.safeParse(payload)
    if (!validated.success) {
      return response(false, 400, "Invalid or missing fields.", validated.error)
    }

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null })
    if (!user) return response(false, 404, "User not found.")

    user.name = validated.data.name.trim()
    if (validated.data.phone) user.phone = validated.data.phone.trim()
    await user.save()

    return response(true, 200, "Profile updated successfully.")
  } catch (error) {
    return catchError(error, "Failed to update profile.")
  }
}