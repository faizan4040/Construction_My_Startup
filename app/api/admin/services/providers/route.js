import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceProvider from "@/models/ServiceProvider.model";
import { j, esc, parseProviderBody, resolveCategory } from "@/lib/serviceHelpers";
import "@/models/ServiceCategory.model";

export async function GET(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page")) || 1);
    const limit = 10;
    const where = { deletedAt: null };
    const cat = sp.get("category");
    if (cat && mongoose.isValidObjectId(cat)) where.category = cat;
    if (sp.get("status") === "active") where.isActive = true;
    if (sp.get("status") === "inactive") where.isActive = false;
    const q = (sp.get("q") || "").trim().slice(0, 60);
    if (q) { const re = new RegExp(esc(q), "i"); where.$or = [{ name: re }, { phone: re }, { headline: re }]; }

    const [rows, total] = await Promise.all([
      ServiceProvider.find(where).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("category", "name icon slug").lean(),
      ServiceProvider.countDocuments(where),
    ]);
    return j({ providers: rows, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (e) {
    console.error("admin providers list error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

export async function POST(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return j({ message: "unauthorized" }, 401);
    const body = await req.json();
    const p = parseProviderBody(body);
    if (p.error) return j({ message: p.error }, 400);
    const c = await resolveCategory(body);
    if (c.error) return j({ message: c.error }, 400);
    const doc = await ServiceProvider.create({
      ...p.data, category: c.id,
      sourceLabour: mongoose.isValidObjectId(body.sourceLabour) ? body.sourceLabour : undefined,
    });
    return j({ provider: doc });
  } catch (e) {
    console.error("admin provider create error", e);
    return j({ message: "something went wrong" }, 500);
  }
}