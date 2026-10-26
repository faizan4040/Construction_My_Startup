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

// When will a busy worker be free again? (estimate from booking duration)
function freeAt(b) {
  const base = new Date(b.startedAt || b.acceptedAt || b.createdAt).getTime();
  const unit = b.pricingType === "daily" ? 86400000 : 3600000;
  const end = base + (b.duration || 1) * unit;
  return Math.max(end, Date.now() + 15 * 60000);
}
const roundUp15 = (ms) => new Date(Math.ceil(ms / 900000) * 900000);
const range = (arr) => (arr.length ? { min: Math.min(...arr), max: Math.max(...arr) } : null);

export async function GET(req) {
  try {
    await connectDB();

    const sp = req.nextUrl.searchParams;
    const lat = parseFloat(sp.get("lat"));
    const lon = parseFloat(sp.get("lon"));
    const hasLoc = Number.isFinite(lat) && Number.isFinite(lon);
    const only = sp.get("category");

    const slugs = Labour.schema.path("category").enumValues;
    const base = { status: "approved", isActive: true, ...(only ? { category: only } : {}) };

    // 1) city-wide aggregates (cheap)
    const groups = await Labour.aggregate([
      { $match: base },
      {
        $group: {
          _id: "$category",
          registered: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ["$availability", "available"] }, 1, 0] } },
          verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
          jobs: { $sum: { $ifNull: ["$completedJobs", 0] } },
          reviews: { $sum: { $ifNull: ["$totalReviews", 0] } },
          ratingSum: {
            $sum: { $multiply: [{ $ifNull: ["$rating", 0] }, { $ifNull: ["$totalReviews", 0] }] },
          },
        },
      },
    ]);
    const gMap = new Map(groups.map((g) => [g._id, g]));

    // 2) nearby candidates (bounding box only)
    let local = [];
    if (hasLoc) {
      const dLat = BOX_KM / 111;
      const dLon = BOX_KM / (111 * Math.max(Math.cos(toRad(lat)), 0.1));
      local = await Labour.find({
        ...base,
        "location.latitude": { $gte: lat - dLat, $lte: lat + dLat },
        "location.longitude": { $gte: lon - dLon, $lte: lon + dLon },
      })
        .select(
          "owner category fullName profileImage rateType pricePerHour pricePerDay availability location serviceRadius"
        )
        .limit(3000)
        .lean();
    }

    const busy = local.length
      ? await Booking.find({
          labour: { $in: local.map((l) => l.owner) },
          bookingStatus: { $in: BUSY_STATUSES },
        })
          .select("labour startedAt acceptedAt createdAt pricingType duration")
          .lean()
      : [];
    const busyMap = new Map(busy.map((b) => [String(b.labour), b]));

    const cats = {};
    for (const s of only ? [only] : slugs) {
      const g = gMap.get(s) || {};
      cats[s] = {
        slug: s,
        registered: g.registered || 0,
        available: g.available || 0,
        verified: g.verified || 0,
        jobs: g.jobs || 0,
        reviews: g.reviews || 0,
        ratingSum: g.ratingSum || 0,
        nearby: hasLoc ? 0 : null,
        busyNearby: hasLoc ? 0 : null,
        inArea: 0,
        _nearestKm: null,
        _hour: [],
        _day: [],
        _free: [],
        _nextFree: null,
      };
    }

    for (const l of local) {
      const c = cats[l.category];
      if (!c) continue;

      const wl = l.location || {};
      if (!wl.latitude || !wl.longitude) continue; // location never set
      const d = distKm(lat, lon, wl.latitude, wl.longitude);
      if (d > (l.serviceRadius || 10)) continue; // outside this worker's service area

      const busyRec = busyMap.get(String(l.owner));
      const isBusy = !!busyRec || l.availability === "busy";
      const isFree = l.availability === "available" && !busyRec;

      c.inArea++;
      if (l.rateType === "hour" || l.rateType === "both") l.pricePerHour && c._hour.push(l.pricePerHour);
      if (l.rateType === "day" || l.rateType === "both") l.pricePerDay && c._day.push(l.pricePerDay);

      if (isFree) {
        c.nearby++;
        c._nearestKm = c._nearestKm == null ? d : Math.min(c._nearestKm, d);
        c._free.push({ id: String(l._id), name: l.fullName, img: l.profileImage || "", d });
      } else if (isBusy) {
        c.busyNearby++;
        if (busyRec) {
          const t = freeAt(busyRec);
          c._nextFree = c._nextFree == null ? t : Math.min(c._nextFree, t);
        }
      }
    }

    const out = {};
    const totals = { registered: 0, available: 0, verified: 0, jobsCompleted: 0 };
    for (const [slug, c] of Object.entries(cats)) {
      totals.registered += c.registered;
      totals.available += c.available;
      totals.verified += c.verified;
      totals.jobsCompleted += c.jobs;

      const freeCount = hasLoc ? c.nearby : c.available;
      const eta = c._nearestKm != null ? Math.round(c._nearestKm * 3) + 10 : null;
      out[slug] = {
        slug,
        registered: c.registered,
        available: c.available,
        nearby: c.nearby,
        busyNearby: c.busyNearby,
        inArea: hasLoc ? c.inArea : null,
        etaMinutes: eta,
        eta30: eta != null && eta <= 30, // 30-min promise only when real supply supports it
        rateHour: range(c._hour),
        rateDay: range(c._day),
        rating: c.reviews ? Math.round((c.ratingSum / c.reviews) * 10) / 10 : null,
        reviews: c.reviews,
        jobs: c.jobs,
        verified: c.verified,
        nextSlot: freeCount === 0 && c._nextFree ? roundUp15(c._nextFree).toISOString() : null,
        workers: c._free.sort((a, b) => a.d - b.d).slice(0, 3).map(({ d, ...w }) => w),
      };
    }

    return NextResponse.json(
      { hasLocation: hasLoc, categories: out, totals, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("labour summary error:", err);
    return NextResponse.json({ error: "Failed to load labour summary" }, { status: 500 });
  }
}