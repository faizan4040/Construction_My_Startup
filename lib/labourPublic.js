import Labour from "@/models/Labour.model";

// public-safe labour info for the customer (never phone / aadhaar / bank)
export async function getLabourPublic(booking, userDoc) {
  const p = booking.labourProfile
    ? await Labour.findById(booking.labourProfile).select("fullName profileImage").lean()
    : null;
  const img = p?.profileImage || userDoc?.avatar?.url || "";
  return { name: p?.fullName || userDoc?.name, avatar: img ? { url: img } : null };
}