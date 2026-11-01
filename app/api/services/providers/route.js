import connectDb from "@/lib/databaseConnection";
import ServiceCategory from "@/models/ServiceCategory.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import ServiceReview from "@/models/ServiceReview.model";
import { j, esc, publicProvider } from "@/lib/serviceHelpers";
import { ACTIVE, SERVICE_TYPES, SLOTS, SLOT_CAPACITY } from "@/lib/serviceConfig";

const SORTS = {
  popularity: { jobsDone: -1, rating: -1 },
  price_low: { startingPrice: 1 },
  price_high: { startingPrice: -1 },
  rating: { rating: -1, reviewCount: -1 },
  newest: { createdAt: -1 },
};

export async function GET(req) {
  try {
    await connectDb();
    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page")) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(sp.get("limit")) || 8));
    const where = { isActive: true, deletedAt: null };

    const slug = sp.get("category");
    if (slug && slug !== "all") {
      const c = await ServiceCategory.findOne({ slug, isActive: true }).select("_id").lean();
      if (!c) return j({ providers: [], total: 0, pages: 1, page });
      where.category = c._id;
    } else {
      const act = await ServiceCategory.find({ isActive: true }).select("_id").lean();
      where.category = { $in: act.map((c) => c._id) };
    }

    const q = (sp.get("q") || "").trim().slice(0, 60);
    if (q) {
      const re = new RegExp(esc(q), "i");
      where.$or = [{ name: re }, { headline: re }, { description: re }];
    }
    const maxPrice = Number(sp.get("maxPrice"));
    if (maxPrice > 0) where.startingPrice = { $lte: maxPrice };
    const minRating = Number(sp.get("minRating"));
    if (minRating > 0) where.rating = { $gte: minRating };
    const types = (sp.get("serviceType") || "").split(",").filter((t) => SERVICE_TYPES.includes(t));
    if (types.length) where.serviceType = { $in: types };
    const pro = (sp.get("professionalType") || "").split(",").filter((t) => ["individual", "company"].includes(t));
    if (pro.length) where.professionalType = { $in: pro };

    // availability: hide labour whose every slot is full on the chosen date
    const date = sp.get("date") || "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const full = await ServiceBooking.aggregate([
        { $match: { slotDate: date, status: { $in: ACTIVE } } },
        { $group: { _id: "$provider", n: { $sum: 1 } } },
        { $match: { n: { $gte: SLOTS.length * SLOT_CAPACITY } } },
      ]);
      if (full.length) where._id = { $nin: full.map((f) => f._id) };
    }

    const [rows, total] = await Promise.all([
      ServiceProvider.find(where)
        .sort(SORTS[sp.get("sort")] || SORTS.popularity)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("category", "name slug icon")
        .select("-phone -sourceLabour -deletedAt")
        .lean(),
      ServiceProvider.countDocuments(where),
    ]);

    // the latest REAL written review of each labour
    const rv = await ServiceReview.aggregate([
      { $match: { provider: { $in: rows.map((r) => r._id) }, status: "visible", comment: { $ne: "" } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$provider", rating: { $first: "$rating" }, comment: { $first: "$comment" }, userName: { $first: "$userName" } } },
    ]);
    const rm = new Map(rv.map((r) => [String(r._id), { rating: r.rating, comment: r.comment, userName: r.userName }]));

    return j({
      providers: rows.map((p) => publicProvider(p, rm.get(String(p._id)))),
      total, page, pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) {
    console.error("providers list error", e);
    return j({ message: "something went wrong" }, 500);
  }
}