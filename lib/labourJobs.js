import Labour from "@/models/Labour.model";
import User from "@/models/User.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";
import { sendNotification } from "@/lib/notification";
import { calcServiceSplit } from "@/lib/commission";

export const SERVICE_OPEN = ["assigned", "in_progress"];

// What the LABOUR sees of a scheduled service job.
// Customer phone + full address are revealed only after the labour accepts.
export function labourServiceJob(b, split) {
  const accepted = b.assignStatus === "accepted";
  const youEarn = b.labourAmount > 0 ? b.labourAmount : split?.labourAmount ?? 0;
  const commission = b.adminCommission > 0 ? b.adminCommission : split?.commission ?? 0;
  return {
    _id: String(b._id),
    code: b.code,
    categoryName: b.categoryName,
    serviceName: b.providerName,
    slotDate: b.slotDate,
    slotTime: b.slotTime,
    status: b.status,
    assignStatus: b.assignStatus,
    customerName: accepted ? b.contactName : (b.contactName || "Customer").split(" ")[0],
    customerPhone: accepted ? b.contactPhone : "",
    address: accepted
      ? b.address
      : { full: "", landmark: "", city: b.address?.city || "", pincode: b.address?.pincode || "" },
    total: b.total,
    paymentMethod: b.paymentMethod || "",
    paymentStatus: b.paymentStatus,
    youEarn,
    commission,
    collectCash: b.paymentMethod === "cash" ? b.total : 0,
    adminNote: accepted ? b.adminNote || "" : "",
    offeredAt: b.offeredAt,
    labourAcceptedAt: b.labourAcceptedAt,
    startedAt: b.startedAt,
    completedAt: b.completedAt,
  };
}

export async function previewSplit(b) {
  return calcServiceSplit({ price: b.price, fee: b.fee, total: b.total });
}

// live update to everyone who watches this service job
export async function pushServiceUpdate(b, status, extra = {}) {
  const p = { kind: "service", bookingId: String(b._id), code: b.code, status, ...extra };
  await Promise.all([
    emitToAdmins("admin-booking-update", p),
    b.assignedLabour ? emitToUser(b.assignedLabour, "service-job-update", p) : null,
    b.user ? emitToUser(b.user, "service-booking-update", p) : null,
  ]);
}

// labour accounts the admin can pick when assigning a service job
export async function assignableLabours({ q = "", category = "" } = {}) {
  const where = { status: "approved", isActive: true };
  if (category) where.category = category;
  if (q) {
    const re = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    where.$or = [{ fullName: re }, { phone: re }];
  }
  const profiles = await Labour.find(where)
    .select("owner fullName phone category profileImage availability rating completedJobs experienceYears location.address")
    .limit(60)
    .lean();
  const users = await User.find({
    _id: { $in: profiles.map((p) => p.owner) },
    role: "laber", isBlocked: { $ne: true }, deletedAt: null, partnerStatus: "approved",
  }).select("isOnline").lean();
  const ok = new Map(users.map((u) => [String(u._id), u]));
  const busy = new Set(
    (await ServiceBooking.distinct("assignedLabour", {
      assignedLabour: { $in: users.map((u) => u._id) }, status: "in_progress",
    })).map(String)
  );
  return profiles
    .filter((p) => ok.has(String(p.owner)))
    .map((p) => ({
      userId: String(p.owner),
      profileId: String(p._id),
      name: p.fullName,
      phone: p.phone,
      category: p.category,
      photo: p.profileImage || "",
      online: !!ok.get(String(p.owner))?.isOnline && p.availability !== "offline",
      availability: p.availability,
      busy: busy.has(String(p.owner)),
      rating: p.rating || 0,
      completedJobs: p.completedJobs || 0,
      experienceYears: p.experienceYears || 0,
      area: p.location?.address || "",
    }))
    .sort((a, b) => Number(b.online) - Number(a.online) || Number(a.busy) - Number(b.busy) || b.rating - a.rating);
}

export async function offerToLabour(b, labour) {
  const split = await previewSplit(b);
  await Promise.all([
    emitToUser(labour.userId, "service-job-offer", labourServiceJob(b, split)),
    sendNotification({
      userId: labour.userId,
      title: "New job assigned",
      message: `${b.categoryName} · ${b.slotDate} ${b.slotTime} · ${b.address?.city || ""}. Earn ₹${split.labourAmount}`,
      type: "general",
      link: "/partner/service-jobs",
    }),
  ]);
}
