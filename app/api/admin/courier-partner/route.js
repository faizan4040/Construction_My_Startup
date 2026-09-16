import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import CourierPartnerModel from "@/models/CourierPartner.model"

export async function POST(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { name, code, reverseShippingCharge } = await request.json()

    if (!name || !code || reverseShippingCharge == null) {
      return response(false, 400, "Name, code, and reverseShippingCharge are required.")
    }

    const partner = await CourierPartnerModel.create({ name, code: code.toLowerCase(), reverseShippingCharge })
    return response(true, 200, "Courier partner added.", partner)
  } catch (error) {
    return catchError(error, "Failed to add courier partner.")
  }
}

export async function GET() {
  try {
    await connectDB()
    const partners = await CourierPartnerModel.find().sort({ createdAt: 1 })
    return response(true, 200, "Fetched.", partners)
  } catch (error) {
    return catchError(error)
  }
}