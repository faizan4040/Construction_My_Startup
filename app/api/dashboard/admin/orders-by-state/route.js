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

    const ordersByState = await OrderModel.aggregate([
      {
        $match: {
          deleteAt: null,
          "shippingAddress.stateCode": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$shippingAddress.stateCode",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          id: { $concat: ["IN-", "$_id"] }, // convert RJ -> IN-RJ
          value: "$count",
        },
      },
      {
        $sort: { value: -1 },
      },
    ]);

    return response(
      true,
      200,
      "Orders by state found",
      ordersByState
    );
  } catch (error) {
    return catchError(error);
  }
}