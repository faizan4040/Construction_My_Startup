import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { rzp, verifyPaymentSignature } from "@/lib/razorpay";
import { markBookingPaid } from "@/lib/finance";

export async function POST(req) {
  try {
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });

    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!mongoose.isValidObjectId(bookingId)) return NextResponse.json({ success: false }, { status: 400 });

    const b = await Booking.findOne({ _id: bookingId, user: s.userId }).lean();
    if (!b || b.razorpayOrderId !== razorpay_order_id)
      return NextResponse.json({ success: false, message: "invalid order" }, { status: 400 });
    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
      return NextResponse.json({ success: false, message: "invalid signature" }, { status: 400 });

    // second proof: ask Razorpay itself
    const pay = await rzp().payments.fetch(razorpay_payment_id);
    if (pay.order_id !== razorpay_order_id || pay.amount !== b.fare * 100)
      return NextResponse.json({ success: false, message: "amount mismatch" }, { status: 400 });
    if (pay.status === "authorized") await rzp().payments.capture(razorpay_payment_id, b.fare * 100, "INR");
    else if (pay.status !== "captured")
      return NextResponse.json({ success: false, message: "payment not completed" }, { status: 409 });

    await markBookingPaid({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, amountPaise: pay.amount });
    const fresh = await Booking.findById(b._id).select("paymentStatus").lean();
    return NextResponse.json({ success: fresh?.paymentStatus === "paid" });
  } catch (error) {
    console.error("payment verify error", error?.error?.description || error.message);
    return NextResponse.json({ success: false, message: "verification failed" }, { status: 500 });
  }
}