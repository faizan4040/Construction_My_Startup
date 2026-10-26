import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import Booking from "@/models/Booking.model";
import Payout from "@/models/Payout.model";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markBookingPaid } from "@/lib/finance";
import { failPayout } from "@/lib/payouts";

export const runtime = "nodejs";

export async function POST(req) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature")))
    return NextResponse.json({ message: "invalid signature" }, { status: 400 });

  try {
    await connectDb();
    const evt = JSON.parse(raw);
    const pay = evt.payload?.payment?.entity;
    const out = evt.payload?.payout?.entity;

    if ((evt.event === "payment.captured" || evt.event === "order.paid") && pay?.order_id) {
      await markBookingPaid({ orderId: pay.order_id, paymentId: pay.id, amountPaise: pay.amount });
    } else if (evt.event === "refund.processed") {
      const refund = evt.payload?.refund?.entity;
      if (refund?.payment_id)
        await Booking.updateOne({ razorpayPaymentId: refund.payment_id }, { $set: { paymentStatus: "refunded", refundId: refund.id } });
    } else if (evt.event === "payout.processed" && out?.reference_id) {
      await Payout.updateOne(
        { _id: out.reference_id, status: { $in: ["processing", "approved"] } },
        { $set: { status: "paid", utr: out.utr || "", processedAt: new Date() } }
      );
    } else if ((evt.event === "payout.failed" || evt.event === "payout.reversed") && out?.reference_id) {
      await failPayout(out.reference_id, out.failure_reason || evt.event);
    }
  } catch (e) {
    console.error("webhook error", e.message);
    return NextResponse.json({ ok: false }, { status: 500 }); // Razorpay retries
  }
  return NextResponse.json({ ok: true });
}