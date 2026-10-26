import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import User from "@/models/User.model";
import { distanceM } from "@/lib/bookingSerializers";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";

const MAX_M = 300;

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDB();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const b = await Booking.findOne({ _id: id, labour: s.userId, bookingStatus: "confirmed" }).select("workLocation user").lean();
    if (!b) return NextResponse.json({ message: "cannot mark arrived now" }, { status: 409 });

    const me = await User.findById(s.userId).select("location locationUpdatedAt").lean();
    const fresh = me?.locationUpdatedAt && Date.now() - new Date(me.locationUpdatedAt).getTime() < 2 * 60 * 1000;
    const d = fresh ? distanceM(me.location?.coordinates, b.workLocation?.coordinates) : null;
    if (d == null) return NextResponse.json({ message: "your location is not available, turn on GPS" }, { status: 409 });
    if (d > MAX_M) return NextResponse.json({ message: `you are ${d} m away from the site` }, { status: 409 });

    const now = new Date();
    const upd = await Booking.findOneAndUpdate(
      { _id: id, labour: s.userId, bookingStatus: "confirmed" },
      { $set: { bookingStatus: "arrived", arrivedAt: now }, $push: { history: { status: "arrived", at: now, by: s.userId, byRole: "labour", note: "manual" } } },
      { returnDocument: "after" }
    ).lean();
    if (!upd) return NextResponse.json({ message: "already updated" }, { status: 409 });

    const p = { bookingId: String(id), status: "arrived" };
    await Promise.all([emitToUser(b.user, "booking-update", p), emitToAdmins("admin-booking-update", p)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("arrived error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}