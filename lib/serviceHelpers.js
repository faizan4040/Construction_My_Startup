import mongoose from "mongoose";
import ServiceCategory from "@/models/ServiceCategory.model";
import { ICON_NAMES, SERVICE_TYPES } from "@/lib/serviceConfig";

export const j = (data, status = 200) => Response.json(data, { status });
export const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
export const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const str = (v, max) => String(v ?? "").trim().slice(0, max);
const lines = (v, n, max) =>
  (Array.isArray(v) ? v : String(v || "").split("\n")).map((x) => str(x, max)).filter(Boolean).slice(0, n);

// only images that really live in OUR Cloudinary account are accepted
export const cloudOk = (url) =>
  typeof url === "string" &&
  url.length < 500 &&
  url.startsWith(`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/`);

const pickImage = (img) =>
  img?.url && cloudOk(img.url) ? { url: img.url, public_id: str(img.public_id, 200) } : null;

export function parseProviderBody(b) {
  const name = str(b.name, 80);
  const phone = str(b.phone, 10);
  const price = Number(b.startingPrice);
  const exp = Number(b.experienceYears || 0);
  const image = pickImage(b.image);
  if (name.length < 2) return { error: "Enter the labour name" };
  if (!/^[6-9]\d{9}$/.test(phone)) return { error: "Enter a valid 10 digit mobile number" };
  if (!Number.isFinite(price) || price < 1 || price > 1e7) return { error: "Enter a valid starting price" };
  if (!Number.isInteger(exp) || exp < 0 || exp > 60) return { error: "Experience must be 0 to 60 years" };
  if (!image) return { error: "Upload the labour image" };
  const priceUnit = ["visit", "hour", "day", "sq.ft", "project"].includes(b.priceUnit) ? b.priceUnit : "visit";
  return {
    data: {
      name, phone, image, startingPrice: Math.round(price), priceUnit, experienceYears: exp,
      headline: str(b.headline, 140), description: str(b.description, 1500),
      inclusions: lines(b.inclusions, 12, 120), process: lines(b.process, 8, 160),
      responseText: str(b.responseText, 60) || "Same-day service",
      serviceType: SERVICE_TYPES.includes(b.serviceType) ? b.serviceType : SERVICE_TYPES[0],
      professionalType: b.professionalType === "company" ? "company" : "individual",
      isVerified: b.isVerified !== false,
      isActive: b.isActive !== false,
    },
  };
}

export function parseCategoryBody(b) {
  const name = str(b.name, 40);
  const image = pickImage(b.image);
  if (name.length < 2) return { error: "Enter the category name" };
  if (!image) return { error: "Upload the category image" };
  return { data: { name, slug: slugify(name), icon: ICON_NAMES.includes(b.icon) ? b.icon : "Wrench", image } };
}

// existing category by id, or a NEW one created automatically from the labour form
export async function resolveCategory(b) {
  if (b.categoryId) {
    if (!mongoose.isValidObjectId(b.categoryId)) return { error: "Invalid category" };
    const c = await ServiceCategory.findById(b.categoryId).select("_id").lean();
    return c ? { id: c._id } : { error: "Category not found" };
  }
  const p = parseCategoryBody(b.newCategory || {});
  if (p.error) return { error: `New category: ${p.error}` };
  let c = await ServiceCategory.findOne({ slug: p.data.slug }).select("_id").lean();
  if (!c) {
    try {
      c = await ServiceCategory.create(p.data);
    } catch (e) {
      if (e.code !== 11000) throw e;
      c = await ServiceCategory.findOne({ slug: p.data.slug }).select("_id").lean();
    }
  }
  return { id: c._id };
}

// what a CUSTOMER may see: never the phone number
export const publicProvider = (p, latestReview) => ({
  _id: String(p._id),
  name: p.name,
  image: p.image?.url || "",
  headline: p.headline,
  description: p.description,
  category: p.category ? { name: p.category.name, slug: p.category.slug, icon: p.category.icon } : null,
  startingPrice: p.startingPrice,
  priceUnit: p.priceUnit,
  experienceYears: p.experienceYears,
  responseText: p.responseText,
  serviceType: p.serviceType,
  professionalType: p.professionalType,
  isVerified: p.isVerified,
  rating: p.rating || 0,
  reviewCount: p.reviewCount || 0,
  jobsDone: p.jobsDone || 0,
  latestReview: latestReview || null,
});

export const userBooking = (b) => ({
  _id: String(b._id),
  code: b.code,
  provider: String(b.provider),
  providerName: b.providerName,
  providerImage: b.providerImage,
  categoryName: b.categoryName,
  slotDate: b.slotDate,
  slotTime: b.slotTime,
  contactName: b.contactName,
  contactPhone: b.contactPhone,
  address: b.address,
  price: b.price, fee: b.fee, total: b.total,
  status: b.status,
  paymentMethod: b.paymentMethod || "",
  paymentStatus: b.paymentStatus,
  assignedName: b.assignedName || "",
  cancelledBy: b.cancelledBy || "",
  reviewed: !!b.reviewed,
  createdAt: b.createdAt,
});

export const adminBooking = (b) => ({
  ...userBooking(b),
  assignedPhone: b.assignedPhone || "",
  adminNote: b.adminNote || "",
  adminSeen: !!b.adminSeen,
  cancelReason: b.cancelReason || "",
  paidAt: b.paidAt,
  completedAt: b.completedAt,
  history: (b.history || []).map((h) => ({ status: h.status, at: h.at, byRole: h.byRole, note: h.note })),
});