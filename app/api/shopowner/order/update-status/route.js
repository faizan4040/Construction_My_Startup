import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import { orderstatus } from "@/lib/utils";
import ProductModel from "@/models/Product.model";
import OrderModel from "@/models/Order.model";
import UserModel from "@/models/User.model";
import { z } from "zod";

export async function PUT(request) {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    const payload = await request.json();
    const validationSchema = z.object({
      orderId: z.string().min(1),
      status: z.enum(orderstatus),
    });

    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error);
    }

    const { orderId, status } = validatedData.data;
    const order = await OrderModel.findById(orderId);
    if (!order) return response(false, 404, "Order not found.");

    const shopProductIds = await ProductModel.find({ shop: user.shop }).distinct("_id");
    const shopProductIdStrings = shopProductIds.map((id) => String(id));

    const orderProductIds = order.products.map((p) => String(p.productId));
    const allBelongToThisShop = orderProductIds.every((id) => shopProductIdStrings.includes(id));

    if (!allBelongToThisShop) {
      return response(
        false,
        403,
        "This order contains items from multiple shops — status can only be updated once per-item tracking is added."
      );
    }

    order.status = status;
    await order.save();

    return response(true, 200, "Order status updated.", order);
  } catch (error) {
    return catchError(error);
  }
}