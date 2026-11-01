import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Labour from "@/models/Labour.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import { j, esc } from "@/lib/serviceHelpers";

export async function GET(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page")) || 1);
    const limit = 10;
    const where = {};
    const q = (sp.get("q") || "").trim().slice(0, 60);
    if (q) { const re = new RegExp(esc(q), "i"); where.$or = [{ fullName: re }, { phone: re }]; }
    if (["pending", "approved", "rejected"].includes(sp.get("status"))) where.status = sp.get("status");

    const [rows, total] = await Promise.all([
      Labour.find(where).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .select("fullName phone category profileImage experienceYears rateType pricePerDay pricePerHour about status isVerified createdAt").lean(),
      Labour.countDocuments(where),
    ]);
    const added = await ServiceProvider.find({ sourceLabour: { $in: rows.map((r) => r._id) }, deletedAt: null }).select("sourceLabour").lean();
    const done = new Set(added.map((a) => String(a.sourceLabour)));
    return j({
      labours: rows.map((r) => ({ ...r, _id: String(r._id), inCatalog: done.has(String(r._id)) })),
      total, page, pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) {
    console.error("registered labour error", e);
    return j({ message: "something went wrong" }, 500);
  }
}