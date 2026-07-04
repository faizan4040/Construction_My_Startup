import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";

export async function DELETE(request) {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    const { id } = await request.json();
    if (!id) return response(false, 400, "Product id is required.");

    // ownership check: only allow deleting products belonging to THIS shop
    const product = await ProductModel.findOne({ _id: id, shop: user.shop });
    if (!product) return response(false, 404, "Product not found or not owned by you.");

    product.deletedAt = new Date();
    await product.save();

    return response(true, 200, "Product deleted successfully.");
  } catch (error) {
    return catchError(error);
  }
}