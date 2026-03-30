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

    // Aggregate total sales per month for the current year
    const now = new Date();
    const currentYear = now.getFullYear();

    const monthlySales = await OrderModel.aggregate([
      {
        $match: {
          deleteAt: null,
          status: { $in: ["processing", "shipped", "delivered"] },
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, 
          month: { $month: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }, 
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    return response(true, 200, "Monthly sales data found.", monthlySales);
    
  } catch (error) {
    return catchError(error);
  }
}
