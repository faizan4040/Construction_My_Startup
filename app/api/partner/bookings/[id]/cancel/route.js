import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";
import { refundBooking } from "@/lib/finance";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const reason = String(body.reason || "labour_cancelled").slice(0, 100);
    const now = new Date();

    const b = await Booking.findOneAndUpdate(
      { _id: id, labour: s.userId, bookingStatus: { $in: ["confirmed", "arrived"] } }, // not after work started
      {
        $set: { bookingStatus: "cancelled", cancelledBy: "labour", cancellationReason: reason },
        $push: { history: { status: "cancelled", at: now, by: s.userId, byRole: "labour", note: reason } },
      },
      { returnDocument: "after" }
    ).lean();
    if (!b) return NextResponse.json({ message: "this job can no longer be cancelled" }, { status: 409 });

    if (b.paymentStatus === "paid") await refundBooking(b);

    const p = { bookingId: String(b._id), status: "cancelled", by: "labour" };
    await Promise.all([emitToUser(b.user, "booking-update", p), emitToAdmins("admin-booking-update", p)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("labour cancel error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}