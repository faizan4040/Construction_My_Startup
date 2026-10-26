import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import ChatMessage from "@/models/ChatMessage.model";

export async function POST(req) {
  try {
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { bookingId } = await req.json();
    if (!mongoose.isValidObjectId(bookingId)) return NextResponse.json({ message: "invalid" }, { status: 400 });

    const ok = await Booking.exists({ _id: bookingId, $or: [{ user: s.userId }, { labour: s.userId }] });
    if (!ok) return NextResponse.json({ message: "forbidden" }, { status: 403 });

    const msgs = await ChatMessage.find({ bookingId }).sort({ createdAt: 1 }).limit(200).lean();
    return NextResponse.json(msgs);
  } catch (error) {
    console.error("chat get-all error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}