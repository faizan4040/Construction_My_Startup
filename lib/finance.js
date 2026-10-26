import mongoose from "mongoose";
import Booking from "@/models/Booking.model";
import Ledger from "@/models/Ledger.model";
import { calcSplit } from "@/lib/commission";
import { rzp } from "@/lib/razorpay";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";

export const HOLD_HOURS = Number(process.env.SETTLEMENT_HOLD_HOURS ?? 24);
export const MAX_CASH_DUES = Number(process.env.MAX_CASH_DUES ?? 1000);
export const MIN_PAYOUT = Number(process.env.MIN_PAYOUT ?? 100);

const oid = (id) => new mongoose.Types.ObjectId(String(id));

const put = (e) =>
  Ledger.updateOne(
    { booking: e.booking, ownerType: e.ownerType, type: e.type },
    { $setOnInsert: e },
    { upsert: true }
  );

// idempotent: calling twice never duplicates entries (unique index)
export async function settleBooking(b) {
  const { commission, labourAmount } = calcSplit(b.fare);
  const now = new Date();
  if (b.paymentMethod === "online") {
    await put({ booking: b._id, ownerType: "labour", owner: b.labour, type: "labour_credit", channel: "online",
      amount: labourAmount, availableAt: new Date(now.getTime() + HOLD_HOURS * 3600e3) });
    await put({ booking: b._id, ownerType: "platform", type: "platform_commission", channel: "online",
      amount: commission, availableAt: now });
  } else {
    // cash: labour kept all the money, so he owes the platform's commission
    await put({ booking: b._id, ownerType: "labour", owner: b.labour, type: "cash_commission_due", channel: "cash",
      amount: -commission, availableAt: now });
    await put({ booking: b._id, ownerType: "platform", type: "platform_commission", channel: "cash",
      amount: commission, availableAt: now });
  }
}

export async function getLabourWallet(userId, session) {
  const now = new Date();
  const q = Ledger.aggregate([
    { $match: { ownerType: "labour", owner: oid(userId) } },
    {
      $group: {
        _id: null,
        available: { $sum: { $cond: [{ $lte: ["$availableAt", now] }, "$amount", 0] } },
        pending: { $sum: { $cond: [{ $and: [{ $gt: ["$availableAt", now] }, { $gt: ["$amount", 0] }] }, "$amount", 0] } },
      },
    },
  ]);
  if (session) q.session(session);
  const [r] = await q;
  const available = r?.available ?? 0;
  return { available, pending: r?.pending ?? 0, dues: available < 0 ? -available : 0 };
}

export async function getLabourPayable() {
  const [r] = await Ledger.aggregate([
    { $match: { ownerType: "labour", availableAt: { $lte: new Date() } } },
    { $group: { _id: "$owner", bal: { $sum: "$amount" } } },
    {
      $group: {
        _id: null,
        payable: { $sum: { $cond: [{ $gt: ["$bal", 0] }, "$bal", 0] } },
        dues: { $sum: { $cond: [{ $lt: ["$bal", 0] }, { $multiply: ["$bal", -1] }, 0] } },
      },
    },
  ]);
  return { payable: r?.payable ?? 0, dues: r?.dues ?? 0 };
}

export async function getPlatformSummary(session) {
  const q = Ledger.aggregate([
    { $match: { ownerType: "platform" } },
    {
      $group: {
        _id: null,
        online: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "platform_commission"] }, { $eq: ["$channel", "online"] }] }, "$amount", 0] } },
        cash: { $sum: { $cond: [{ $and: [{ $eq: ["$type", "platform_commission"] }, { $eq: ["$channel", "cash"] }] }, "$amount", 0] } },
        withdrawn: { $sum: { $cond: [{ $in: ["$type", ["platform_withdrawal", "platform_withdrawal_reversal"]] }, "$amount", 0] } },
      },
    },
  ]);
  if (session) q.session(session);
  const [r] = await q;
  const online = r?.online ?? 0;
  const withdrawn = -(r?.withdrawn ?? 0);
  return { online, cashReceivable: r?.cash ?? 0, withdrawn, available: online - withdrawn };
}

// called by /payment/verify AND the webhook: whoever comes first wins, the second is a no-op
export async function markBookingPaid({ orderId, paymentId, amountPaise }) {
  const now = new Date();
  const b = await Booking.findOneAndUpdate(
    {
      razorpayOrderId: orderId,
      paymentStatus: "pending",
      bookingStatus: { $in: ["confirmed", "arrived", "started", "work_completed"] },
      $expr: { $eq: [{ $multiply: ["$fare", 100] }, amountPaise] },
    },
    {
      $set: { paymentStatus: "paid", paymentMethod: "online", razorpayPaymentId: paymentId, paidAt: now },
      $push: { history: { status: "paid", at: now, byRole: "system", note: "online" } },
    },
    { returnDocument: "after" }
  ).lean();

  if (b) {
    const payload = { bookingId: String(b._id), status: b.bookingStatus, payment: "paid" };
    await Promise.all([
      emitToUser(b.labour, "booking-update", payload),
      emitToUser(b.user, "booking-update", payload),
      emitToAdmins("admin-booking-update", payload),
    ]);
    return b;
  }

  // money arrived but the booking is already dead -> give it back automatically
  const dead = await Booking.findOne({ razorpayOrderId: orderId }).select("bookingStatus paymentStatus").lean();
  if (dead && ["cancelled", "expired", "rejected"].includes(dead.bookingStatus) && dead.paymentStatus === "pending") {
    try {
      await rzp().payments.refund(paymentId, { amount: amountPaise, notes: { reason: "booking_closed" } });
      await Booking.updateOne({ _id: dead._id }, { $set: { paymentStatus: "refunded" } });
    } catch (e) {
      console.error("auto refund failed", e?.error?.description || e.message);
    }
  }
  return null;
}

export async function refundBooking(b) {
  if (b.paymentStatus !== "paid" || !b.razorpayPaymentId) return;
  const claimed = await Booking.findOneAndUpdate(
    { _id: b._id, paymentStatus: "paid" },
    { $set: { paymentStatus: "refund_pending" } }
  );
  if (!claimed) return;
  try {
    const r = await rzp().payments.refund(b.razorpayPaymentId, {
      amount: b.fare * 100,
      speed: "normal",
      notes: { bookingId: String(b._id) },
    });
    await Booking.updateOne({ _id: b._id }, { $set: { paymentStatus: "refunded", refundId: r.id } });
  } catch (e) {
    console.error("refund failed", e?.error?.description || e.message); // stays refund_pending: admin sees it
  }
}