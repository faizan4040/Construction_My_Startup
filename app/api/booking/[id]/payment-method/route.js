import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { method } = await req.json();
    if (method !== "cash") return NextResponse.json({ message: "invalid method" }, { status: 400 });

    const now = new Date();
    const b = await Booking.findOneAndUpdate(
      { _id: id, user: s.userId, bookingStatus: { $in: ["confirmed", "arrived"] }, paymentStatus: "pending" },
      { $set: { paymentMethod: "cash" }, $push: { history: { status: "payment_cash", at: now, by: s.userId, byRole: "customer" } } },
      { returnDocument: "after" }
    ).lean();
    if (!b) return NextResponse.json({ message: "cannot change payment now" }, { status: 409 });

    const p = { bookingId: String(b._id), status: b.bookingStatus, payment: "cash" };
    await Promise.all([emitToUser(b.labour, "booking-update", p), emitToAdmins("admin-booking-update", p)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("payment-method error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}