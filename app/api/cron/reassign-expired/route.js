import connectDB from "@/lib/databaseConnection"
import { response, catchError } from "@/lib/helperfunction"
import { reassignExpiredItems } from "@/lib/itemAssignment"

export async function GET(request) {
  try {
    const secret = request.nextUrl.searchParams.get("secret")
    if (secret !== process.env.CRON_SECRET) return response(false, 401, "Unauthorized.")

    await connectDB()
    const results = await reassignExpiredItems()
    return response(true, 200, "Reassignment check complete.", { results })
  } catch (error) {
    return catchError(error, "Cron failed.")
  }
}