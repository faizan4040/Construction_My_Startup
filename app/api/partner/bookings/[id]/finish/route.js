import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import Labour from "@/models/Labour.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";
import { decrypt, safeEqual } from "@/lib/crypto";
import { calcSplit } from "@/lib/commission";
import { settleBooking } from "@/lib/finance";

const MAX_ATTEMPTS = 5;

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { otp, cashReceived } = await req.json();
    if (!/^\d{4}$/.test(String(otp))) return NextResponse.json({ message: "enter the 4 digit OTP" }, { status: 400 });

    const now = new Date();
    // every try is counted BEFORE comparing: brute force is capped at 5
    const b = await Booking.findOneAndUpdate(
      { _id: id, labour: s.userId, bookingStatus: "work_completed", completeOtpAttempts: { $lt: MAX_ATTEMPTS }, completeOtpExpires: { $gt: now } },
      { $inc: { completeOtpAttempts: 1 } },
      { returnDocument: "after" }
    ).select("+completeOtpEnc +completeOtpAttempts").lean();
    if (!b?.completeOtpEnc)
      return NextResponse.json({ message: "OTP expired or too many attempts. Press Complete Work again for a new OTP." }, { status: 409 });

    if (!safeEqual(decrypt(b.completeOtpEnc), String(otp)))
      return NextResponse.json({ message: "Wrong OTP", attemptsLeft: MAX_ATTEMPTS - b.completeOtpAttempts }, { status: 400 });

    if (!b.paymentMethod) return NextResponse.json({ message: "payment method not selected" }, { status: 409 });
    if (b.paymentMethod === "cash" && cashReceived !== true)
      return NextResponse.json({ message: "confirm that you received the cash" }, { status: 400 });
    if (b.paymentMethod === "online" && b.paymentStatus !== "paid")
      return NextResponse.json({ message: "online payment is not confirmed yet" }, { status: 409 });

    const split = calcSplit(b.fare);
    const done = await Booking.findOneAndUpdate(
      { _id: id, labour: s.userId, bookingStatus: "work_completed" },
      {
        $set: {
          bookingStatus: "completed", closedAt: now, commissionRate: split.percent,
          adminCommission: split.commission, labourAmount: split.labourAmount,
          ...(b.paymentMethod === "cash" ? { paymentStatus: "cash" } : {}),
        },
        $unset: { completeOtpEnc: 1 },
        $push: { history: { status: "completed", at: now, by: s.userId, byRole: "labour", note: "otp_verified" } },
      },
      { returnDocument: "after" }
    ).lean();
    if (!done) return NextResponse.json({ message: "already closed" }, { status: 409 });

    await settleBooking(done);
    if (done.labourProfile) await Labour.updateOne({ _id: done.labourProfile }, { $inc: { completedJobs: 1 } });

    const p = { bookingId: String(done._id), status: "completed" };
    await Promise.all([emitToUser(done.user, "booking-update", p), emitToAdmins("admin-booking-update", p)]);
    return NextResponse.json({ success: true, youEarn: split.labourAmount, commission: split.commission, method: done.paymentMethod });
  } catch (error) {
    console.error("finish error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}