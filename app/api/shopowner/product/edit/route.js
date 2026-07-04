import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import { zSchema } from "@/lib/zodSchema";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";

export async function PUT(request) {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    const payload = await request.json();
    const { _id, ...rest } = payload;

    if (!_id) return response(false, 400, "Product id is required.");

    const validationSchema = zSchema.pick({
      name: true,
      slug: true,
      category: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      media: true,
      description: true,
    });

    const validatedData = validationSchema.safeParse(rest);
    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error);
    }

    // ownership guard — can only edit products belonging to THIS shop
    const product = await ProductModel.findOne({ _id, shop: user.shop, deletedAt: null });
    if (!product) return response(false, 404, "Product not found or not owned by you.");

    Object.assign(product, validatedData.data);
    await product.save();

    return response(true, 200, "Product updated successfully.", product);
  } catch (error) {
    return catchError(error);
  }
}