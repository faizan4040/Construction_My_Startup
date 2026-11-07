import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import Ledger from "@/models/Ledger.model";
import Booking from "@/models/Booking.model";

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BUSY = ["confirmed", "arrived", "started", "work_completed"];

// Admin: every labour who registered on the platform, with live state + money
export async function GET(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page")) || 1);
    const limit = Math.min(50, Math.max(5, parseInt(sp.get("limit")) || 15));
    const q = (sp.get("q") || "").trim().slice(0, 60);
    const status = sp.get("status") || "all"; // all | approved | pending | rejected | online | blocked | removed
    const category = sp.get("category") || "";

    const where = { role: "laber" };
    if (status === "removed") where.deletedAt = { $ne: null };
    else where.deletedAt = null;
    if (status === "blocked") where.isBlocked = true;
    if (["approved", "pending", "rejected"].includes(status)) where.partnerStatus = status;
    if (status === "online") Object.assign(where, { isOnline: true, isBlocked: { $ne: true } });

    // search + category go through the Labour profile too (name / phone / category live there)
    if (q || category) {
      const pw = {};
      if (category) pw.category = category;
      if (q) pw.$or = [{ fullName: new RegExp(esc(q), "i") }, { phone: new RegExp(esc(q), "i") }];
      const owners = await Labour.find(pw).distinct("owner");
      if (q) {
        const re = new RegExp(esc(q), "i");
        where.$or = [{ _id: { $in: owners } }, { name: re }, { email: re }, { phone: re }];
        if (category) where._id = { $in: owners };
      } else where._id = { $in: owners };
    }

    const [users, total, counts] = await Promise.all([
      User.find(where).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .select("name email phone avatar partnerStatus partnerOnBoardingSteps videoKycStatus isOnline isBlocked blockReason deletedAt createdAt locationUpdatedAt")
        .lean(),
      User.countDocuments(where),
      User.aggregate([
        { $match: { role: "laber" } },
        {
          $group: {
            _id: null,
            all: { $sum: { $cond: [{ $eq: ["$deletedAt", null] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $and: [{ $eq: ["$deletedAt", null] }, { $eq: ["$partnerStatus", "approved"] }] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $and: [{ $eq: ["$deletedAt", null] }, { $eq: ["$partnerStatus", "pending"] }] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $and: [{ $eq: ["$deletedAt", null] }, { $eq: ["$partnerStatus", "rejected"] }] }, 1, 0] } },
            online: { $sum: { $cond: [{ $and: [{ $eq: ["$deletedAt", null] }, "$isOnline", { $ne: ["$isBlocked", true] }] }, 1, 0] } },
            blocked: { $sum: { $cond: [{ $and: [{ $eq: ["$deletedAt", null] }, { $eq: ["$isBlocked", true] }] }, 1, 0] } },
            removed: { $sum: { $cond: [{ $ne: ["$deletedAt", null] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const ids = users.map((u) => u._id);
    const now = new Date();
    const [profiles, money, busy] = await Promise.all([
      Labour.find({ owner: { $in: ids } })
        .select("owner fullName phone category profileImage availability status rating totalReviews completedJobs experienceYears isVerified location.address")
        .lean(),
      Ledger.aggregate([
        { $match: { ownerType: "labour", owner: { $in: ids } } },
        { $group: { _id: "$owner", bal: { $sum: { $cond: [{ $lte: ["$availableAt", now] }, "$amount", 0] } },
            earned: { $sum: { $cond: [{ $eq: ["$type", "labour_credit"] }, "$amount", 0] } } } },
      ]),
      Booking.distinct("labour", { labour: { $in: ids }, bookingStatus: { $in: BUSY } }),
    ]);
    const P = new Map(profiles.map((p) => [String(p.owner), p]));
    const M = new Map(money.map((m) => [String(m._id), m]));
    const B = new Set(busy.map(String));

    return NextResponse.json(
      {
        counts: counts[0] || {},
        total, page, pages: Math.max(1, Math.ceil(total / limit)),
        labours: users.map((u) => {
          const p = P.get(String(u._id));
          const m = M.get(String(u._id));
          const bal = m?.bal || 0;
          return {
            _id: String(u._id),
            name: p?.fullName || u.name,
            email: u.email,
            phone: p?.phone || u.phone || "",
            photo: p?.profileImage || u.avatar?.url || "",
            category: p?.category || "",
            area: p?.location?.address || "",
            partnerStatus: u.partnerStatus,
            profileStatus: p?.status || "not_created",
            step: u.partnerOnBoardingSteps,
            videoKycStatus: u.videoKycStatus,
            isVerified: !!p?.isVerified,
            online: !!u.isOnline && p?.availability !== "offline",
            availability: p?.availability || "offline",
            busy: B.has(String(u._id)),
            isBlocked: !!u.isBlocked,
            blockReason: u.blockReason || "",
            removed: !!u.deletedAt,
            rating: p?.rating || 0,
            totalReviews: p?.totalReviews || 0,
            completedJobs: p?.completedJobs || 0,
            experienceYears: p?.experienceYears || 0,
            wallet: Math.max(0, bal),
            dues: bal < 0 ? -bal : 0,
            earned: m?.earned || 0,
            joinedAt: u.createdAt,
            lastSeen: u.locationUpdatedAt,
          };
        }),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("admin partners list error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
