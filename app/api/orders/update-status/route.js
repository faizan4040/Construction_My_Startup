import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import OrderModel from "@/models/Order.model";
import { orderstatus } from "@/lib/utils";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const { _id, status } = await request.json();

    if (!_id || !status) {
      return response(false, 400, "Order id and status are required");
    }

    const order = await OrderModel.findById(_id);
    if (!order) {
      return response(false, 404, "Order not found");
    }

    // 🔥 normalize status
    const normalizedStatus = status.toLowerCase().trim();

    // 🔒 validate enum
    if (!orderstatus.includes(normalizedStatus)) {
      return response(false, 400, "Invalid order status");
    }

    order.status = normalizedStatus;
    await order.save();

    return response(true, 200, "Order status updated successfully", order);
  } catch (error) {
    return catchError(error);
  }
}





