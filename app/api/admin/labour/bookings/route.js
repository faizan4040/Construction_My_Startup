import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import Labour from "@/models/Labour.model";
import "@/models/User.model";
import { LABOUR_CATEGORIES } from "@/lib/bookingConfig";
import { ADMIN_POPULATE, shapeAdminBooking } from "@/lib/adminBookingShape";

const STATUSES = [
  "requested", "confirmed", "arrived", "started", "work_completed",
  "completed", "cancelled", "rejected", "expired",
];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req) {
  try {
    await connectDb();
    const session = await isAuthenticated("admin");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit")) || 15));

    // soft-deleted bookings never show in the admin table
    const base = { deletedAt: null };
    const category = sp.get("category");
    if (LABOUR_CATEGORIES.includes(category)) base.category = category;

    const pm = sp.get("paymentMethod");
    if (["cash", "online"].includes(pm)) base.paymentMethod = pm;

    // dates are interpreted in IST
    const range = {};
    const from = sp.get("from");
    const to = sp.get("to");
    if (from) {
      const d = new Date(`${from}T00:00:00+05:30`);
      if (!isNaN(d)) range.$gte = d;
    }
    if (to) {
      const d = new Date(`${to}T23:59:59.999+05:30`);
      if (!isNaN(d)) range.$lte = d;
    }
    if (Object.keys(range).length) base.createdAt = range;

    // search: exact booking id, address, or labour name
    const q = (sp.get("q") || "").trim().slice(0, 100);
    if (q) {
      if (mongoose.isValidObjectId(q) && q.length === 24) {
        base._id = new mongoose.Types.ObjectId(q);
      } else {
        const re = new RegExp(esc(q), "i");
        const ids = await Labour.find({ fullName: re }).select("_id").limit(200).lean();
        base.$or = [{ workAddress: re }, { labourProfile: { $in: ids.map((i) => i._id) } }];
      }
    }

    const filter = { ...base };
    const status = sp.get("status");
    if (STATUSES.includes(status)) filter.bookingStatus = status;

    const [rows, total, countsAgg] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(ADMIN_POPULATE)
        .lean(),
      Booking.countDocuments(filter),
      Booking.aggregate([{ $match: base }, { $group: { _id: "$bookingStatus", n: { $sum: 1 } } }]),
    ]);

    const counts = {};
    countsAgg.forEach((c) => (counts[c._id] = c.n));

    return NextResponse.json({
      bookings: rows.map(shapeAdminBooking),
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
      counts,
    });
  } catch (error) {
    console.error("admin bookings error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}