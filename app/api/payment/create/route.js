import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { rzp } from "@/lib/razorpay";

export async function POST(req) {
  try {
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { bookingId } = await req.json();
    if (!mongoose.isValidObjectId(bookingId)) return NextResponse.json({ message: "invalid" }, { status: 400 });

    // amount ALWAYS comes from the database, never from the browser
    const b = await Booking.findOne({ _id: bookingId, user: s.userId, bookingStatus: { $in: ["confirmed", "arrived"] } }).lean();
    if (!b) return NextResponse.json({ message: "booking not payable" }, { status: 409 });
    if (b.paymentStatus !== "pending") return NextResponse.json({ message: "already paid" }, { status: 409 });

    let orderId = b.razorpayOrderId;
    if (!orderId) {
      const o = await rzp().orders.create({
        amount: b.fare * 100,
        currency: "INR",
        receipt: `bk_${String(b._id).slice(-12)}`,
        notes: { bookingId: String(b._id) },
      });
      const set = await Booking.updateOne(
        { _id: b._id, razorpayOrderId: null },
        { $set: { razorpayOrderId: o.id, paymentMethod: "online" } }
      );
      orderId = set.modifiedCount ? o.id : (await Booking.findById(b._id).select("razorpayOrderId").lean()).razorpayOrderId;
    } else {
      await Booking.updateOne({ _id: b._id, paymentStatus: "pending" }, { $set: { paymentMethod: "online" } });
    }

    return NextResponse.json({
      orderId,
      amount: b.fare * 100,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("payment create error", error?.error?.description || error.message);
    return NextResponse.json({ message: "could not start payment" }, { status: 500 });
  }
}