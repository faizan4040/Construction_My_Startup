import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import NewsletterModel from "@/models/Newsletter.model"

export async function POST(request) {
  try {
    await connectDB()
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response(false, 400, "Invalid email address.")
    }

    // check duplicate
    const exists = await NewsletterModel.findOne({ email })
    if (exists) {
      return response(false, 400, "This email is already subscribed.")
    }

    await NewsletterModel.create({ email })
    return response(true, 200, "Subscribed successfully.")

  } catch (error) {
    return catchError(error)
  }
}