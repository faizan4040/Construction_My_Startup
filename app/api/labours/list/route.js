import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import Labour from "@/models/Labour.model"; // <-- apna asli Labour model file naam
import Booking, { BUSY_STATUSES } from "@/models/Booking.model";

export const dynamic = "force-dynamic";

const BOX_KM = 40;
const toRad = (d) => (d * Math.PI) / 180;
function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function freeAt(b) {
  const base = new Date(b.startedAt || b.acceptedAt || b.createdAt).getTime();
  const unit = b.pricingType === "daily" ? 86400000 : 3600000;
  const end = base + (b.duration || 1) * unit;
  return Math.max(end, Date.now() + 15 * 60000);
}
const roundUp15 = (ms) => new Date(Math.ceil(ms / 900000) * 900000);

export async function GET(req) {
  try {
    await connectDB();

    const sp = req.nextUrl.searchParams;
    const category = sp.get("category");
    const lat = parseFloat(sp.get("lat"));
    const lon = parseFloat(sp.get("lon"));
    const page = Math.max(parseInt(sp.get("page") || "0", 10) || 0, 0);
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "20", 10) || 20, 1), 30);

    const slugs = Labour.schema.path("category").enumValues;
    if (!category || !slugs.includes(category)) {
      return NextResponse.json({ message: "Invalid category" }, { status: 400 });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ message: "lat and lon are required" }, { status: 400 });
    }

    const dLat = BOX_KM / 111;
    const dLon = BOX_KM / (111 * Math.max(Math.cos(toRad(lat)), 0.1));

    const labours = await Labour.find({
      category,
      status: "approved",
      isActive: true,
      "location.latitude": { $gte: lat - dLat, $lte: lat + dLat },
      "location.longitude": { $gte: lon - dLon, $lte: lon + dLon },
    })
      .select(
        "owner fullName profileImage experienceYears skills rateType pricePerHour pricePerDay rating totalReviews completedJobs isVerified availability location serviceRadius"
      )
      .limit(400)
      .lean();

    const busy = labours.length
      ? await Booking.find({
          labour: { $in: labours.map((l) => l.owner) },
          bookingStatus: { $in: BUSY_STATUSES },
        })
          .select("labour startedAt acceptedAt createdAt pricingType duration")
          .lean()
      : [];
    const busyMap = new Map(busy.map((b) => [String(b.labour), b]));

    const all = [];
    for (const l of labours) {
      const wl = l.location || {};
      if (!wl.latitude || !wl.longitude) continue;
      const d = distKm(lat, lon, wl.latitude, wl.longitude);
      if (d > (l.serviceRadius || 10)) continue;

      const busyRec = busyMap.get(String(l.owner));
      if (l.availability === "offline" && !busyRec) continue;

      const isBusy = !!busyRec || l.availability === "busy";
      const eta = Math.round(d * 3) + 10;

      all.push({
        id: String(l._id),
        userId: String(l.owner), // used as booking.labour
        name: l.fullName,
        img: l.profileImage || "",
        experienceYears: l.experienceYears || 0,
        skills: (l.skills || []).slice(0, 3),
        rating: l.totalReviews ? Math.round((l.rating || 0) * 10) / 10 : null,
        reviews: l.totalReviews || 0,
        jobs: l.completedJobs || 0,
        verified: !!l.isVerified,
        rateHour: l.rateType === "hour" || l.rateType === "both" ? l.pricePerHour || null : null,
        rateDay: l.rateType === "day" || l.rateType === "both" ? l.pricePerDay || null : null,
        distanceKm: Math.round(d * 10) / 10,
        etaMinutes: eta,
        eta30: eta <= 30,
        status: isBusy ? "busy" : "free",
        freeAt: isBusy && busyRec ? roundUp15(freeAt(busyRec)).toISOString() : null,
        _d: d,
        _t: isBusy && busyRec ? freeAt(busyRec) : Infinity,
      });
    }

    all.sort((a, b) => {
      if (a.status !== b.status) return a.status === "free" ? -1 : 1;
      if (a.status === "free") return a._d - b._d || (b.rating || 0) - (a.rating || 0);
      return a._t - b._t || a._d - b._d;
    });

    const counts = {
      free: all.filter((w) => w.status === "free").length,
      busy: all.filter((w) => w.status === "busy").length,
    };
    const workers = all.slice(page * limit, page * limit + limit).map(({ _d, _t, ...w }) => w);

    return NextResponse.json(
      { workers, counts, page, hasMore: (page + 1) * limit < all.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("labour list error:", err);
    return NextResponse.json({ message: "Failed to load workers" }, { status: 500 });
  }
}