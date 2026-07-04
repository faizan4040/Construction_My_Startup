import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import { zSchema } from "@/lib/zodSchema"
import UserModel from "@/models/User.model"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function PUT(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const payload = await request.json()
    const { _id, ...rest } = payload
    if (!_id) return response(false, 400, "Variant id is required.")

    const validationSchema = zSchema.pick({
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

    const validatedData = validationSchema.safeParse(rest)
    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error)
    }

    const variant = await ProductVariantModel.findOne({ _id, deletedAt: null }).populate("product", "shop")
    if (!variant) return response(false, 404, "Variant not found.")

    // ownership guard via parent product
    if (String(variant.product.shop) !== String(user.shop)) {
      return response(false, 404, "Variant not found or not owned by you.")
    }

    Object.assign(variant, validatedData.data)
    await variant.save()

    return response(true, 200, "Variant updated successfully.", variant)
  } catch (error) {
    return catchError(error)
  }
}