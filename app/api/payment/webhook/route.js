import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import Booking from "@/models/Booking.model";
import Payout from "@/models/Payout.model";
import { rzp, verifyWebhookSignature } from "@/lib/razorpay";
import { markBookingPaid, recordDuesPayment } from "@/lib/finance";
import { failPayout } from "@/lib/payouts";
import { markServicePaid } from "@/lib/serviceFinance";

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

    if (
      (evt.event === "payment.captured" || evt.event === "order.paid") &&
      pay?.order_id
      ) {
      const labourJob = await markBookingPaid({
        orderId: pay.order_id,
        paymentId: pay.id,
        amountPaise: pay.amount
      });

      if (!labourJob) {
        const service = await markServicePaid({
          orderId: pay.order_id,
          paymentId: pay.id,
          amountPaise: pay.amount
        });

        // labour paying their cash-commission dues
        if (!service) {
          const order = evt.payload?.order?.entity || (await rzp().orders.fetch(pay.order_id).catch(() => null));
          if (order?.notes?.kind === "labour_dues" && order.notes.labour) {
            await recordDuesPayment({ labourId: order.notes.labour, amount: pay.amount / 100, paymentId: pay.id, channel: "online" });
          }
        }
      }
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