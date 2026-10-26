import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import MaterialOrder from "@/models/MaterialOrder.model";
import { isAuthenticated } from "@/lib/authentication";
import { PHONE_REGEX } from "@/lib/sendSms";

const STATUSES = ["pending", "delivered", "cancelled"];

const fail = (status, message) =>
  NextResponse.json({ success: false, message }, { status });

async function guard(params) {
  const auth = await isAuthenticated("admin");
  if (!auth?.isAuth) return { error: fail(401, "Unauthorized") };
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return { error: fail(400, "Invalid order id.") };
  await connectDB();
  return { id };
}

export async function PATCH(request, { params }) {
  try {
    const g = await guard(params);
    if (g.error) return g.error;

    const body = await request.json().catch(() => ({}));
    const update = {};

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) return fail(400, "Invalid status.");
      update.status = body.status;
    }
    if (body.name !== undefined) {
      const v = String(body.name).trim();
      if (v.length < 2 || v.length > 80) return fail(400, "Enter a valid name.");
      update.name = v;
    }
    if (body.phone !== undefined) {
      const v = String(body.phone).trim();
      if (!PHONE_REGEX.test(v)) return fail(400, "Enter a valid 10-digit mobile number.");
      update.phone = v;
    }
    if (body.address !== undefined) {
      const v = String(body.address).trim();
      if (v.length < 8 || v.length > 500) return fail(400, "Enter a valid address.");
      update.address = v;
    }
    if (body.adminNote !== undefined) {
      update.adminNote = String(body.adminNote).trim().slice(0, 1000);
    }
    if (!Object.keys(update).length) return fail(400, "Nothing to update.");

    const order = await MaterialOrder.findByIdAndUpdate(g.id, { $set: update }, { new: true })
      .populate("user", "name email")
      .lean();
    if (!order) return fail(404, "Order not found.");

    return NextResponse.json({ success: true, message: "Order updated.", data: order });
  } catch (error) {
    console.error("[admin material-orders PATCH]", error);
    return fail(500, "Could not update the order.");
  }
}

export async function DELETE(_request, { params }) {
  try {
    const g = await guard(params);
    if (g.error) return g.error;

    const order = await MaterialOrder.findByIdAndDelete(g.id).lean();
    if (!order) return fail(404, "Order not found.");

    return NextResponse.json({ success: true, message: "Order deleted." });
  } catch (error) {
    console.error("[admin material-orders DELETE]", error);
    return fail(500, "Could not delete the order.");
  }
}