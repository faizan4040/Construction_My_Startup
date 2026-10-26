import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/databaseConnection";
import MaterialOrder from "@/models/MaterialOrder.model";
import { isAuthenticated } from "@/lib/authentication";
import { PHONE_REGEX } from "@/lib/sendSms";

const MAX_FILES = 10;

const fail = (status, message) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const files = Array.isArray(body.files) ? body.files : [];

    // 1) the phone must have passed OTP (signed token from /verify-otp)
    let payload;
    try {
      ({ payload } = await jwtVerify(
        String(body.verifiedToken || ""),
        new TextEncoder().encode(process.env.SECRET_KEY)
      ));
    } catch {
      return fail(401, "Phone verification expired. Please verify your number again.");
    }
    if (payload.purpose !== "material-order" || payload.phone !== phone) {
      return fail(401, "Phone verification does not match this number.");
    }

    // 2) validate fields
    if (name.length < 2 || name.length > 80) return fail(400, "Enter your full name.");
    if (!PHONE_REGEX.test(phone)) return fail(400, "Enter a valid 10-digit mobile number.");
    if (address.length < 8 || address.length > 500) return fail(400, "Enter your full delivery address.");
    if (files.length < 1 || files.length > MAX_FILES) {
      return fail(400, `Attach between 1 and ${MAX_FILES} files.`);
    }

    // 3) only accept files that really live in our Cloudinary account
    const allowedPrefix = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/`;
    const cleanFiles = [];
    for (const f of files) {
      const url = String(f?.url || "");
      if (!url.startsWith(allowedPrefix)) return fail(400, "One of the files is not valid. Please upload it again.");
      cleanFiles.push({
        url,
        publicId: String(f.publicId || ""),
        name: String(f.name || "").slice(0, 200),
        mimeType: String(f.mimeType || "").slice(0, 100),
        resourceType: String(f.resourceType || "image").slice(0, 20),
        bytes: Number(f.bytes) || 0,
      });
    }

    await connectDB();
    const auth = await isAuthenticated();

    const order = await MaterialOrder.create({
      user: auth?.isAuth ? auth.userId : null,
      name,
      phone,
      address,
      files: cleanFiles,
      status: "pending",
      phoneVerified: true,
    });

    return NextResponse.json({
      success: true,
      message: "We have received your material list.",
      data: { id: order._id.toString() },
    });
  } catch (error) {
    console.error("[material-orders POST]", error);
    return fail(500, "Something went wrong. Please try again.");
  }
}