import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import User from "@/models/User.model";
import { calcSplit, getCommissionPercent } from "@/lib/commission";

const ACTIVE = ["confirmed", "arrived", "started", "work_completed"];

// The labour's ONE running live job (PartnerActiveJob screen + live map).
// The customer's phone and exact door are shown only because the labour already accepted.
export async function GET() {
  try {
    await connectDB();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const b = await Booking.findOne({ labour: s.userId, bookingStatus: { $in: ACTIVE } })
      .sort({ acceptedAt: -1 })
      .populate("user", "name")
      .lean();
    if (!b) return NextResponse.json({ booking: null }, { headers: { "Cache-Control": "no-store" } });

    const me = await User.findById(s.userId).select("location locationUpdatedAt").lean();
    const pct = b.bookingStatus === "completed" && b.commissionRate ? b.commissionRate : await getCommissionPercent("labour");
    const split = b.labourAmount > 0 ? { labourAmount: b.labourAmount, commission: b.adminCommission } : calcSplit(b.fare, pct);
    const c = me?.location?.coordinates;

    return NextResponse.json(
      {
        booking: {
          _id: String(b._id),
          bookingStatus: b.bookingStatus,
          category: b.category,
          customerName: b.user?.name || "Customer",
          customerPhone: b.userMobileNumber,
          workAddress: b.workAddress,
          siteDetails: b.siteDetails || "",
          workCoordinates: b.workLocation?.coordinates || null, // [lon, lat]
          pricingType: b.pricingType,
          duration: b.duration,
          ratePerUnit: b.ratePerUnit,
          fare: b.fare,
          youEarn: split.labourAmount,
          commission: split.commission,
          commissionPercent: pct,
          paymentMethod: b.paymentMethod || "",
          paymentStatus: b.paymentStatus,
          paymentReady: b.paymentMethod === "cash" || b.paymentStatus === "paid",
          acceptedAt: b.acceptedAt,
          arrivedAt: b.arrivedAt,
          startedAt: b.startedAt,
          completedAt: b.completedAt,
          workDurationMinutes: b.workDurationMinutes ?? null,
          myPosition: c ? { lat: c[1], lon: c[0], at: me.locationUpdatedAt } : null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("partner active booking error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
