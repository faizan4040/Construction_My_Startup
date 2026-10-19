import { calcSplit, COMMISSION_PERCENT } from "@/lib/commission";

export const ADMIN_POPULATE = [
  { path: "labour", select: "name phone avatar" },
  { path: "user", select: "name phone email" },
  {
    path: "labourProfile",
    select: "fullName phone profileImage experienceYears rating totalReviews completedJobs isVerified",
  },
];

const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);

// ADMIN ONLY: includes phone numbers. Never use this shape in a customer / labour API.
export function shapeAdminBooking(b) {
  const lu = obj(b.labour);
  const cu = obj(b.user);
  const lp = obj(b.labourProfile);

  const done = b.bookingStatus === "completed";
  const split = calcSplit(b.fare);
  const adminCommission = done && b.adminCommission > 0 ? b.adminCommission : split.commission;
  const labourAmount = done && b.labourAmount > 0 ? b.labourAmount : split.labourAmount;

  let workSeconds = null;
  if (b.workDurationMinutes != null) workSeconds = Math.round(b.workDurationMinutes * 60);
  else if (b.startedAt && b.completedAt)
    workSeconds = Math.round((new Date(b.completedAt) - new Date(b.startedAt)) / 1000);

  return {
    _id: String(b._id),
    createdAt: b.createdAt,
    bookingStatus: b.bookingStatus,
    category: b.category,

    labour: {
      name: lp?.fullName || lu?.name || "—",
      phone: lp?.phone || lu?.phone || "",
      photo: lp?.profileImage || lu?.avatar?.url || "",
      experienceYears: lp?.experienceYears || 0,
      rating: lp?.rating || 0,
      totalReviews: lp?.totalReviews || 0,
      completedJobs: lp?.completedJobs || 0,
      isVerified: !!lp?.isVerified,
    },
    customer: {
      name: cu?.name || "—",
      phone: b.userMobileNumber || cu?.phone || "",
      email: cu?.email || "",
    },

    workAddress: b.workAddress,
    siteDetails: b.siteDetails || "",
    coordinates: b.workLocation?.coordinates || null, // [lon, lat]

    pricingType: b.pricingType,
    duration: b.duration,
    ratePerUnit: b.ratePerUnit,

    requestExpiresAt: b.requestExpiresAt,
    acceptedAt: b.acceptedAt,
    arrivedAt: b.arrivedAt,
    startedAt: b.startedAt,
    completedAt: b.completedAt,
    workSeconds,

    paymentMethod: b.paymentMethod || "",
    paymentStatus: b.paymentStatus,
    money: {
      fare: b.fare,
      commissionPercent: COMMISSION_PERCENT,
      adminCommission,
      labourAmount,
      projected: !done, // true = expected amounts, not yet earned
    },

    cancellationReason: b.cancellationReason || "",
    cancelledBy: b.cancelledBy || "",
  };
}