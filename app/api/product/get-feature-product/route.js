import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductModel from "@/models/Product.model";

export async function GET() {
  try {
    await connectDB();

    const products = await ProductModel.find({ deletedAt: null })
      .populate("media", "_id secure_url")
      .lean();

    if (!products || products.length === 0) {
      return response(false, 404, "Products not found");
    }

    return response(true, 200, "Products found.", products);
  } catch (error) {
    return catchError(error);
  }
}
