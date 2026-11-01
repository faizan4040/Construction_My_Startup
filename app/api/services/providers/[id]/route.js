import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import ServiceProvider from "@/models/ServiceProvider.model";
import ServiceReview from "@/models/ServiceReview.model";
import { j, publicProvider } from "@/lib/serviceHelpers";
import { calcTotal } from "@/lib/serviceConfig";

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "not found" }, 404);
    await connectDb();
    const p = await ServiceProvider.findOne({ _id: id, isActive: true, deletedAt: null })
      .populate("category", "name slug icon isActive")
      .select("-phone -sourceLabour -deletedAt")
      .lean();
    if (!p || !p.category?.isActive) return j({ message: "not found" }, 404);

    const reviews = await ServiceReview.find({ provider: id, status: "visible" })
      .sort({ createdAt: -1 }).limit(10).select("userName rating comment createdAt").lean();

    return j({
      provider: { ...publicProvider(p), inclusions: p.inclusions, process: p.process },
      quote: calcTotal(p.startingPrice),
      reviews: reviews.map((r) => ({ _id: String(r._id), userName: r.userName, rating: r.rating, comment: r.comment, createdAt: r.createdAt })),
    });
  } catch (e) {
    console.error("provider detail error", e);
    return j({ message: "something went wrong" }, 500);
  }
}