import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import "@/models/User.model";
import "@/models/Labour.model";
import { ADMIN_POPULATE, shapeAdminBooking } from "@/lib/adminBookingShape";
import { emitToAdmins } from "@/lib/socketEmit";

// only finished bookings can be deleted; active ones hold the
// one-active-booking-per-customer / per-labour unique indexes
const DELETABLE_STATUSES = ["completed", "cancelled", "rejected", "expired"];

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDb();

    const session = await isAuthenticated("admin");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    const b = await Booking.findById(id).populate(ADMIN_POPULATE).lean();
    if (!b || b.deletedAt) return NextResponse.json({ message: "not found" }, { status: 404 });

    return NextResponse.json({
      booking: {
        ...shapeAdminBooking(b),
        history: (b.history || []).map((h) => ({
          status: h.status,
          at: h.at,
          byRole: h.byRole || "",
          note: h.note || "",
        })),
      },
    });
  } catch (error) {
    console.error("admin booking detail error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "invalid" }, { status: 400 });
    await connectDb();

    const session = await isAuthenticated("admin");
    if (!session.isAuth) return NextResponse.json({ message: "unauthorized" }, { status: 401 });

    // the status check is part of the query, so a booking that became
    // active a moment ago can never be deleted by a stale click
    const deleted = await Booking.findOneAndUpdate(
      { _id: id, deletedAt: null, bookingStatus: { $in: DELETABLE_STATUSES } },
      { $set: { deletedAt: new Date(), deletedBy: session.userId } },
      { new: true }
    )
      .select("_id bookingStatus")
      .lean();

    if (!deleted) {
      const exists = await Booking.exists({ _id: id, deletedAt: null });
      if (!exists) return NextResponse.json({ message: "booking not found" }, { status: 404 });
      return NextResponse.json(
        { message: "only completed, rejected, cancelled or expired bookings can be deleted" },
        { status: 409 }
      );
    }

    // tell other open admin tabs to refresh; never fail the delete because of this
    try {
      await emitToAdmins("admin-booking-update", {
        bookingId: String(deleted._id),
        status: "deleted",
      });
    } catch (e) {
      console.error("admin delete emit error", e);
    }

    return NextResponse.json({ message: "booking deleted", id: String(deleted._id) }, { status: 200 });
  } catch (error) {
    console.error("admin booking delete error", error);
    return NextResponse.json({ message: "something went wrong" }, { status: 500 });
  }
}