import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import Booking from "@/models/Booking.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";
import {
  BOOKING_CONFIG, LABOUR_CATEGORIES, ACTIVE_STATUSES, BUSY_STATUSES,
  DURATION_DAYS, DURATION_DISCOUNT, isValidMobile,
} from "@/lib/bookingConfig";
import {
  toCustomerBooking, toLabourRequest, distanceKm,
} from "@/lib/bookingSerializers";
import { getLabourPublic } from "@/lib/labourPublic";

const bad = (message, status = 400, extra = {}) =>
  NextResponse.json({ message, ...extra }, { status });

export async function POST(req) {
  try {
    await connectDb();
    const session = await isAuthenticated();
    if (!session.isAuth) return bad("unauthorized", 401);

    const b = await req.json();
    const { labourId, category, pricingType = "daily", durationKey = "day", hours } = b;
    const workAddress = String(b.workAddress || "").trim().slice(0, 300);
    const siteDetails = String(b.siteDetails || "").trim().slice(0, 150);
    const lat = Number(b.workLocation?.latitude);
    const lon = Number(b.workLocation?.longitude);
    const mobile = String(b.mobileNumber || "");

    if (!mongoose.isValidObjectId(labourId)) return bad("invalid labour");
    if (!LABOUR_CATEGORIES.includes(category)) return bad("invalid category");
    if (!workAddress) return bad("work address required");
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180)
      return bad("invalid work location");
    if (!isValidMobile(mobile)) return bad("invalid mobile number");

    // stale pending requests of this user should not block a new one
    await Booking.updateMany(
      { user: session.userId, bookingStatus: "requested", requestExpiresAt: { $lte: new Date() } },
      { $set: { bookingStatus: "expired", cancelledBy: "system" } }
    );

    const existing = await Booking.findOne({
      user: session.userId,
      bookingStatus: { $in: ACTIVE_STATUSES },
    }).lean();
    if (existing) {
      const lu = await User.findById(existing.labour).select("name avatar").lean();
      const pub = await getLabourPublic(existing, lu);
      return bad("you already have an active booking", 409, {
        booking: toCustomerBooking(existing, pub),
      });
    }

    // category is enforced HERE, from the labour's own registered profile
    const profile = await Labour.findOne({
      _id: labourId,
      category,
      status: "approved",
      isActive: true,
      availability: { $ne: "offline" },
    })
      .select("owner category rateType pricePerDay pricePerHour serviceRadius")
      .lean();
    if (!profile) return bad("labour not available for this category", 404);

    const labourUser = await User.findOne({
      _id: profile.owner,
      role: "laber",
      partnerStatus: "approved",
      isBlocked: { $ne: true },
      deletedAt: null,
    })
      .select("_id name avatar isOnline location locationUpdatedAt")
      .lean();
    if (!labourUser) return bad("labour not found", 404);
    if (String(labourUser._id) === String(session.userId)) return bad("you cannot book yourself");
    if (!labourUser.isOnline) return bad("labour is offline now", 409);

    // GPS must be fresh (same rule as the nearby search)
    const freshAfter = Date.now() - BOOKING_CONFIG.LOCATION_FRESH_MS;
    if (!labourUser.locationUpdatedAt || new Date(labourUser.locationUpdatedAt).getTime() < freshAfter)
      return bad("labour is not reachable right now", 409);

    // respect the labour's own service radius
    const dKm = distanceKm(labourUser.location?.coordinates, [lon, lat]);
    if (dKm == null) return bad("labour location unavailable", 409);
    if (profile.serviceRadius > 0 && dKm > profile.serviceRadius)
      return bad("your site is outside this labour's service area", 409);

    const busy = await Booking.exists({
      labour: labourUser._id,
      bookingStatus: { $in: BUSY_STATUSES },
    });
    if (busy) return bad("labour is busy with another job", 409);

    // fare is always computed on the server, from the REAL Labour fields
    const canDay = profile.rateType === "day" || profile.rateType === "both";
    const canHour = profile.rateType === "hour" || profile.rateType === "both";

    let fare, duration, ratePerUnit;
    if (pricingType === "hourly") {
      const h = Number(hours);
      if (!canHour || !(profile.pricePerHour > 0) || !Number.isInteger(h) || h < 1 || h > 24)
        return bad("invalid hourly booking");
      duration = h;
      ratePerUnit = profile.pricePerHour;
      fare = Math.round(ratePerUnit * h);
    } else if (pricingType === "daily") {
      if (!canDay || !(profile.pricePerDay > 0) || !DURATION_DAYS[durationKey])
        return bad("invalid daily booking");
      const days = DURATION_DAYS[durationKey];
      const raw = profile.pricePerDay * days;
      duration = days;
      ratePerUnit = profile.pricePerDay;
      fare = Math.round(raw - raw * DURATION_DISCOUNT[durationKey]);
    } else {
      return bad("invalid pricingType");
    }

    let booking;
    try {
      booking = await Booking.create({
        user: session.userId,
        labour: labourUser._id,
        labourProfile: profile._id,
        category,
        workAddress,
        siteDetails,
        workLocation: { type: "Point", coordinates: [lon, lat] },
        fare, pricingType, durationKey, duration, ratePerUnit,
        userMobileNumber: mobile,
        bookingStatus: "requested",
        requestExpiresAt: new Date(Date.now() + BOOKING_CONFIG.REQUEST_TTL_MS),
        history: [{ status: "requested", by: session.userId, byRole: "customer" }],
      });
    } catch (e) {
      if (e.code === 11000) return bad("labour or you already have an active booking", 409);
      throw e;
    }

    const plain = booking.toObject();

    // labour gets the request; admin dashboard gets a "refresh" ping
    await Promise.all([
      emitToUser(
        labourUser._id,
        "new-booking",
        toLabourRequest(plain, labourUser.location?.coordinates)
      ),
      emitToAdmins("admin-booking-update", {
        bookingId: String(booking._id),
        status: "requested",
      }),
    ]);

    return NextResponse.json({ booking: toCustomerBooking(plain, null) }, { status: 200 });
  } catch (e) {
    console.error("booking create error:", e);
    return bad("server error", 500);
  }
}