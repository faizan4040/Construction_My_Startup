import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";

export async function GET() {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    const products = await ProductModel.find({ shop: user.shop, deletedAt: null })
      .populate("media", "_id secure_url")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    return response(true, 200, "Products found.", products);
  } catch (error) {
    return catchError(error);
  }
}