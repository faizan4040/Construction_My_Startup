import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import CategoryModel from "@/models/Category.model";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";

export async function GET() {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const [category, product, customer, order] = await Promise.all([
      CategoryModel.countDocuments({ deleteAt: null }),
      ProductModel.countDocuments({ deleteAt: null }),
      UserModel.countDocuments({ deleteAt: null }),
      OrderModel.countDocuments({ deleteAt: null }),
    ]);

    return response(true, 200, "Dashboard count.", {
      category,
      product,
      customer,
      order,
    });

  } catch (error) {
    return catchError(error);
  }
}
