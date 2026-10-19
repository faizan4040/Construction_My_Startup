import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();

    const session = await isAuthenticated("laber");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const now = new Date();
    const booking = await Booking.findOneAndUpdate(
      { _id: id, labour: session.userId, bookingStatus: { $in: ["confirmed", "arrived"] } },
      {
        $set: { bookingStatus: "started", startedAt: now },
        $push: { history: { status: "started", at: now, by: session.userId, byRole: "labour" } },
      },
      { new: true }
    ).lean();

    if (!booking)
      return NextResponse.json({ message: "cannot start this job now" }, { status: 409 });

    await Promise.all([
      emitToUser(booking.user, "booking-update", { bookingId: String(booking._id), status: "started", at: now }),
      emitToAdmins("admin-booking-update", { bookingId: String(booking._id), status: "started" }),
    ]);

    return NextResponse.json({ success: true, startedAt: now });
  } catch (error) {
    console.error("start work error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}