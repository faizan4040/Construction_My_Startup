import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import { zSchema } from "@/lib/zodSchema"
import CategoryModel from "@/models/Category.model"

// "Red Bricks & Co." -> "red-bricks-co"
const generateSlug = (name) =>
  name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")  // special characters hatao
    .replace(/\s+/g, "-")          // spaces ko hyphen se replace karo
    .replace(/-+/g, "-")           // multiple hyphens ko ek me convert karo

export async function POST(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const payload = await request.json()

    // 🔥 ab frontend se sirf 'name' hi chahiye — slug yahin se generate hoga
    const validationSchema = zSchema.pick({ name: true })
    const validatedData = validationSchema.safeParse(payload)
    if (!validatedData.success) {
      return response(false, 400, "Invalid or missing input field.", validatedData.error)
    }

    const { name } = validatedData.data
    let slug = generateSlug(name)

    // agar same slug pehle se exist karta hai to end me short random suffix laga do
    const existing = await CategoryModel.findOne({ slug })
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`
    }

    const category = new CategoryModel({ name, slug })
    await category.save()

    return response(true, 200, "Category added successfully.", category)
  } catch (error) {
    return catchError(error)
  }
}


