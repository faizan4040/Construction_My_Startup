import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import OrderModel from "@/models/Order.model";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET(req, res) {
  try {
    await connectDB();

    // Aggregate orders to find most sold products
    const mostSold = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productVariant",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }, // Top 10 sold products
    ]);

    // Populate product name and variant info
    const result = await ProductVariantModel.populate(mostSold, {
      path: "_id",
      select: "sku product",
      populate: { path: "product", select: "name" },
    });

    return res.status(200).json(response(true, 200, "Most sold products fetched.", result));
  } catch (error) {
    return catchError(error, res);
  }
}