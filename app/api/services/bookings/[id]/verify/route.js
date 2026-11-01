import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import { j } from "@/lib/serviceHelpers";
import { rzp, verifyPaymentSignature } from "@/lib/razorpay";
import { markServicePaid } from "@/lib/serviceFinance";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ success: false }, 400);
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return j({ success: false, message: "unauthorized" }, 401);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const b = await ServiceBooking.findOne({ _id: id, user: s.userId }).lean();
    if (!b || !b.razorpayOrderId || b.razorpayOrderId !== razorpay_order_id)
      return j({ success: false, message: "invalid order" }, 400);
    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
      return j({ success: false, message: "invalid signature" }, 400);

    // second proof: ask Razorpay itself
    const pay = await rzp().payments.fetch(razorpay_payment_id);
    if (pay.order_id !== razorpay_order_id || pay.amount !== b.total * 100)
      return j({ success: false, message: "amount mismatch" }, 400);
    if (pay.status === "authorized") await rzp().payments.capture(razorpay_payment_id, b.total * 100, "INR");
    else if (pay.status !== "captured") return j({ success: false, message: "payment not completed" }, 409);

    await markServicePaid({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, amountPaise: pay.amount });
    const fresh = await ServiceBooking.findById(b._id).select("paymentStatus").lean();
    return j({ success: fresh?.paymentStatus === "paid" });
  } catch (e) {
    console.error("service verify error", e?.error?.description || e.message);
    return j({ success: false, message: "verification failed" }, 500);
  }
}