import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceCategory from "@/models/ServiceCategory.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import { j, parseCategoryBody } from "@/lib/serviceHelpers";

export async function GET() {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const [cats, counts] = await Promise.all([
      ServiceCategory.find().sort({ order: 1, name: 1 }).lean(),
      ServiceProvider.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: "$category", n: { $sum: 1 } } }]),
    ]);
    const m = new Map(counts.map((c) => [String(c._id), c.n]));
    return j({ categories: cats.map((c) => ({ ...c, _id: String(c._id), count: m.get(String(c._id)) || 0 })) });
  } catch (e) {
    console.error("admin categories error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

export async function POST(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const p = parseCategoryBody(await req.json());
    if (p.error) return j({ message: p.error }, 400);
    try {
      const c = await ServiceCategory.create(p.data);
      return j({ category: c });
    } catch (e) {
      if (e.code === 11000) return j({ message: "A category with this name already exists" }, 409);
      throw e;
    }
  } catch (e) {
    console.error("admin category create error", e);
    return j({ message: "something went wrong" }, 500);
  }
}