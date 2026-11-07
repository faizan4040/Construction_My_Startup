import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import Booking from "@/models/Booking.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import { getLabourWallet } from "@/lib/finance";
import { getSettings } from "@/lib/settings";

const IST = 5.5 * 3600e3;
const ACTIVE = ["confirmed", "arrived", "started", "work_completed"];

// Everything the labour dashboard needs in ONE request
export async function GET() {
  try {
    await connectDB();
    const s = await isAuthenticated("laber");
    if (!s.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    const me = new mongoose.Types.ObjectId(String(s.userId));

    const d = new Date(Date.now() + IST);
    d.setUTCHours(0, 0, 0, 0);
    const todayStart = new Date(d.getTime() - IST);

    const [user, profile, active, requests, svc, wallet, settings, todayLive, todaySvc, totals] = await Promise.all([
      User.findById(me).select("name avatar partnerStatus partnerOnBoardingSteps videoKycStatus isOnline").lean(),
      Labour.findOne({ owner: me }).select("fullName category profileImage availability status rating totalReviews completedJobs experienceYears pricePerDay pricePerHour rateType").lean(),
      Booking.findOne({ labour: me, bookingStatus: { $in: ACTIVE } }).select("bookingStatus category workAddress fare paymentMethod paymentStatus startedAt").lean(),
      Booking.countDocuments({ labour: me, bookingStatus: "requested", requestExpiresAt: { $gt: new Date() } }),
      ServiceBooking.find({ assignedLabour: me, status: { $in: ["assigned", "in_progress"] } })
        .select("code categoryName slotDate slotTime status assignStatus address.city total").sort({ slotDate: 1 }).lean(),
      getLabourWallet(me),
      getSettings(),
      Booking.aggregate([
        { $match: { labour: me, bookingStatus: "completed", closedAt: { $gte: todayStart } } },
        { $group: { _id: null, n: { $sum: 1 }, earn: { $sum: "$labourAmount" }, mins: { $sum: { $ifNull: ["$workDurationMinutes", 0] } } } },
      ]),
      ServiceBooking.aggregate([
        { $match: { assignedLabour: me, status: "completed", completedAt: { $gte: todayStart } } },
        { $group: { _id: null, n: { $sum: 1 }, earn: { $sum: "$labourAmount" } } },
      ]),
      Promise.all([
        Booking.countDocuments({ labour: me, bookingStatus: "completed" }),
        ServiceBooking.countDocuments({ assignedLabour: me, status: "completed" }),
      ]),
    ]);

    const live = user?.partnerStatus === "approved" && profile?.status === "approved";
    return NextResponse.json(
      {
        user: { name: profile?.fullName || user?.name, photo: profile?.profileImage || user?.avatar?.url || "" },
        live,
        online: live && profile?.availability !== "offline",
        socketOnline: !!user?.isOnline,
        profile: profile && {
          category: profile.category, rating: profile.rating || 0, totalReviews: profile.totalReviews || 0,
          experienceYears: profile.experienceYears || 0, rateType: profile.rateType,
          pricePerDay: profile.pricePerDay || 0, pricePerHour: profile.pricePerHour || 0,
        },
        activeJob: active && { ...active, _id: String(active._id) },
        pendingRequests: requests,
        serviceJobs: svc.map((j) => ({ ...j, _id: String(j._id) })),
        today: {
          jobs: (todayLive[0]?.n || 0) + (todaySvc[0]?.n || 0),
          earned: (todayLive[0]?.earn || 0) + (todaySvc[0]?.earn || 0),
          minutes: Math.round(todayLive[0]?.mins || 0),
        },
        totalJobs: totals[0] + totals[1],
        wallet,
        rules: {
          commissionPercent: settings.labourCommissionPercent,
          serviceCommissionPercent: settings.serviceCommissionPercent,
          maxCashDues: settings.maxCashDues,
          minPayout: settings.minPayout,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("partner home error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
