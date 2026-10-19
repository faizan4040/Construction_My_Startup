const toRad = (d) => (d * Math.PI) / 180;

// a, b = [lon, lat]
export function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 10) / 10;
}

// Customer view: NEVER includes labour phone / OTPs
export function toCustomerBooking(b, labourUser) {
  return {
    _id: b._id,
    category: b.category,
    workAddress: b.workAddress,
    siteDetails: b.siteDetails,
    fare: b.fare,
    pricingType: b.pricingType,
    duration: b.duration,
    ratePerUnit: b.ratePerUnit,
    bookingStatus: b.bookingStatus,
    paymentStatus: b.paymentStatus,
    requestExpiresAt: b.requestExpiresAt,
    acceptedAt: b.acceptedAt,
    arrivedAt: b.arrivedAt,
    startedAt: b.startedAt,
    completedAt: b.completedAt,
    workDurationMinutes: b.workDurationMinutes,
    createdAt: b.createdAt,
    labour:
      labourUser && b.bookingStatus !== "requested"
        ? { name: labourUser.name, avatar: labourUser.avatar?.url ?? null }
        : null,
  };
}

// Labour sees only approximate info until they accept (no exact door, no customer number)
export function toLabourRequest(b, labourCoords) {
  return {
    _id: b._id,
    category: b.category,
    workAddress: b.workAddress,
    fare: b.fare,
    pricingType: b.pricingType,
    duration: b.duration,
    ratePerUnit: b.ratePerUnit,
    requestExpiresAt: b.requestExpiresAt,
    createdAt: b.createdAt,
    distanceKm: distanceKm(labourCoords, b.workLocation?.coordinates),
  };
}