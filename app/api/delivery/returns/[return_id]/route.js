import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ReturnModel from "@/models/Return.model"
import OrderModel from "@/models/Order.model"
import ProductVariantModel from "@/models/ProductVariant.model"

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { return_id } = await params

    const ret = await ReturnModel.findOne({
      _id: return_id,
      deliveryPartner: auth.userId,
      deletedAt: null,
    })
    if (!ret) return response(false, 404, "Return not found or not assigned to you.")

    // order se address/location/payment-mode fetch karo (Return-model me address nahi hai)
    const order = await OrderModel.findOne({ _id: ret.order }).select(
      "address landmark city state pincode customerLocation paymentMode paymentStatus"
    )

    // product image
    const variant = await ProductVariantModel.findById(ret.variantId)
      .select("media attributes")
      .populate("media", "secure_url")

    const safeReturn = {
      _id: ret._id,
      orderId: ret.orderId,
      productName: ret.productName,
      qty: ret.qty,
      reason: ret.reason,
      reasonCategory: ret.reasonCategory,
      trackingStatus: ret.trackingStatus,
      createdAt: ret.createdAt,

      customerName: ret.customerName,
      // ❌ customerPhone/customerEmail EXCLUDE — masked-call se hi contact hoga

      address: order?.address,
      landmark: order?.landmark,
      city: order?.city,
      state: order?.state,
      pincode: order?.pincode,
      location: order?.customerLocation,

      // refund-context — delivery-boy ko pata hona chahiye cash involved hai ya nahi
      paymentMode: order?.paymentMode,     // "cod" | "online"
      paymentStatus: order?.paymentStatus, // "Paid" | "Pending" | "Refunded" | "Failed"

      productImage: variant?.media?.[0]?.secure_url || null,
      attributes: variant?.attributes || [],
    }

    return response(true, 200, "Return detail fetched.", safeReturn)
  } catch (error) {
    return catchError(error, "Failed to fetch return detail.")
  }
}