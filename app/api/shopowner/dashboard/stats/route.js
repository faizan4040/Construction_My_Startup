import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import OrderModel from "@/models/Order.model";
import UserModel from "@/models/User.model";

const LOW_STOCK_THRESHOLD = 5;

export async function GET() {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id");

    const [totalProducts, lowStockCount, orderAgg] = await Promise.all([
      ProductModel.countDocuments({ shop: user.shop, deletedAt: null }),
      ProductVariantModel.countDocuments({
        product: { $in: shopProductIds },
        stock: { $lte: LOW_STOCK_THRESHOLD },
        deletedAt: null,
      }),
      OrderModel.aggregate([
        { $unwind: "$products" },
        { $match: { "products.productId": { $in: shopProductIds } } },
        {
          $group: {
            _id: null,
            totalEarning: { $sum: { $multiply: ["$products.sellingPrice", "$products.qty"] } },
            totalUnitsSold: { $sum: "$products.qty" },
            orderIds: { $addToSet: "$_id" },
          },
        },
      ]),
    ]);

    const stats = orderAgg[0] || { totalEarning: 0, totalUnitsSold: 0, orderIds: [] };

    return response(true, 200, "Stats found.", {
      totalProducts,
      lowStockCount,
      totalEarning: stats.totalEarning,
      totalUnitsSold: stats.totalUnitsSold,
      totalOrders: stats.orderIds.length,
    });
  } catch (error) {
    return catchError(error);
  }
}