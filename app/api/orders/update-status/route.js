import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import { orderstatus } from "@/lib/utils";
import { getOverallOrderStatus } from "@/lib/orderStatusHelper";

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

    const normalizedStatus = status.toLowerCase().trim();

    if (!orderstatus.includes(normalizedStatus)) {
      return response(false, 400, "Invalid order status");
    }

    const order = await OrderModel.findById(_id);
    if (!order) {
      return response(false, 404, "Order not found");
    }

    // 🔒 admin sirf apne khud ke products (jo kisi shop se linked nahi hain)
    // ka status update karega — shopowner route jaisa hi pattern.
    // NOTE: agar aapke Product model me admin-owned product ko differentiate
    // karne ka tareeka `shop: null` se alag hai (e.g. koi `isAdminProduct` flag),
    // to yeh query us hisaab se change kar dena.
    const adminProductIds = await ProductModel
      .find({ shop: null, deletedAt: null })
      .distinct("_id");

    let touched = false;
    order.products.forEach((p) => {
      if (adminProductIds.some((id) => id.equals(p.productId))) {
        p.status = normalizedStatus;
        touched = true;
      }
    });

    if (!touched) {
      return response(false, 404, "None of the admin's products are in this order.");
    }

    // 🔥 unified overall status — same helper jo shopowner side bhi use karta hai
    order.status = getOverallOrderStatus(order.products);

    await order.save();

    return response(true, 200, "Order status updated successfully", order);
  } catch (error) {
    return catchError(error);
  }
}


