import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";
import { calcSplit } from "@/lib/commission";

// DEV ONLY: finish the job without payment so you can test admin graphs.
// Never enable in production: it would mark jobs completed without any money.
const DEV_SKIP_PAYMENT =
  process.env.DEV_SKIP_PAYMENT === "true" && process.env.NODE_ENV !== "production";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();

    const session = await isAuthenticated("laber");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const current = await Booking.findOne({
      _id: id, labour: session.userId, bookingStatus: "started",
    }).select("startedAt fare").lean();
    if (!current?.startedAt)
      return NextResponse.json({ message: "cannot complete this job now" }, { status: 409 });

    const now = new Date();
    const minutes = Math.max(0, Math.round(((now - new Date(current.startedAt)) / 60000) * 100) / 100);

    const set = {
      bookingStatus: DEV_SKIP_PAYMENT ? "completed" : "work_completed",
      completedAt: now,
      workDurationMinutes: minutes,
    };
    if (DEV_SKIP_PAYMENT) {
      const s = calcSplit(current.fare);
      set.adminCommission = s.commission;
      set.labourAmount = s.labourAmount;
      set.commissionRate = s.percent;
    }

    // filter on startedAt too: a double click or retry cannot complete twice
    const booking = await Booking.findOneAndUpdate(
      { _id: id, labour: session.userId, bookingStatus: "started", startedAt: current.startedAt },
      {
        $set: set,
        $push: { history: { status: set.bookingStatus, at: now, by: session.userId, byRole: "labour" } },
      },
      { new: true }
    ).lean();

    if (!booking)
      return NextResponse.json({ message: "already completed" }, { status: 409 });

    await Promise.all([
      emitToUser(booking.user, "booking-update", {
        bookingId: String(booking._id), status: booking.bookingStatus, minutes,
      }),
      emitToAdmins("admin-booking-update", { bookingId: String(booking._id), status: booking.bookingStatus }),
    ]);

    return NextResponse.json({ success: true, completedAt: now, workDurationMinutes: minutes });
  } catch (error) {
    console.error("complete work error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}