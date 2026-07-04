import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import ProductModel from "@/models/Product.model";
import OrderModel from "@/models/Order.model";
import UserModel from "@/models/User.model";

export async function GET(request) {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get("groupBy") === "monthly" ? "monthly" : "daily";
    const dateFormat = groupBy === "monthly" ? "%Y-%m" : "%Y-%m-%d";

    const shopProductIds = await ProductModel.find({ shop: user.shop }).distinct("_id");

    const earnings = await OrderModel.aggregate([
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: shopProductIds } } },
      {
        $addFields: {
          itemTotal: { $multiply: ["$products.sellingPrice", "$products.qty"] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          totalEarning: { $sum: "$itemTotal" },
          totalQty: { $sum: "$products.qty" },
          orderIds: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          period: "$_id",
          totalEarning: 1,
          totalQty: 1,
          orderCount: { $size: "$orderIds" },
        },
      },
      { $sort: { period: 1 } },
    ]);

    return response(true, 200, "Earnings found.", earnings);
  } catch (error) {
    return catchError(error);
  }
}