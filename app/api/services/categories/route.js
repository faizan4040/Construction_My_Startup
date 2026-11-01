import connectDb from "@/lib/databaseConnection";
import ServiceCategory from "@/models/ServiceCategory.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import { j } from "@/lib/serviceHelpers";

export async function GET() {
  try {
    await connectDb();
    const [cats, counts] = await Promise.all([
      ServiceCategory.find({ isActive: true }).sort({ order: 1, name: 1 }).lean(),
      ServiceProvider.aggregate([
        { $match: { isActive: true, deletedAt: null } },
        { $group: { _id: "$category", n: { $sum: 1 } } },
      ]),
    ]);
    const m = new Map(counts.map((c) => [String(c._id), c.n]));
    const categories = cats.map((c) => ({
      _id: String(c._id), name: c.name, slug: c.slug, icon: c.icon, image: c.image?.url || "", count: m.get(String(c._id)) || 0,
    }));
    return Response.json({ categories }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch (e) {
    console.error("categories error", e);
    return j({ message: "something went wrong" }, 500);
  }
}