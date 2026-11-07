import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import Payout from "@/models/Payout.model";
import { getPlatformSummary, getLabourPayable } from "@/lib/finance";
import { calcSplit } from "@/lib/commission";
import { getSettings } from "@/lib/settings";

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const LIVE_ACTIVE = ["requested", "confirmed", "arrived", "started", "work_completed"];
const CAT = {
  helpers: "Helper", masons: "Mason", electricians: "Electrician", plumbers: "Plumber", carpenters: "Carpenter",
  painters: "Painter", "tile-experts": "Tile Expert", welders: "Welder", "jcb-operators": "JCB Operator",
  contractors: "Contractor", engineers: "Engineer",
};

// progress steps shown in the admin table (index of the last step reached)
const LIVE_STEPS = ["Booked", "Accepted", "Arrived", "Started", "Finished", "Paid"];
const liveStep = (b) => ({ requested: 0, confirmed: 1, arrived: 2, started: 3, work_completed: 4, completed: 5 }[b.bookingStatus] ?? 0);
const SVC_STEPS = ["Booked", "Assigned", "Started", "Finished", "Paid"];
const svcStep = (b) => {
  if (b.status === "completed") return 4;
  if (b.status === "in_progress") return 2;
  if (b.status === "assigned" && b.assignStatus === "accepted") return 1;
  return 0;
};

const TAB_LIVE = {
  live: { bookingStatus: { $in: LIVE_ACTIVE } },
  upcoming: null,
  unassigned: null,
  completed: { bookingStatus: "completed" },
  payment_due: { bookingStatus: { $in: ["confirmed", "arrived", "started", "work_completed"] }, paymentStatus: "pending" },
  cancelled: { bookingStatus: { $in: ["cancelled", "rejected", "expired"] } },
  all: {},
};
const TAB_SVC = {
  live: { status: "in_progress" },
  upcoming: { status: "assigned" },
  unassigned: { status: { $in: ["pending", "confirmed"] } },
  completed: { status: "completed" },
  payment_due: { status: { $in: ["pending", "confirmed", "assigned", "in_progress"] }, paymentStatus: { $in: ["cod", "pending"] } },
  cancelled: { status: "cancelled" },
  all: { status: { $ne: "pending_payment" } },
};

