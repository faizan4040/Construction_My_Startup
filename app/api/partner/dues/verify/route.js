import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import { rzp, verifyPaymentSignature } from "@/lib/razorpay";
import { recordDuesPayment, getLabourWallet } from "@/lib/finance";

// Browser callback after the labour paid dues. The webhook does the same thing,
// whichever arrives first records it (idempotent on the payment id).
export async function POST(req) {
  try {
    await connectDb();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
      return NextResponse.json({ message: "payment verification failed" }, { status: 400 });

    const order = await rzp().orders.fetch(razorpay_order_id);
    if (order?.notes?.kind !== "labour_dues" || order.notes.labour !== String(s.userId))
      return NextResponse.json({ message: "this payment does not belong to you" }, { status: 403 });

    const pay = await rzp().payments.fetch(razorpay_payment_id);
    if (pay.order_id !== razorpay_order_id || !["captured", "authorized"].includes(pay.status))
      return NextResponse.json({ message: "payment not completed" }, { status: 409 });

    await recordDuesPayment({ labourId: s.userId, amount: pay.amount / 100, paymentId: pay.id, channel: "online" });
    return NextResponse.json({ success: true, wallet: await getLabourWallet(s.userId) });
  } catch (error) {
    console.error("dues verify error", error?.error?.description || error.message);
    return NextResponse.json({ message: "could not verify payment" }, { status: 500 });
  }
}
