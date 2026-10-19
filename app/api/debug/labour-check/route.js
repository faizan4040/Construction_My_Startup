import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import Booking from "@/models/Booking.model";
import { BOOKING_CONFIG, BUSY_STATUSES } from "@/lib/bookingConfig";
import { distanceKm } from "@/lib/bookingSerializers";

export async function GET(req) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
  await connectDb();

  const sp = new URL(req.url).searchParams;
  const category = sp.get("category");
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  const point = sp.get("lat") && sp.get("lon") && Number.isFinite(lat) && Number.isFinite(lon) ? [lon, lat] : null;

  const indexes = await User.collection.indexes();
  const hasGeoIndex = indexes.some((i) => i.key?.location === "2dsphere");

  const labours = await Labour.find(category ? { category } : {})
    .select("owner category status isActive availability rateType pricePerDay pricePerHour serviceRadius")
    .lean();
  const ownerIds = labours.map((l) => l.owner);
  const users = await User.find({ _id: { $in: ownerIds } })
    .select("name role isOnline partnerStatus isBlocked deletedAt location locationUpdatedAt socketId updatedAt")
    .lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  const busy = new Set(
    (await Booking.distinct("labour", { labour: { $in: ownerIds }, bookingStatus: { $in: BUSY_STATUSES } })).map(String)
  );

  const now = Date.now();
  const radiusKm = BOOKING_CONFIG.SEARCH_RADIUS_M / 1000;

  const rows = labours.map((l) => {
    const u = byId.get(String(l.owner));
    const why = [];
    let distKm = null;
    let ageSec = null;

    if (!u) why.push("owner user not found");
    else {
      if (u.role !== "laber") why.push(`user role is "${u.role}", must be "laber"`);
      if (u.partnerStatus !== "approved") why.push(`user.partnerStatus = ${u.partnerStatus}`);
      if (u.isBlocked) why.push("user is blocked");
      if (u.deletedAt) why.push("user is deleted");
      if (!u.isOnline) why.push("isOnline=false (socket / identity not received)");
      if (busy.has(String(u._id))) why.push("labour is busy with another booking");

      const c = u.location?.coordinates;
      if (!c?.length) why.push("NO LOCATION SAVED (GPS never reached the server: check accuracy / permission)");
      else if (point) {
        distKm = distanceKm(c, point);
        if (distKm > radiusKm) why.push(`TOO FAR: ${distKm} km, search radius is ${radiusKm} km`);
        if (l.serviceRadius > 0 && distKm > l.serviceRadius)
          why.push(`outside labour's own serviceRadius (${l.serviceRadius} km)`);
      }
      if (!u.locationUpdatedAt) why.push("locationUpdatedAt missing");
      else {
        ageSec = Math.round((now - new Date(u.locationUpdatedAt).getTime()) / 1000);
        if (ageSec * 1000 > BOOKING_CONFIG.LOCATION_FRESH_MS) why.push(`GPS STALE: ${ageSec}s old`);
      }
    }
    if (l.status !== "approved") why.push(`labour.status = ${l.status} (final admin review pending)`);
    if (!l.isActive) why.push("labour.isActive=false");
    if (l.availability === "offline") why.push('labour.availability="offline"');
    const canDay = (l.rateType === "day" || l.rateType === "both") && l.pricePerDay > 0;
    const canHour = (l.rateType === "hour" || l.rateType === "both") && l.pricePerHour > 0;
    if (!canDay && !canHour) why.push("no valid rate");

    return {
      labour: String(l._id),
      ownerUserId: String(l.owner),            // compare with the LOGGED IN USER ID
      ownerSocketId: u?.socketId ?? null,      // null = identity never saved for this user
      ownerUpdatedAt: u?.updatedAt ?? null,
      name: u?.name,
      category: l.category,
      savedCoordinates: u?.location?.coordinates, // [lon, lat]
      distanceFromSiteKm: distKm,
      locationAgeSec: ageSec,
      visibleInSearch: why.length === 0,
      why,
    };
  });

  return NextResponse.json({
    hasGeoIndex,
    searchRadiusKm: radiusKm,
    siteGiven: !!point,
    total: rows.length,
    visible: rows.filter((r) => r.visibleInSearch).length,
    rows,
  });
}