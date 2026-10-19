import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import Booking from "@/models/Booking.model";
import { BOOKING_CONFIG, LABOUR_CATEGORIES, BUSY_STATUSES } from "@/lib/bookingConfig";

const approx = (n) => Math.round(n * 1000) / 1000; // ~110 m, labour's exact spot stays private
const DEV = process.env.NODE_ENV !== "production";
const log = (...a) => DEV && console.log("[near-by]", ...a);

export async function POST(req) {
  try {
    await connectDb();
    const session = await isAuthenticated();
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lat = Number(body.latitude);
    const lon = Number(body.longitude);
    const category = String(body.category || "");

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ message: "invalid coordinates" }, { status: 400 });
    }
    if (!LABOUR_CATEGORIES.includes(category)) {
      return NextResponse.json({ message: "invalid category" }, { status: 400 });
    }

    const freshAfter = new Date(Date.now() - BOOKING_CONFIG.LOCATION_FRESH_MS);
    log("site:", lat, lon, "category:", category, "radius(m):", BOOKING_CONFIG.SEARCH_RADIUS_M);

    // 1) nearest online, approved, fresh-GPS partners (sorted by distance, bounded)
    const partners = await User.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lon, lat] },
          distanceField: "distanceM",
          maxDistance: BOOKING_CONFIG.SEARCH_RADIUS_M,
          spherical: true,
          query: {
            role: "laber",
            isOnline: true,
            partnerStatus: "approved",
            isBlocked: { $ne: true },
            deletedAt: null,
            locationUpdatedAt: { $gte: freshAfter },
          },
        },
      },
      { $limit: 100 },
      { $project: { name: 1, avatar: 1, distanceM: 1, "location.coordinates": 1 } },
    ]);

    log("stage1 (online + fresh GPS + within radius):", partners.length);

    if (!partners.length) {
      if (DEV) {
        const base = { role: "laber", partnerStatus: "approved" };
        log("diag labour users (approved):", await User.countDocuments(base));
        log("diag online:", await User.countDocuments({ ...base, isOnline: true }));
        log(
          "diag with location:",
          await User.countDocuments({ ...base, "location.coordinates.0": { $exists: true } })
        );
        log(
          "diag fresh GPS:",
          await User.countDocuments({ ...base, locationUpdatedAt: { $gte: freshAfter } })
        );
      }
      return NextResponse.json([], { status: 200 });
    }

    // 2) remove labours who are already on a job
    const ids = partners.map((p) => p._id);
    const busyIds = new Set(
      (
        await Booking.distinct("labour", {
          labour: { $in: ids },
          bookingStatus: { $in: BUSY_STATUSES },
        })
      ).map(String)
    );
    const freeIds = ids.filter((id) => !busyIds.has(String(id)));
    log("stage2 (not busy):", freeIds.length);
    if (!freeIds.length) return NextResponse.json([], { status: 200 });

    // 3) only profiles of the SELECTED category — plumber never matches electrician.
    const profiles = await Labour.find({
      owner: { $in: freeIds },
      category,
      status: "approved",
      isActive: true,
      availability: { $ne: "offline" },
    })
      .select(
        "owner category fullName profileImage rateType pricePerHour pricePerDay " +
          "rating totalReviews completedJobs experienceYears isVerified serviceRadius"
      )
      .lean();

    log("stage3 (profiles of this category):", profiles.length);

    const byOwner = new Map(partners.map((p) => [String(p._id), p]));

    const result = profiles
      .map((l) => {
        const p = byOwner.get(String(l.owner));
        if (!p) return null;

        const distKm = Math.round((p.distanceM / 1000) * 10) / 10;

        // respect the labour's own service radius
        if (l.serviceRadius > 0 && distKm > l.serviceRadius) {
          log("skip: outside serviceRadius", distKm, ">", l.serviceRadius);
          return null;
        }

        // only expose the rate type(s) the labour actually offers
        const canDay = l.rateType === "day" || l.rateType === "both";
        const canHour = l.rateType === "hour" || l.rateType === "both";
        const dailyRate = canDay && l.pricePerDay > 0 ? l.pricePerDay : null;
        const hourlyRate = canHour && l.pricePerHour > 0 ? l.pricePerHour : null;

        // no valid rate -> cannot be booked, so don't list
        if (!dailyRate && !hourlyRate) {
          log("skip: no valid rate", l.rateType, l.pricePerDay, l.pricePerHour);
          return null;
        }

        const [pLon, pLat] = p.location?.coordinates ?? [];
        const img = l.profileImage || p.avatar?.url || "";

        return {
          _id: l._id, // Labour profile id (owner id / phone / aadhaar are never sent)
          name: l.fullName || p.name,
          avatar: img ? { url: img } : null,
          category: l.category,
          dailyRate,
          hourlyRate,
          rating: l.rating || 0,
          totalReviews: l.totalReviews || 0,
          completedJobs: l.completedJobs || 0,
          experienceYears: l.experienceYears || 0,
          isVerified: !!l.isVerified,
          isOnline: true,
          distance: distKm,
          latitude: pLat != null ? approx(pLat) : null,
          longitude: pLon != null ? approx(pLon) : null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, BOOKING_CONFIG.MAX_RESULTS);

    log("final result count:", result.length);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("near-by labour error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}