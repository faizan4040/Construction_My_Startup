import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";
import PartnerDocs from "@/models/partnerDocs.model";
import PartnerBank from "@/models/PartnerBank.model";
import PayoutAccount from "@/models/PayoutAccount.model";
import Booking from "@/models/Booking.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import Ledger from "@/models/Ledger.model";
import Payout from "@/models/Payout.model";
import { getLabourWallet, recordDuesPayment } from "@/lib/finance";
import { emitToUser, emitToAdmins } from "@/lib/socketEmit";

const bad = (message, status = 400) => NextResponse.json({ message }, { status });
const LIVE_ACTIVE = ["requested", "confirmed", "arrived", "started", "work_completed"];
const mask = (v, keep = 4) => (v ? `${"•".repeat(Math.max(0, String(v).length - keep))}${String(v).slice(-keep)}` : "");

// ADMIN ONLY: full KYC + bank + money + job history of one labour
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return bad("invalid");
    await connectDb();
    if (!(await isAuthenticated("admin")).isAuth) return bad("unauthorized", 401);

    const user = await User.findOne({ _id: id, role: "laber" })
      .select("name email phone avatar address partnerStatus partnerOnBoardingSteps rejectionReason videoKycStatus videoKycRejectionReason isOnline isBlocked blockedAt blockReason deletedAt createdAt location locationUpdatedAt isEmailVerified")
      .lean();
    if (!user) return bad("labour not found", 404);

    const [profile, docs, bank, payoutAccount, wallet, liveJobs, serviceJobs, ledger, payouts, liveCounts, svcCounts] = await Promise.all([
      Labour.findOne({ owner: id }).lean(),
      PartnerDocs.findOne({ owner: id }).lean(),
      PartnerBank.findOne({ owner: id }).lean(),
      PayoutAccount.findOne({ user: id }).select("holderName last4 ifsc upiId status").lean(),
      getLabourWallet(id),
      Booking.find({ labour: id }).sort({ createdAt: -1 }).limit(10)
        .select("bookingStatus category fare paymentMethod paymentStatus workAddress createdAt startedAt completedAt closedAt labourAmount adminCommission").lean(),
      ServiceBooking.find({ assignedLabour: id }).sort({ createdAt: -1 }).limit(10)
        .select("code status assignStatus categoryName total paymentMethod paymentStatus slotDate slotTime address.city labourAmount adminCommission").lean(),
      Ledger.find({ ownerType: "labour", owner: id }).sort({ createdAt: -1 }).limit(20).select("type amount channel availableAt createdAt note").lean(),
      Payout.find({ owner: id }).sort({ createdAt: -1 }).limit(10).select("amount status utr createdAt").lean(),
      Booking.aggregate([{ $match: { labour: new mongoose.Types.ObjectId(id) } }, { $group: { _id: "$bookingStatus", n: { $sum: 1 } } }]),
      ServiceBooking.aggregate([{ $match: { assignedLabour: new mongoose.Types.ObjectId(id) } }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    ]);

    const c = user.location?.coordinates;
    const lc = Object.fromEntries(liveCounts.map((x) => [x._id, x.n]));
    const sc = Object.fromEntries(svcCounts.map((x) => [x._id, x.n]));
    return NextResponse.json(
      {
        user: {
          ...user,
          _id: String(user._id),
          location: c ? { lat: c[1], lon: c[0], at: user.locationUpdatedAt } : null,
        },
        profile,
        kyc: docs && {
          aadhaarNumber: docs.aadhaarNumber, aadhaarFront: docs.aadhaarFront, aadhaarBack: docs.aadhaarBack,
          selfieImage: docs.selfieImage, addressProof: docs.addressProof, experienceCertificate: docs.experienceCertificate,
          policeVerification: docs.policeVerification, status: docs.status, rejectionReason: docs.rejectionReason,
          verifiedAt: docs.verifiedAt, submittedAt: docs.createdAt,
        },
        bank: bank && {
          accountHolder: bank.accountHolder, bankName: bank.bankName, branchName: bank.branchName,
          accountNumber: mask(bank.accountNumber), ifsc: bank.ifsc, upi: bank.upi, status: bank.status, isVerified: bank.isVerified,
        },
        payoutAccount,
        wallet,
        stats: {
          liveCompleted: lc.completed || 0,
          liveCancelled: (lc.cancelled || 0) + (lc.rejected || 0) + (lc.expired || 0),
          serviceCompleted: sc.completed || 0,
          serviceActive: (sc.assigned || 0) + (sc.in_progress || 0),
          activeLive: LIVE_ACTIVE.reduce((t, k) => t + (lc[k] || 0), 0),
        },
        liveJobs,
        serviceJobs,
        ledger,
        payouts,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("admin partner detail error", error);
    return bad("something went wrong", 500);
  }
}

/*
  block      -> cannot log in / use any API, hidden from search, socket told to log out
  unblock    -> back to normal (stays OFF duty until the labour turns duty ON)
  kick       -> removed from the platform (soft delete). Pending requests released.
  restore    -> undo kick
  settle_dues-> admin received the commission in cash / bank transfer outside the app
*/
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return bad("invalid");
    await connectDb();
    const s = await isAuthenticated("admin");
    if (!s.isAuth) return bad("unauthorized", 401);

    const body = await req.json();
    const reason = String(body.reason || "").trim().slice(0, 200);
    const now = new Date();
    const user = await User.findOne({ _id: id, role: "laber" }).select("isBlocked deletedAt").lean();
    if (!user) return bad("labour not found", 404);

    if (["block", "kick"].includes(body.action)) {
      const running = await Booking.findOne({ labour: id, bookingStatus: { $in: ["confirmed", "arrived", "started", "work_completed"] } })
        .select("_id bookingStatus").lean();
      const svcRunning = await ServiceBooking.exists({ assignedLabour: id, status: "in_progress" });
      if ((running || svcRunning) && body.force !== true)
        return NextResponse.json({ message: "This labour has a job in progress. Confirm again to continue anyway.", needsForce: true }, { status: 409 });
      if (body.action === "block" && reason.length < 3) return bad("Enter a reason (the labour will see it)");
    }

    const releaseWork = async (why) => {
      // live requests waiting for this labour go away at once
      const reqs = await Booking.find({ labour: id, bookingStatus: "requested" }).select("user").lean();
      if (reqs.length) {
        await Booking.updateMany(
          { _id: { $in: reqs.map((r) => r._id) }, bookingStatus: "requested" },
          { $set: { bookingStatus: "rejected", cancelledBy: "admin", cancellationReason: why },
            $push: { history: { status: "rejected", at: now, byRole: "admin", note: why } } }
        );
        await Promise.all(reqs.map((r) => emitToUser(r.user, "reject-booking", { status: "rejected", reason: "unavailable" })));
      }
      // offered (not started) service jobs go back to the admin queue
      await ServiceBooking.updateMany(
        { assignedLabour: id, status: "assigned" },
        { $set: { status: "confirmed", assignStatus: "declined", assignedLabour: null, labourProfile: null, assignedName: "", assignedPhone: "", adminSeen: false },
          $push: { history: { status: "confirmed", at: now, byRole: "admin", note: `labour_${why}` } } }
      );
    };

    switch (body.action) {
      case "block":
        await User.updateOne({ _id: id }, { $set: { isBlocked: true, blockedAt: now, blockReason: reason, isOnline: false } });
        await Labour.updateOne({ owner: id }, { $set: { availability: "offline" } });
        await releaseWork("blocked");
        await emitToUser(id, "account-status", { status: "blocked", reason });
        break;
      case "unblock":
        await User.updateOne({ _id: id }, { $set: { isBlocked: false, blockedAt: null, blockReason: "" } });
        await emitToUser(id, "account-status", { status: "active" });
        break;
      case "kick":
        await User.updateOne({ _id: id }, { $set: { deletedAt: now, isBlocked: true, blockedAt: now, blockReason: reason || "removed by admin", isOnline: false } });
        await Labour.updateOne({ owner: id }, { $set: { isActive: false, availability: "offline" } });
        await releaseWork("removed");
        await emitToUser(id, "account-status", { status: "removed", reason });
        break;
      case "restore":
        await User.updateOne({ _id: id }, { $set: { deletedAt: null, isBlocked: false, blockedAt: null, blockReason: "" } });
        await Labour.updateOne({ owner: id }, { $set: { isActive: true } });
        break;
      case "settle_dues": {
        const w = await getLabourWallet(id);
        const amount = Math.floor(Number(body.amount));
        if (w.dues <= 0) return bad("This labour has no dues");
        if (!Number.isFinite(amount) || amount < 1 || amount > w.dues) return bad(`Amount must be between ₹1 and ₹${w.dues}`);
        await recordDuesPayment({
          labourId: id, amount, channel: "manual", by: s.userId,
          paymentId: `manual_${id}_${crypto.randomUUID()}`, note: reason || "settled by admin",
        });
        break;
      }
      default:
        return bad("invalid action");
    }

    await emitToAdmins("admin-booking-update", { kind: "labour", labourId: String(id), status: body.action });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("admin partner action error", error);
    return bad("something went wrong", 500);
  }
}
