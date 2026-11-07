import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import Booking from "@/models/Booking.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import { emitToAdmins } from "@/lib/socketEmit";

const BUSY = ["confirmed", "arrived", "started", "work_completed"];

async function state(userId) {
  const [u, p] = await Promise.all([
    User.findById(userId).select("partnerStatus partnerOnBoardingSteps isOnline").lean(),
    Labour.findOne({ owner: userId }).select("status availability isActive").lean(),
  ]);
  const live = u?.partnerStatus === "approved" && p?.status === "approved" && p?.isActive !== false;
  return { live, online: live && p?.availability !== "offline", availability: p?.availability || "offline" };
}

export async function GET() {
  await connectDB();
  const s = await isAuthenticated("laber");
  if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  const [st, job, svc] = await Promise.all([
    state(s.userId),
    Booking.exists({ labour: s.userId, bookingStatus: { $in: BUSY } }),
    ServiceBooking.exists({ assignedLabour: s.userId, status: "in_progress" }),
  ]);
  return NextResponse.json({ ...st, hasActiveJob: !!job || !!svc }, { headers: { "Cache-Control": "no-store" } });
}

// Duty ON / OFF. While OFF the labour is hidden from the live search and gets no new requests.
export async function POST(req) {
  try {
    await connectDB();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const { online } = await req.json();
    const cur = await state(s.userId);
    if (!cur.live) return NextResponse.json({ message: "Your profile is not approved yet" }, { status: 409 });

    const busy = await Booking.exists({ labour: s.userId, bookingStatus: { $in: BUSY } });
    const availability = online ? (busy ? "busy" : "available") : "offline";
    await Labour.updateOne({ owner: s.userId }, { $set: { availability } });

    if (!online) {
      // going off duty: pending live requests to this labour are released at once
      const now = new Date();
      await Booking.updateMany(
        { labour: s.userId, bookingStatus: "requested" },
        {
          $set: { bookingStatus: "rejected", cancelledBy: "labour", cancellationReason: "labour_offline" },
          $push: { history: { status: "rejected", at: now, byRole: "system", note: "labour_offline" } },
        }
      );
    }
    await emitToAdmins("admin-booking-update", { kind: "labour", labourId: String(s.userId), status: availability });
    return NextResponse.json({ ...cur, online: !!online, availability });
  } catch (error) {
    console.error("availability error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
