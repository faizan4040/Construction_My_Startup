import mongoose from "mongoose";
import Booking from "@/models/Booking.model";
import Ledger from "@/models/Ledger.model";
import { calcSplit } from "@/lib/commission";
import { getSettings } from "@/lib/settings";
import { rzp } from "@/lib/razorpay";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";

// env fallbacks (kept for old imports). Live values come from getSettings().
export const HOLD_HOURS = Number(process.env.SETTLEMENT_HOLD_HOURS ?? 24);
export const MAX_CASH_DUES = Number(process.env.MAX_CASH_DUES ?? 1000);
export const MIN_PAYOUT = Number(process.env.MIN_PAYOUT ?? 100);

const oid = (id) => new mongoose.Types.ObjectId(String(id));

// idempotent insert: the unique indexes make a second call a no-op
const put = (key, e) =>
  Ledger.updateOne(
    { ...key, ownerType: e.ownerType, type: e.type },
    { $setOnInsert: { ...key, ...e } },
    { upsert: true }
  );

/*
  One job finished -> money entries.
  online: platform already holds the money -> credit labour (after hold), book commission.
  cash:   labour holds all the money -> labour owes the commission (negative entry).
*/
async function postJobEntries(key, { labour, method, labourAmount, commission }) {
  const { settlementHoldHours } = await getSettings();
  const now = new Date();
  if (method === "online") {
    if (labourAmount > 0)
      await put(key, { ownerType: "labour", owner: labour, type: "labour_credit", channel: "online",
        amount: labourAmount, availableAt: new Date(now.getTime() + settlementHoldHours * 3600e3) });
    if (commission > 0)
      await put(key, { ownerType: "platform", type: "platform_commission", channel: "online", amount: commission, availableAt: now });
  } else if (commission > 0) {
    await put(key, { ownerType: "labour", owner: labour, type: "cash_commission_due", channel: "cash", amount: -commission, availableAt: now });
    await put(key, { ownerType: "platform", type: "platform_commission", channel: "cash", amount: commission, availableAt: now });
  }
}

// live labour job. Uses the split frozen on the booking at completion time.
export async function settleBooking(b) {
  const frozen = Number(b.adminCommission) + Number(b.labourAmount) === Number(b.fare) && b.fare > 0;
  const split = frozen ? { commission: b.adminCommission, labourAmount: b.labourAmount } : calcSplit(b.fare, b.commissionRate || undefined);
  await postJobEntries({ booking: b._id }, {
    labour: b.labour, method: b.paymentMethod, labourAmount: split.labourAmount, commission: split.commission,
  });
}

// scheduled service job done by a registered labour
export async function settleServiceBooking(sb) {
  if (!sb.assignedLabour) {
    // outside professional: admin pays them off-app, but the company commission is still booked
    // (online = money is in Razorpay -> withdrawable; cash = admin collected it by hand -> shown, not withdrawable)
    if (sb.adminCommission > 0)
      await put({ serviceBooking: sb._id }, { ownerType: "platform", type: "platform_commission",
        channel: sb.paymentMethod === "online" ? "online" : "cash", amount: sb.adminCommission, availableAt: new Date() });
    return;
  }
  await postJobEntries({ serviceBooking: sb._id }, {
    labour: sb.assignedLabour, method: sb.paymentMethod, labourAmount: sb.labourAmount, commission: sb.adminCommission,
  });
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
        earnedOnline: { $sum: { $cond: [{ $eq: ["$type", "labour_credit"] }, "$amount", 0] } },
        cashCommission: { $sum: { $cond: [{ $eq: ["$type", "cash_commission_due"] }, { $multiply: ["$amount", -1] }, 0] } },
        duesPaid: { $sum: { $cond: [{ $in: ["$type", ["dues_payment", "dues_settlement"]] }, "$amount", 0] } },
        withdrawn: { $sum: { $cond: [{ $in: ["$type", ["payout_debit", "payout_reversal"]] }, { $multiply: ["$amount", -1] }, 0] } },
      },
    },
  ]);
  if (session) q.session(session);
  const [r] = await q;
  const available = r?.available ?? 0;
  const cashCommission = r?.cashCommission ?? 0;
  const duesPaid = r?.duesPaid ?? 0;
  const dues = available < 0 ? -available : 0;
  return {
    available,
    withdrawable: Math.max(0, available),
    pending: r?.pending ?? 0,
    dues,
    earnedOnline: r?.earnedOnline ?? 0,
    cashCommission,
    duesPaid,
    // cash commission covered automatically by online earnings
    adjustedFromOnline: Math.max(0, cashCommission - duesPaid - dues),
    withdrawn: r?.withdrawn ?? 0,
  };
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
        owing: { $sum: { $cond: [{ $lt: ["$bal", 0] }, 1, 0] } },
      },
    },
  ]);
  const [p] = await Ledger.aggregate([
    { $match: { ownerType: "labour", availableAt: { $gt: new Date() }, amount: { $gt: 0 } } },
    { $group: { _id: null, pending: { $sum: "$amount" } } },
  ]);
  return { payable: r?.payable ?? 0, dues: r?.dues ?? 0, laboursOwing: r?.owing ?? 0, pendingHold: p?.pending ?? 0 };
}

