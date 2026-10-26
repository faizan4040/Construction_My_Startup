import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import ChatMessage from "@/models/ChatMessage.model";
import { emitToUser } from "@/lib/socketEmit";

export async function POST(req) {
  try {
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { bookingId, text } = await req.json();
    const t = String(text || "").trim().slice(0, 500);
    if (!mongoose.isValidObjectId(bookingId) || !t) return NextResponse.json({ message: "invalid" }, { status: 400 });

    const b = await Booking.findOne({
      _id: bookingId,
      bookingStatus: { $in: ["confirmed", "arrived", "started", "work_completed"] },
      $or: [{ user: s.userId }, { labour: s.userId }],
    }).select("user labour").lean();
    if (!b) return NextResponse.json({ message: "chat not available" }, { status: 403 });

    const mine = String(b.user) === String(s.userId) ? "user" : "labour";
    const msg = await ChatMessage.create({ bookingId, sender: mine, text: t });
    const other = mine === "user" ? b.labour : b.user;
    await emitToUser(other, "chat-message", msg.toObject());
    return NextResponse.json(msg);
  } catch (error) {
    console.error("chat send error", error);
    return NextResponse.json({ message: "could not send" }, { status: 500 });
  }
}