import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import "@/models/User.model";
import { calcSplit } from "@/lib/commission";

const ACTIVE = ["confirmed", "arrived", "started", "work_completed"];

const shape = (b) => ({
  _id: String(b._id),
  bookingStatus: b.bookingStatus,
  category: b.category,
  customerName: b.user?.name || "Customer",
  // customer's number is shown to the labour only after accepting
  customerPhone: ACTIVE.includes(b.bookingStatus) ? b.userMobileNumber : "",
  workAddress: b.workAddress,
  siteDetails: b.siteDetails || "",
  coordinates: b.workLocation?.coordinates || null, // [lon, lat]
  pricingType: b.pricingType,
  duration: b.duration,
  ratePerUnit: b.ratePerUnit,
  fare: b.fare,
  youEarn: b.labourAmount > 0 ? b.labourAmount : calcSplit(b.fare).labourAmount,
  paymentMethod: b.paymentMethod || "",
  paymentStatus: b.paymentStatus,
  acceptedAt: b.acceptedAt,
  startedAt: b.startedAt,
  completedAt: b.completedAt,
  workDurationMinutes: b.workDurationMinutes ?? null,
});

export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated("laber");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const [active, history] = await Promise.all([
      Booking.find({ labour: session.userId, bookingStatus: { $in: ACTIVE } })
        .sort({ acceptedAt: -1 }).populate("user", "name").lean(),
      Booking.find({ labour: session.userId, bookingStatus: { $in: ["completed", "cancelled"] } })
        .sort({ updatedAt: -1 }).limit(20).populate("user", "name").lean(),
    ]);

    return NextResponse.json({ active: active.map(shape), history: history.map(shape) });
  } catch (error) {
    console.error("partner bookings error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}