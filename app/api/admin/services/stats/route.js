import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import { j, adminBooking } from "@/lib/serviceHelpers";
import { istToday, slotHour24 } from "@/lib/serviceConfig";

const IST = 5.5 * 3600e3;
const real = { status: { $nin: ["pending_payment"] } };

const month = (from, to) =>
  ServiceBooking.aggregate([
    { $match: { ...real, createdAt: { $gte: from, $lt: to } } },
    { $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] } } } },
  ]).then((r) => r[0] || { total: 0, completed: 0, pending: 0, revenue: 0 });

const delta = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 100) : null);

export async function GET() {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);

    const ist = new Date(Date.now() + IST);
    const y = ist.getUTCFullYear(), m = ist.getUTCMonth();
    const startThis = new Date(Date.UTC(y, m, 1) - IST);
    const startPrev = new Date(Date.UTC(y, m - 1, 1) - IST);
    const since = new Date(Date.now() - 30 * 864e5);

    const [cur, prev, daily, byCat, today, unseen] = await Promise.all([
      month(startThis, new Date(Date.now() + 864e5)),
      month(startPrev, startThis),
      ServiceBooking.aggregate([
        { $match: { ...real, status: { $ne: "cancelled" }, createdAt: { $gte: since } } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $ne: ["$status", "completed"] }, 1, 0] } } } },
      ]),
      ServiceBooking.aggregate([
        { $match: { ...real, status: { $ne: "cancelled" } } },
        { $group: { _id: "$categoryName", n: { $sum: 1 } } },
        { $sort: { n: -1 } },
      ]),
      ServiceBooking.find({ slotDate: istToday(), status: { $in: ["pending", "confirmed", "assigned", "in_progress"] } }).limit(20).lean(),
      ServiceBooking.countDocuments({ adminSeen: false, status: "pending" }),
    ]);

    const dm = new Map(daily.map((d) => [d._id, d]));
    const chart = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() + IST - (29 - i) * 864e5).toISOString().slice(0, 10);
      const r = dm.get(d);
      return { date: d.slice(8) + "/" + d.slice(5, 7), completed: r?.completed || 0, pending: r?.pending || 0 };
    });
    const top = byCat.slice(0, 6).map((c) => ({ name: c._id || "Other", value: c.n }));
    const rest = byCat.slice(6).reduce((t, c) => t + c.n, 0);
    if (rest) top.push({ name: "Others", value: rest });

    return j({
      kpi: {
        total: cur.total, totalDelta: delta(cur.total, prev.total),
        completed: cur.completed, completedDelta: delta(cur.completed, prev.completed),
        pending: cur.pending, pendingDelta: delta(cur.pending, prev.pending),
        revenue: cur.revenue, revenueDelta: delta(cur.revenue, prev.revenue),
      },
      chart, byCategory: top, unseen,
      today: today.sort((a, b) => slotHour24(a.slotTime) - slotHour24(b.slotTime)).slice(0, 8).map(adminBooking),
    });
  } catch (e) {
    console.error("admin service stats error", e);
    return j({ message: "something went wrong" }, 500);
  }
}