import crypto from "crypto";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import ServiceProvider from "@/models/ServiceProvider.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import { j, str, esc, userBooking } from "@/lib/serviceHelpers";
import {
  ACTIVE, SLOTS, SLOT_CAPACITY, MAX_DAYS_AHEAD, calcTotal, istToday, istHour, addDays, slotHour24,
} from "@/lib/serviceConfig";

const TABS = {
  upcoming: ["pending", "confirmed", "assigned", "in_progress"],
  completed: ["completed"],
  cancelled: ["cancelled"],
};

export async function GET(req) {
  try {
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return j({ message: "unauthorized" }, 401);

    // unpaid holds older than 30 minutes are released
    await ServiceBooking.updateMany(
      { user: s.userId, status: "pending_payment", createdAt: { $lt: new Date(Date.now() - 30 * 60e3) } },
      { $set: { status: "cancelled", cancelledBy: "system", cancelReason: "payment_timeout" } }
    );

    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, parseInt(sp.get("page")) || 1);
    const limit = 8;
    const where = { user: s.userId };
    const tab = sp.get("tab");
    if (TABS[tab]) where.status = { $in: tab === "upcoming" ? [...TABS.upcoming, "pending_payment"] : TABS[tab] };
    const q = (sp.get("q") || "").trim().slice(0, 40);
    if (q) { const re = new RegExp(esc(q), "i"); where.$or = [{ code: re }, { providerName: re }, { categoryName: re }]; }

    const [rows, total, agg] = await Promise.all([
      ServiceBooking.find(where).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ServiceBooking.countDocuments(where),
      ServiceBooking.aggregate([{ $match: { user: new mongoose.Types.ObjectId(String(s.userId)) } }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    ]);
    const c = Object.fromEntries(agg.map((a) => [a._id, a.n]));
    const sum = (k) => k.reduce((t, x) => t + (c[x] || 0), 0);
    return j({
      bookings: rows.map(userBooking), total, page, pages: Math.max(1, Math.ceil(total / limit)),
      counts: {
        all: sum(Object.keys(c)),
        upcoming: sum([...TABS.upcoming, "pending_payment"]),
        completed: sum(TABS.completed),
        cancelled: sum(TABS.cancelled),
      },
    });
  } catch (e) {
    console.error("my bookings error", e);
    return j({ message: "something went wrong" }, 500);
  }
}

export async function POST(req) {
  try {
    await connectDb();
    const s = await isAuthenticated();
    if (!s.isAuth) return j({ message: "unauthorized" }, 401);

    const b = await req.json();
    const slotDate = str(b.slotDate, 10);
    const slotTime = str(b.slotTime, 10);
    const contactName = str(b.contactName, 60);
    const contactPhone = str(b.contactPhone, 10);
    const a = b.address || {};
    const address = { full: str(a.full, 200), landmark: str(a.landmark, 100), city: str(a.city, 40), pincode: str(a.pincode, 6) };

    if (!mongoose.isValidObjectId(b.providerId)) return j({ message: "invalid service" }, 400);
    const today = istToday();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(slotDate) || slotDate < today || slotDate > addDays(today, MAX_DAYS_AHEAD))
      return j({ message: "Choose a valid date" }, 400);
    if (!SLOTS.includes(slotTime)) return j({ message: "Choose a valid time slot" }, 400);
    if (slotDate === today && slotHour24(slotTime) <= istHour()) return j({ message: "This time slot has already passed" }, 400);
    if (contactName.length < 2) return j({ message: "Enter your name" }, 400);
    if (!/^[6-9]\d{9}$/.test(contactPhone)) return j({ message: "Enter a valid 10 digit mobile number" }, 400);
    if (address.full.length < 8) return j({ message: "Enter the full service address" }, 400);
    if (address.city.length < 2) return j({ message: "Enter the city" }, 400);
    if (!/^\d{6}$/.test(address.pincode)) return j({ message: "Enter a valid 6 digit PIN code" }, 400);

    const p = await ServiceProvider.findOne({ _id: b.providerId, isActive: true, deletedAt: null })
      .populate("category", "name isActive").lean();
    if (!p || !p.category?.isActive) return j({ message: "This service is not available" }, 404);

    await ServiceBooking.updateMany(
      { user: s.userId, status: "pending_payment", createdAt: { $lt: new Date(Date.now() - 30 * 60e3) } },
      { $set: { status: "cancelled", cancelledBy: "system", cancelReason: "payment_timeout" } }
    );

    // same details again (back button / double click) -> reuse the open booking
    const dup = await ServiceBooking.findOneAndUpdate(
      { user: s.userId, provider: p._id, slotDate, slotTime, status: "pending_payment" },
      { $set: { contactName, contactPhone, address } },
      { returnDocument: "after" }
    ).lean();
    if (dup) return j({ booking: userBooking(dup) });

    if ((await ServiceBooking.countDocuments({ user: s.userId, status: "pending_payment" })) >= 5)
      return j({ message: "Please complete or cancel your unpaid bookings first" }, 429);

    const taken = await ServiceBooking.countDocuments({ provider: p._id, slotDate, slotTime, status: { $in: ACTIVE } });
    if (taken >= SLOT_CAPACITY) return j({ message: "This slot is full. Please choose another time." }, 409);

    const money = calcTotal(p.startingPrice);
    let doc;
    for (let i = 0; i < 4 && !doc; i++) {
      try {
        doc = await ServiceBooking.create({
          code: `CE${crypto.randomInt(10000, 99999)}`,
          user: s.userId, provider: p._id, category: p.category._id,
          providerName: p.name, providerImage: p.image?.url || "", categoryName: p.category.name,
          slotDate, slotTime, contactName, contactPhone, address,
          ...money,
          history: [{ status: "created", byRole: "customer" }],
        });
      } catch (e) {
        if (e.code !== 11000) throw e; // booking code clash: try another one
      }
    }
    if (!doc) return j({ message: "Could not create the booking, try again" }, 500);
    return j({ booking: userBooking(doc.toObject()) });
  } catch (e) {
    console.error("service booking create error", e);
    return j({ message: "something went wrong" }, 500);
  }
}