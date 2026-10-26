import Labour from "@/models/Labour.model";

// what a CUSTOMER may know about the labour: no name, no phone, no aadhaar
export async function getLabourPublic(booking, userDoc) {
  const p = booking.labourProfile
    ? await Labour.findById(booking.labourProfile)
        .select("category profileImage experienceYears rating totalReviews completedJobs isVerified")
        .lean()
    : null;
  return {
    category: p?.category || booking.category,
    photo: p?.profileImage || userDoc?.avatar?.url || "",
    experienceYears: p?.experienceYears || 0,
    rating: p?.rating || 0,
    totalReviews: p?.totalReviews || 0,
    completedJobs: p?.completedJobs || 0,
    isVerified: !!p?.isVerified,
  };
}