/*
  Company money. Withdrawable = money the platform really holds that belongs to it:
    online commission
  + cash commission that online earnings already covered (labour's credit absorbed the due)
  + cash commission the labour paid online (Razorpay)
  - already withdrawn
  Cash commission settled manually was handed over outside the system, so it is shown but not withdrawable.
*/
export async function getPlatformSummary(session) {
  const now = new Date();
  const pq = Ledger.aggregate([
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
  const lq = Ledger.aggregate([
    { $match: { ownerType: "labour" } },
    {
      $group: {
        _id: "$owner",
        avail: { $sum: { $cond: [{ $lte: ["$availableAt", now] }, "$amount", 0] } },
        cashDue: { $sum: { $cond: [{ $eq: ["$type", "cash_commission_due"] }, { $multiply: ["$amount", -1] }, 0] } },
        paidOnline: { $sum: { $cond: [{ $eq: ["$type", "dues_payment"] }, "$amount", 0] } },
        settled: { $sum: { $cond: [{ $eq: ["$type", "dues_settlement"] }, "$amount", 0] } },
      },
    },
    {
      $project: {
        outstanding: { $max: [0, { $multiply: ["$avail", -1] }] },
        paidOnline: { $min: ["$paidOnline", "$cashDue"] },
        settled: { $min: ["$settled", { $max: [0, { $subtract: ["$cashDue", "$paidOnline"] }] }] },
        owedBeforeNetting: { $max: [0, { $subtract: [{ $subtract: ["$cashDue", "$paidOnline"] }, "$settled"] }] },
      },
    },
    {
      $group: {
        _id: null,
        adjusted: { $sum: { $max: [0, { $subtract: ["$owedBeforeNetting", "$outstanding"] }] } },
        outstanding: { $sum: "$outstanding" },
        paidOnline: { $sum: "$paidOnline" },
        settled: { $sum: "$settled" },
      },
    },
  ]);
  if (session) { pq.session(session); lq.session(session); }
  const [[r], [l]] = await Promise.all([pq, lq]);

  const online = r?.online ?? 0;
  const cash = r?.cash ?? 0;
  const withdrawn = -(r?.withdrawn ?? 0);
  const adjustedFromOnline = l?.adjusted ?? 0;
  const duesPaidOnline = l?.paidOnline ?? 0;
  const duesSettledManual = l?.settled ?? 0;
  const collected = online + adjustedFromOnline + duesPaidOnline;
  return {
    online,
    cashCommission: cash,
    adjustedFromOnline,
    duesPaidOnline,
    duesSettledManual,
    cashDuesOutstanding: l?.outstanding ?? 0,
    cashReceivable: l?.outstanding ?? 0, // old key, used by older components
    totalEarned: online + cash,
    collected,
    withdrawn,
    available: Math.max(0, collected - withdrawn),
  };
}

// labour paid (part of) their cash dues online. Idempotent on the Razorpay payment id.
export async function recordDuesPayment({ labourId, amount, paymentId, channel = "online", by, note }) {
  const amt = Math.floor(Number(amount));
  if (!(amt > 0)) return false;
  const type = channel === "online" ? "dues_payment" : "dues_settlement";
  const res = await Ledger.updateOne(
    { ref: String(paymentId), type },
    {
      $setOnInsert: {
        ownerType: "labour", owner: oid(labourId), ref: String(paymentId), type,
        channel: channel === "online" ? "online" : "manual", amount: amt, availableAt: new Date(), by, note,
      },
    },
    { upsert: true }
  );
  if (res.upsertedCount) {
    const p = { kind: "wallet", labourId: String(labourId), status: "dues_paid", amount: amt };
    await Promise.all([emitToUser(labourId, "wallet-update", p), emitToAdmins("admin-booking-update", p)]);
  }
  return !!res.upsertedCount;
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
