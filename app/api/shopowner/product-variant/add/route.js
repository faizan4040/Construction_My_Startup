import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import { zSchema } from "@/lib/zodSchema"
import UserModel from "@/models/User.model"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function POST(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const payload = await request.json()

    const validationSchema = zSchema.pick({
      product: true,
      color: true,
      size: true,
      gender: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      sku: true,
      stock: true,
      media: true,
    })

    const validatedData = validationSchema.safeParse(payload)
    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error)
    }

    // ownership guard: the parent product must belong to THIS shop
    const product = await ProductModel.findOne({
      _id: validatedData.data.product,
      shop: user.shop,
      deletedAt: null,
    })
    if (!product) return response(false, 404, "Product not found or not owned by you.")

    const variant = new ProductVariantModel(validatedData.data)
    await variant.save()

    return response(true, 200, "Variant added successfully.", variant)
  } catch (error) {
    return catchError(error)
  }
}