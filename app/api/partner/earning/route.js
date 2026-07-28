import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import Booking from "@/models/Booking.model";
import User from "@/models/User.model";
import { NextResponse } from "next/server";

// Same roles allowed as the rest of the onboarding/dashboard flow
const ALLOWED_ROLES = ["customer", "laber"];

export async function GET() {
  try {
    await connectDb();

    const authResult = await isAuthenticated(ALLOWED_ROLES);
    if (!authResult.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 400 });
    }
    if (authResult.blocked) {
      return NextResponse.json({ message: "account blocked" }, { status: 403 });
    }

    const partner = await User.findById(authResult.userId);
    if (!partner) {
      return NextResponse.json({ message: "user not found" }, { status: 400 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // NOTE: assuming the Booking model references the labour partner via
    // a "labour" field (matching the Labour model this whole flow is built
    // around) — if your actual Booking schema uses a different field name
    // (e.g. "partner" or "driver"), update this query accordingly.
    const bookings = await Booking.find({
      labour: partner._id,
      paymentStatus: "paid",
      createdAt: { $gte: sevenDaysAgo },
    }).select("partnerAmount createdAt");

    const earningMap = {};

    bookings.forEach((b) => {
      const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!earningMap[date]) {
        earningMap[date] = 0;
      }

      // FIX: original was `earningMap[date] + b.partnerAmount || 0`, which
      // due to operator precedence evaluates as
      // (earningMap[date] + b.partnerAmount) || 0 — if partnerAmount was
      // ever undefined, the whole sum became NaN and then silently reset
      // to 0, wiping out that day's already-accumulated total.
      earningMap[date] = earningMap[date] + (b.partnerAmount || 0);
    });

    const earnings = Object.entries(earningMap).map(([date, earnings]) => ({
      date,
      earnings,
    }));

    return NextResponse.json(earnings, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "partner earning error" },
      { status: 500 }
    );
  }
}