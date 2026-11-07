import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";

// Admin live map of one live job: site + labour's latest GPS
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const b = await Booking.findById(id)
      .select("bookingStatus category workLocation workAddress siteDetails labour labourProfile acceptedAt arrivedAt startedAt completedAt fare paymentMethod paymentStatus")
      .lean();
    if (!b) return NextResponse.json({ message: "not found" }, { status: 404 });
    const [u, p] = await Promise.all([
      User.findById(b.labour).select("location locationUpdatedAt isOnline").lean(),
      b.labourProfile ? Labour.findById(b.labourProfile).select("fullName phone profileImage").lean() : null,
    ]);
    const c = u?.location?.coordinates;
    return NextResponse.json(
      {
        booking: {
          _id: String(b._id), bookingStatus: b.bookingStatus, category: b.category,
          workCoordinates: b.workLocation?.coordinates || null,
          site: [b.siteDetails, b.workAddress].filter(Boolean).join(", "),
          acceptedAt: b.acceptedAt, arrivedAt: b.arrivedAt, startedAt: b.startedAt, completedAt: b.completedAt,
          fare: b.fare, paymentMethod: b.paymentMethod || "", paymentStatus: b.paymentStatus,
          labour: { name: p?.fullName || "Labour", phone: p?.phone || "", photo: p?.profileImage || "", online: !!u?.isOnline },
          labourPosition: c ? { lat: c[1], lon: c[0], at: u.locationUpdatedAt ? new Date(u.locationUpdatedAt).getTime() : 0 } : null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("admin track error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
