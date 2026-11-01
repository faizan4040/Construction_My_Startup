import ServiceBooking from "@/models/ServiceBooking.model";
import { rzp } from "@/lib/razorpay";
import { emitToAdmins } from "@/lib/socketEmit";

export const pingAdmins = (bookingId, status) =>
  emitToAdmins("admin-booking-update", { kind: "service", bookingId: String(bookingId), status });

// verify route AND webhook both call this: whoever comes first wins, the second is a no-op
export async function markServicePaid({ orderId, paymentId, amountPaise }) {
  const now = new Date();
  const b = await ServiceBooking.findOneAndUpdate(
    {
      razorpayOrderId: orderId,
      paymentStatus: "pending",
      status: "pending_payment",
      $expr: { $eq: [{ $multiply: ["$total", 100] }, amountPaise] },
    },
    {
      $set: { paymentStatus: "paid", status: "pending", razorpayPaymentId: paymentId, paidAt: now, adminSeen: false },
      $push: { history: { status: "paid", at: now, byRole: "system" } },
    },
    { returnDocument: "after" }
  ).lean();
  if (b) {
    await pingAdmins(b._id, "new");
    return b;
  }
  // money arrived but the booking was already cancelled: give it back
  const dead = await ServiceBooking.findOne({ razorpayOrderId: orderId }).select("status paymentStatus").lean();
  if (dead?.status === "cancelled" && dead.paymentStatus === "pending") {
    try {
      await rzp().payments.refund(paymentId, { amount: amountPaise });
      await ServiceBooking.updateOne({ _id: dead._id }, { $set: { paymentStatus: "refunded", razorpayPaymentId: paymentId } });
    } catch (e) {
      console.error("service auto refund failed", e?.error?.description || e.message);
    }
  }
  return null;
}

export async function refundService(b) {
  if (b.paymentStatus !== "paid" || !b.razorpayPaymentId) return;
  const claimed = await ServiceBooking.findOneAndUpdate(
    { _id: b._id, paymentStatus: "paid" },
    { $set: { paymentStatus: "refund_pending" } }
  );
  if (!claimed) return;
  try {
    const r = await rzp().payments.refund(b.razorpayPaymentId, { amount: b.total * 100, speed: "normal" });
    await ServiceBooking.updateOne({ _id: b._id }, { $set: { paymentStatus: "refunded", refundId: r.id } });
  } catch (e) {
    console.error("service refund failed", e?.error?.description || e.message); // stays refund_pending: visible to admin
  }
}