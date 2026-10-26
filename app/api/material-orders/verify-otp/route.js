import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import connectDB from "@/lib/databaseConnection";
import PhoneOtp from "@/models/PhoneOtp.model";
import { PHONE_REGEX, hashOtp, safeEqual } from "@/lib/sendSms";

const MAX_ATTEMPTS = 5;

const fail = (status, message) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = String(body.phone || "").trim();
    const otp = String(body.otp || "").trim();

    if (!PHONE_REGEX.test(phone) || !/^\d{6}$/.test(otp)) {
      return fail(400, "Enter the 6-digit code.");
    }

    await connectDB();
    const rec = await PhoneOtp.findOne({ phone });

    if (!rec || !rec.otpHash || rec.otpExpiresAt.getTime() < Date.now()) {
      return fail(400, "This code has expired. Request a new one.");
    }
    if (rec.attempts >= MAX_ATTEMPTS) {
      return fail(429, "Too many wrong attempts. Request a new code.");
    }

    if (!safeEqual(hashOtp(phone, otp), rec.otpHash)) {
      rec.attempts += 1;
      await rec.save();
      const left = MAX_ATTEMPTS - rec.attempts;
      return fail(400, left > 0 ? `Wrong code. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong attempts. Request a new code.");
    }

    // consume the code but keep the doc so the resend rate-limit window survives
    rec.otpHash = "";
    rec.otpExpiresAt = new Date(0);
    await rec.save();

    const token = await new SignJWT({ phone, purpose: "material-order" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("20m")
      .sign(new TextEncoder().encode(process.env.SECRET_KEY));

    return NextResponse.json({ success: true, message: "Phone verified.", data: { token } });
  } catch (error) {
    console.error("[verify-otp]", error);
    return fail(500, "Something went wrong. Please try again.");
  }
}