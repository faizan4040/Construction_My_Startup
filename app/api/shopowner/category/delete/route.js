import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import CategoryModel from "@/models/Category.model";
import UserModel from "@/models/User.model";

export async function DELETE(request) {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    const { id } = await request.json();
    if (!id) return response(false, 400, "Category id is required.");

    // can only delete categories owned by this shop, never global/admin ones
    const category = await CategoryModel.findOne({ _id: id, shop: user.shop, deletedAt: null });
    if (!category) return response(false, 404, "Category not found or not owned by you.");

    category.deletedAt = new Date();
    await category.save();

    return response(true, 200, "Category deleted successfully.");
  } catch (error) {
    return catchError(error);
  }
}