import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import { j, esc, adminBooking } from "@/lib/serviceHelpers";

export async function GET(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page")) || 1);
    const limit = Math.min(30, Math.max(1, parseInt(sp.get("limit")) || 10));

    const base = {};
    if (sp.get("category") && /^[a-f\d]{24}$/i.test(sp.get("category"))) base.category = sp.get("category");
    if (["online", "cash"].includes(sp.get("payment"))) base.paymentMethod = sp.get("payment");
    const from = sp.get("from"), to = sp.get("to");
    if (/^\d{4}-\d{2}-\d{2}$/.test(from || "") || /^\d{4}-\d{2}-\d{2}$/.test(to || "")) {
      base.slotDate = {};
      if (/^\d{4}-\d{2}-\d{2}$/.test(from || "")) base.slotDate.$gte = from;
      if (/^\d{4}-\d{2}-\d{2}$/.test(to || "")) base.slotDate.$lte = to;
    }
    const q = (sp.get("q") || "").trim().slice(0, 60);
    if (q) {
      const re = new RegExp(esc(q), "i");
      base.$or = [{ code: re }, { contactName: re }, { contactPhone: re }, { providerName: re }, { "address.full": re }];
    }
    if (sp.get("unseen") === "1") { base.adminSeen = false; base.status = "pending"; }

    const filter = { ...base };
    const st = sp.get("status");
    if (!base.status) {
      if (st && st !== "all") filter.status = st;
      else filter.status = { $ne: "pending_payment" }; // unpaid, abandoned checkouts stay out of the main list
    }

    const [rows, total, agg] = await Promise.all([
      ServiceBooking.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ServiceBooking.countDocuments(filter),
      ServiceBooking.aggregate([{ $match: base }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    ]);
    const counts = Object.fromEntries(agg.map((a) => [a._id, a.n]));
    counts.all = agg.filter((a) => a._id !== "pending_payment").reduce((t, a) => t + a.n, 0);
    return j({ bookings: rows.map(adminBooking), total, page, pages: Math.max(1, Math.ceil(total / limit)), counts });
  } catch (e) {
    console.error("admin service bookings error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

// mark every new booking as seen (stops the bell from blinking)
export async function POST(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const { action } = await req.json();
    if (action !== "seen_all") return j({ message: "invalid" }, 400);
    await ServiceBooking.updateMany({ adminSeen: false }, { $set: { adminSeen: true } });
    return j({ success: true });
  } catch (e) {
    console.error("seen all error", e);
    return j({ message: "something went wrong" }, 500);
  }
}