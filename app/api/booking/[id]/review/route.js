import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import Review from "@/models/Review.model";
import Labour from "@/models/Labour.model";
import { emitToAdmins } from "@/lib/socketEmit";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();
    const s = await isAuthenticated();
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const rating = Number(body.rating);
    const comment = String(body.comment || "").trim().slice(0, 500);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return NextResponse.json({ message: "rating must be 1 to 5" }, { status: 400 });

    const b = await Booking.findOne({ _id: id, user: s.userId, bookingStatus: "completed" }).lean();
    if (!b) return NextResponse.json({ message: "booking not completed" }, { status: 409 });

    try {
      await Review.create({ booking: b._id, user: b.user, labour: b.labour, labourProfile: b.labourProfile, rating, comment });
    } catch (e) {
      if (e.code === 11000) return NextResponse.json({ message: "already reviewed" }, { status: 409 });
      throw e;
    }

    await Booking.updateOne({ _id: b._id }, { $set: { reviewed: true } });
    if (b.labourProfile) {
      // atomic running average (MongoDB 4.2+ pipeline update)
      await Labour.updateOne({ _id: b.labourProfile }, [
        { $set: {
            rating: { $round: [{ $divide: [{ $add: [{ $multiply: ["$rating", "$totalReviews"] }, rating] }, { $add: ["$totalReviews", 1] }] }, 2] },
            totalReviews: { $add: ["$totalReviews", 1] } } },
      ]);
    }
    await emitToAdmins("admin-booking-update", { bookingId: String(b._id), status: "reviewed" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("review error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}