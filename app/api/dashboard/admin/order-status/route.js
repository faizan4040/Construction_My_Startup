import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperfunction";
import connectDB from "@/lib/databaseConnection";
import OrderModel from "@/models/Order.model";

export async function GET() {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 401, "Unauthorized");
    }

    await connectDB();

    const orderStatus = await OrderModel.aggregate([
      {
        $match: {
          deleteAt: null,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return response(true, 200, "Order status found.", orderStatus);
  } catch (error) {
    return catchError(error);
  }
}
