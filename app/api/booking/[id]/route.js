import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import User from "@/models/User.model";
import { toCustomerBooking } from "@/lib/bookingSerializers";
import { getLabourPublic } from "@/lib/labourPublic";
import { decrypt } from "@/lib/crypto";

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "not found" }, { status: 404 });
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    // only the booking's own customer can ever read it
    const b = await Booking.findOne({ _id: id, user: s.userId }).select("+completeOtpEnc").lean();
    if (!b) return NextResponse.json({ message: "not found" }, { status: 404 });

    const lu = await User.findById(b.labour).select("avatar location locationUpdatedAt").lean();
    const out = toCustomerBooking(b, await getLabourPublic(b, lu));

    if (b.bookingStatus === "work_completed" && b.completeOtpEnc) out.completeOtp = decrypt(b.completeOtpEnc);

    const live = ["confirmed", "arrived", "started"].includes(b.bookingStatus);
    const c = lu?.location?.coordinates;
    const at = lu?.locationUpdatedAt ? new Date(lu.locationUpdatedAt).getTime() : 0;
    if (live && c && Date.now() - at < 5 * 60 * 1000) out.labourPosition = { lat: c[1], lon: c[0], at };

    return NextResponse.json({ booking: out }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("get booking error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}