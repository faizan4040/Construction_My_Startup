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
    const status = searchParams.get("status"); // optional filter

    const shopProductIds = await ProductModel.find({ shop: user.shop }).distinct("_id");
    const shopProductIdStrings = shopProductIds.map((id) => String(id));

    const matchStage = { "products.productId": { $in: shopProductIds } };
    if (status) matchStage.status = status;

    const orders = await OrderModel.find(matchStage)
      .select("name email phone address country state city pincode products status paymentStatus totalAmount createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // strip out line items that don't belong to this shop (order may contain other shops' products too)
    const shopOrders = orders.map((order) => {
      const shopItems = order.products.filter((p) => shopProductIdStrings.includes(String(p.productId)));
      const shopSubtotal = shopItems.reduce((sum, p) => sum + p.sellingPrice * p.qty, 0);

      return {
        _id: order._id,
        customer: { name: order.name, email: order.email, phone: order.phone },
        address: `${order.address}, ${order.city}, ${order.state}, ${order.country} - ${order.pincode}`,
        items: shopItems,
        shopSubtotal,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      };
    });

    return response(true, 200, "Orders found.", shopOrders);
  } catch (error) {
    return catchError(error);
  }
}