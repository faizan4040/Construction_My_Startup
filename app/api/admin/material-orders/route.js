import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import MaterialOrder from "@/models/MaterialOrder.model";
import { isAuthenticated } from "@/lib/authentication";

const STATUSES = ["pending", "delivered", "cancelled"];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth?.isAuth) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const sp = request.nextUrl.searchParams;
    const status = sp.get("status");
    const q = (sp.get("q") || "").trim().slice(0, 80);
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") || "10", 10) || 10));

    const filter = {};
    if (STATUSES.includes(status)) filter.status = status;
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: rx }, { phone: rx }, { address: rx }];
    }

    const [orders, total, grouped] = await Promise.all([
      MaterialOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "name email")
        .lean(),
      MaterialOrder.countDocuments(filter),
      MaterialOrder.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    ]);

    const counts = { pending: 0, delivered: 0, cancelled: 0 };
    grouped.forEach((g) => {
      if (g._id in counts) counts[g._id] = g.n;
    });
    counts.all = counts.pending + counts.delivered + counts.cancelled;

    return NextResponse.json({
      success: true,
      data: { orders, counts, total, page, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error("[admin material-orders GET]", error);
    return NextResponse.json({ success: false, message: "Could not load orders." }, { status: 500 });
  }
}