export async function GET(req) {
  try {
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const sp = new URL(req.url).searchParams;
    const tab = TAB_SVC[sp.get("tab")] ? sp.get("tab") : "live";
    const kind = ["live", "service"].includes(sp.get("kind")) ? sp.get("kind") : "all";
    const q = (sp.get("q") || "").trim().slice(0, 60);
    const LIMIT = 80;
    const settings = await getSettings();

    // ---- search: booking code / phone / customer / labour name ----
    let liveSearch = {}, svcSearch = {};
    if (q) {
      const re = new RegExp(esc(q), "i");
      const [labUsers, custUsers] = await Promise.all([
        Labour.find({ $or: [{ fullName: re }, { phone: re }] }).distinct("owner"),
        User.find({ $or: [{ name: re }, { phone: re }, { email: re }] }).select("_id").limit(200).lean()
          .then((r) => r.map((u) => u._id)),
      ]);
      const idLike = /^[a-f\d]{6,24}$/i.test(q) ? [{ $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: esc(q), options: "i" } } }] : [];
      liveSearch = { $or: [{ labour: { $in: labUsers } }, { user: { $in: custUsers } }, { userMobileNumber: re }, { workAddress: re }, ...idLike] };
      svcSearch = { $or: [{ code: re }, { contactName: re }, { contactPhone: re }, { assignedName: re }, { providerName: re }, { "address.full": re }, { assignedLabour: { $in: labUsers } }] };
    }

    const wantLive = kind !== "service" && TAB_LIVE[tab] !== null;
    const wantSvc = kind !== "live";
    const [live, svc] = await Promise.all([
      wantLive
        ? Booking.find({ ...TAB_LIVE[tab], ...liveSearch }).sort({ createdAt: -1 }).limit(LIMIT)
            .populate("user", "name phone").populate("labour", "name phone isOnline").populate("labourProfile", "fullName phone profileImage")
            .lean()
        : [],
      wantSvc ? ServiceBooking.find({ ...TAB_SVC[tab], ...svcSearch }).sort({ createdAt: -1 }).limit(LIMIT).lean() : [],
    ]);

    const rows = [
      ...live.map((b) => {
        const done = b.bookingStatus === "completed";
        const split = done && b.labourAmount + b.adminCommission === b.fare
          ? { labourAmount: b.labourAmount, commission: b.adminCommission }
          : calcSplit(b.fare, settings.labourCommissionPercent);
        return {
          kind: "live",
          _id: String(b._id),
          code: `LV${String(b._id).slice(-6).toUpperCase()}`,
          title: CAT[b.category] || b.category,
          when: b.createdAt,
          whenLabel: b.bookingType === "scheduled" && b.scheduledFor ? b.scheduledFor : b.createdAt,
          customer: { name: b.user?.name || "Customer", phone: b.userMobileNumber || b.user?.phone || "" },
          site: [b.siteDetails, b.workAddress].filter(Boolean).join(", "),
          coordinates: b.workLocation?.coordinates || null,
          labour: { id: String(b.labour?._id || b.labour || ""), name: b.labourProfile?.fullName || b.labour?.name || "—",
            phone: b.labourProfile?.phone || b.labour?.phone || "", photo: b.labourProfile?.profileImage || "", online: !!b.labour?.isOnline },
          status: b.bookingStatus,
          steps: LIVE_STEPS,
          step: liveStep(b),
          dead: ["cancelled", "rejected", "expired"].includes(b.bookingStatus),
          money: { total: b.fare, method: b.paymentMethod || "", paymentStatus: b.paymentStatus,
            labour: split.labourAmount, company: split.commission, projected: !done },
          startedAt: b.startedAt, completedAt: b.completedAt, workMinutes: b.workDurationMinutes ?? null,
          cancelReason: b.cancellationReason || "",
          trackable: ["confirmed", "arrived", "started"].includes(b.bookingStatus),
        };
      }),
      ...svc.map((b) => {
        const done = b.status === "completed";
        const pct = settings.serviceCommissionPercent;
        const cut = Math.round((b.price * pct) / 100);
        const projected = { labourAmount: b.price - cut, commission: b.total - (b.price - cut) };
        return {
          kind: "service",
          _id: String(b._id),
          code: b.code,
          title: b.categoryName,
          subtitle: b.providerName,
          when: b.createdAt,
          slotDate: b.slotDate,
          slotTime: b.slotTime,
          customer: { name: b.contactName, phone: b.contactPhone },
          site: [b.address?.full, b.address?.landmark, b.address?.city].filter(Boolean).join(", "),
          labour: b.assignedName
            ? { id: String(b.assignedLabour || ""), name: b.assignedName, phone: b.assignedPhone || "", registered: !!b.assignedLabour, assignStatus: b.assignStatus }
            : null,
          status: b.status,
          assignStatus: b.assignStatus || "",
          steps: SVC_STEPS,
          step: svcStep(b),
          dead: b.status === "cancelled",
          paid: b.paymentStatus === "paid",
          money: { total: b.total, price: b.price, fee: b.fee, method: b.paymentMethod || "", paymentStatus: b.paymentStatus,
            labour: done ? b.labourAmount : projected.labourAmount, company: done ? b.adminCommission : projected.commission, projected: !done },
          startedAt: b.startedAt, completedAt: b.completedAt,
          cancelReason: b.cancelReason || "",
          adminSeen: !!b.adminSeen,
        };
      }),
    ].sort((a, b) => new Date(b.when) - new Date(a.when)).slice(0, LIMIT);

    // ---- KPI cards + tab counters ----
    const [liveCounts, svcCounts, platform, labour, pendingPayouts] = await Promise.all([
      Booking.aggregate([{ $group: { _id: "$bookingStatus", n: { $sum: 1 } } }]),
      ServiceBooking.aggregate([{ $match: { status: { $ne: "pending_payment" } } }, { $group: { _id: { s: "$status", p: "$paymentStatus" }, n: { $sum: 1 } } }]),
      getPlatformSummary(),
      getLabourPayable(),
      Payout.aggregate([{ $match: { ownerType: "labour", status: { $in: ["requested", "approved"] } } }, { $group: { _id: null, n: { $sum: 1 }, amt: { $sum: "$amount" } } }]),
    ]);
    const L = Object.fromEntries(liveCounts.map((x) => [x._id, x.n]));
    const S = {};
    let svcPayDue = 0;
    for (const x of svcCounts) {
      S[x._id.s] = (S[x._id.s] || 0) + x.n;
      if (["pending", "confirmed", "assigned", "in_progress"].includes(x._id.s) && ["cod", "pending"].includes(x._id.p)) svcPayDue += x.n;
    }
    const sum = (o, keys) => keys.reduce((t, k) => t + (o[k] || 0), 0);
    const livePayDue = await Booking.countDocuments(TAB_LIVE.payment_due);

    return NextResponse.json(
      {
        rows,
        tab,
        counts: {
          live: sum(L, LIVE_ACTIVE) + (S.in_progress || 0),
          upcoming: S.assigned || 0,
          unassigned: sum(S, ["pending", "confirmed"]),
          completed: (L.completed || 0) + (S.completed || 0),
          payment_due: livePayDue + svcPayDue,
          cancelled: sum(L, ["cancelled", "rejected", "expired"]) + (S.cancelled || 0),
          all: Object.values(L).reduce((t, n) => t + n, 0) + Object.values(S).reduce((t, n) => t + n, 0),
        },
        kpi: {
          inProgress: (L.started || 0) + (S.in_progress || 0),
          enRoute: (L.confirmed || 0) + (L.arrived || 0),
          upcoming: S.assigned || 0,
          unassigned: sum(S, ["pending", "confirmed"]),
          cashDues: platform.cashDuesOutstanding,
          laboursOwing: labour.laboursOwing,
          labourPayable: labour.payable,
          labourOnHold: labour.pendingHold,
          pendingWithdrawals: pendingPayouts[0]?.n || 0,
          pendingWithdrawAmount: pendingPayouts[0]?.amt || 0,
          companyAvailable: platform.available,
          companyTotal: platform.totalEarned,
        },
        platform,
        settings,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("admin labour jobs error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}
