import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceBooking from "@/models/ServiceBooking.model";
import ServiceReview from "@/models/ServiceReview.model";
import ServiceProvider from "@/models/ServiceProvider.model";
import { j, str } from "@/lib/serviceHelpers";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return j({ message: "invalid" }, 400);
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return j({ message: "unauthorized" }, 401);

    const body = await req.json();
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return j({ message: "Rating must be 1 to 5" }, 400);

    const b = await ServiceBooking.findOne({ _id: id, user: s.userId, status: "completed" }).lean();
    if (!b) return j({ message: "Only completed bookings can be reviewed" }, 409);

    const first = str(b.contactName, 60).split(" ")[0] || "Customer";
    try {
      await ServiceReview.create({ booking: b._id, user: s.userId, provider: b.provider, userName: first, rating, comment: str(body.comment, 500) });
    } catch (e) {
      if (e.code === 11000) return j({ message: "Already reviewed" }, 409);
      throw e;
    }
    await ServiceBooking.updateOne({ _id: b._id }, { $set: { reviewed: true } });
    // atomic running average
    await ServiceProvider.updateOne({ _id: b.provider }, [
      { $set: {
          rating: { $round: [{ $divide: [{ $add: [{ $multiply: ["$rating", "$reviewCount"] }, rating] }, { $add: ["$reviewCount", 1] }] }, 2] },
          reviewCount: { $add: ["$reviewCount", 1] } } },
    ]);
    return j({ success: true });
  } catch (e) {
    console.error("service review error", e);
    return j({ message: "something went wrong" }, 500);
  }
}