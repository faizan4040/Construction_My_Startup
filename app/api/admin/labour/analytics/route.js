import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { COMMISSION_PERCENT } from "@/lib/commission";

const IST_MS = 5.5 * 60 * 60 * 1000;
const TZ = "Asia/Kolkata";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CFG = {
  daily:   { unit: "day",   n: 14, fmt: "%Y-%m-%d" },
  weekly:  { unit: "week",  n: 12, fmt: "%Y-%m-%d" },
  monthly: { unit: "month", n: 12, fmt: "%Y-%m" },
  yearly:  { unit: "year",  n: 5,  fmt: "%Y" },
};

// "d" is an IST wall-clock time stored in UTC fields
function startOf(unit, d) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  if (unit === "week") x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); // Monday
  if (unit === "month") x.setUTCDate(1);
  if (unit === "year") x.setUTCMonth(0, 1);
  return x;
}
function addUnits(unit, d, n) {
  const x = new Date(d);
  if (unit === "day") x.setUTCDate(x.getUTCDate() + n);
  if (unit === "week") x.setUTCDate(x.getUTCDate() + 7 * n);
  if (unit === "month") x.setUTCMonth(x.getUTCMonth() + n);
  if (unit === "year") x.setUTCFullYear(x.getUTCFullYear() + n);
  return x;
}
const keyOf = (unit, d) => {
  const iso = d.toISOString();
  return unit === "month" ? iso.slice(0, 7) : unit === "year" ? iso.slice(0, 4) : iso.slice(0, 10);
};
const labelOf = (unit, d) =>
  unit === "month" ? `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`
  : unit === "year" ? String(d.getUTCFullYear())
  : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;

const commExpr = {
  $cond: [
    { $gt: ["$adminCommission", 0] },
    "$adminCommission",
    { $round: [{ $divide: [{ $multiply: ["$fare", COMMISSION_PERCENT] }, 100] }, 0] },
  ],
};

export async function GET(req) {
  try {
    await connectDb();
    const session = await isAuthenticated("admin");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const r = new URL(req.url).searchParams.get("range");
    const range = CFG[r] ? r : "daily";
    const { unit, n, fmt } = CFG[range];

    const cur = startOf(unit, new Date(Date.now() + IST_MS));
    const buckets = Array.from({ length: n }, (_, i) => addUnits(unit, cur, -(n - 1 - i)));
    const from = new Date(buckets[0].getTime() - IST_MS);

    const [agg, statusAgg, doneAgg] = await Promise.all([
      Booking.aggregate([
        { $match: { bookingStatus: "completed", completedAt: { $gte: from } } },
        { $addFields: { comm: commExpr } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: fmt,
                timezone: TZ,
                date: { $dateTrunc: { date: "$completedAt", unit, timezone: TZ, startOfWeek: "monday" } },
              },
            },
            gross: { $sum: "$fare" },
            commission: { $sum: "$comm" },
            jobs: { $sum: 1 },
            online: { $sum: { $cond: [{ $eq: ["$paymentMethod", "online"] }, "$fare", 0] } },
            cash: { $sum: { $cond: [{ $eq: ["$paymentMethod", "cash"] }, "$fare", 0] } },
          },
        },
      ]),
      Booking.aggregate([{ $group: { _id: "$bookingStatus", n: { $sum: 1 } } }]),
      Booking.aggregate([
        { $match: { bookingStatus: "completed" } },
        { $addFields: { comm: commExpr } },
        { $group: { _id: null, gross: { $sum: "$fare" }, commission: { $sum: "$comm" }, jobs: { $sum: 1 } } },
      ]),
    ]);

    const byKey = new Map(agg.map((a) => [a._id, a]));
    const series = buckets.map((d) => {
      const a = byKey.get(keyOf(unit, d)) || {};
      const gross = a.gross || 0;
      const commission = a.commission || 0;
      return {
        key: keyOf(unit, d),
        label: labelOf(unit, d),
        gross,
        commission,
        labour: gross - commission,
        jobs: a.jobs || 0,
        online: a.online || 0,
        cash: a.cash || 0,
      };
    });

    const totals = series.reduce(
      (t, s) => ({
        gross: t.gross + s.gross,
        commission: t.commission + s.commission,
        labour: t.labour + s.labour,
        jobs: t.jobs + s.jobs,
        online: t.online + s.online,
        cash: t.cash + s.cash,
      }),
      { gross: 0, commission: 0, labour: 0, jobs: 0, online: 0, cash: 0 }
    );

    const sc = {};
    statusAgg.forEach((s) => (sc[s._id] = s.n));
    const done = doneAgg[0] || { gross: 0, commission: 0, jobs: 0 };

    return NextResponse.json({
      range,
      percent: COMMISSION_PERCENT,
      series,
      totals,
      summary: {
        requested: sc.requested || 0,
        active: (sc.confirmed || 0) + (sc.arrived || 0) + (sc.started || 0) + (sc.work_completed || 0),
        completed: done.jobs,
        grossAllTime: done.gross,
        commissionAllTime: done.commission,
        labourAllTime: done.gross - done.commission,
      },
    });
  } catch (error) {
    console.error("admin analytics error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}