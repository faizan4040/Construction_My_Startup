import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Ledger from "@/models/Ledger.model";
import Labour from "@/models/Labour.model";
import User from "@/models/User.model";
import Payout from "@/models/Payout.model";

// Admin: "Labour commission & wallets" table. Every labour who has money activity.
export async function GET(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    const only = new URL(req.url).searchParams.get("only"); // dues | payable | all

    const now = new Date();
    const rows = await Ledger.aggregate([
      { $match: { ownerType: "labour" } },
      {
        $group: {
          _id: "$owner",
          available: { $sum: { $cond: [{ $lte: ["$availableAt", now] }, "$amount", 0] } },
          onHold: { $sum: { $cond: [{ $and: [{ $gt: ["$availableAt", now] }, { $gt: ["$amount", 0] }] }, "$amount", 0] } },
          earnedOnline: { $sum: { $cond: [{ $eq: ["$type", "labour_credit"] }, "$amount", 0] } },
          cashCommission: { $sum: { $cond: [{ $eq: ["$type", "cash_commission_due"] }, { $multiply: ["$amount", -1] }, 0] } },
          duesPaidOnline: { $sum: { $cond: [{ $eq: ["$type", "dues_payment"] }, "$amount", 0] } },
          duesSettled: { $sum: { $cond: [{ $eq: ["$type", "dues_settlement"] }, "$amount", 0] } },
          withdrawn: { $sum: { $cond: [{ $in: ["$type", ["payout_debit", "payout_reversal"]] }, { $multiply: ["$amount", -1] }, 0] } },
          last: { $max: "$createdAt" },
        },
      },
      { $sort: { available: 1, last: -1 } },
      { $limit: 300 },
    ]);

    const ids = rows.map((r) => r._id);
    const [profiles, users, pending] = await Promise.all([
      Labour.find({ owner: { $in: ids } }).select("owner fullName phone category profileImage").lean(),
      User.find({ _id: { $in: ids } }).select("name isBlocked deletedAt").lean(),
      Payout.aggregate([{ $match: { owner: { $in: ids }, status: { $in: ["requested", "approved", "processing"] } } },
        { $group: { _id: "$owner", amt: { $sum: "$amount" } } }]),
    ]);
    const P = new Map(profiles.map((p) => [String(p.owner), p]));
    const U = new Map(users.map((u) => [String(u._id), u]));
    const W = new Map(pending.map((p) => [String(p._id), p.amt]));

    let out = rows.map((r) => {
      const id = String(r._id);
      const p = P.get(id), u = U.get(id);
      const dues = r.available < 0 ? -r.available : 0;
      return {
        labourId: id,
        name: p?.fullName || u?.name || "—",
        phone: p?.phone || "",
        photo: p?.profileImage || "",
        category: p?.category || "",
        blocked: !!u?.isBlocked,
        removed: !!u?.deletedAt,
        dues,
        wallet: Math.max(0, r.available),
        onHold: r.onHold,
        earnedOnline: r.earnedOnline,
        cashCommission: r.cashCommission,
        duesPaidOnline: r.duesPaidOnline,
        duesSettled: r.duesSettled,
        adjustedFromOnline: Math.max(0, r.cashCommission - r.duesPaidOnline - r.duesSettled - dues),
        withdrawn: r.withdrawn,
        withdrawPending: W.get(id) || 0,
        last: r.last,
      };
    });
    if (only === "dues") out = out.filter((r) => r.dues > 0);
    if (only === "payable") out = out.filter((r) => r.wallet > 0 || r.onHold > 0);

    return NextResponse.json({ rows: out }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin wallets error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
