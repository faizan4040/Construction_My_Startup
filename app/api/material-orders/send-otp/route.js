import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import PhoneOtp from "@/models/PhoneOtp.model";
import { PHONE_REGEX, hashOtp, sendOtpSms } from "@/lib/sendSms";

const RESEND_GAP_MS = 30 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;

const fail = (status, message, extra = {}) =>
  NextResponse.json({ success: false, message, ...extra }, { status });

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = String(body.phone || "").trim();
    if (!PHONE_REGEX.test(phone)) {
      return fail(400, "Enter a valid 10-digit mobile number.");
    }

    await connectDB();
    const now = Date.now();
    let rec = await PhoneOtp.findOne({ phone });

    if (rec) {
      const wait = RESEND_GAP_MS - (now - rec.lastSentAt.getTime());
      if (wait > 0) {
        return fail(429, `Please wait ${Math.ceil(wait / 1000)} seconds before asking for a new code.`, {
          retryAfter: Math.ceil(wait / 1000),
        });
      }
      if (now - rec.windowStart.getTime() > WINDOW_MS) {
        rec.windowStart = new Date(now);
        rec.sendCount = 0;
      }
      if (rec.sendCount >= MAX_SENDS_PER_WINDOW) {
        return fail(429, "Too many codes requested. Try again in an hour.");
      }
    } else {
      rec = new PhoneOtp({ phone, windowStart: new Date(now), sendCount: 0 });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    rec.otpHash = hashOtp(phone, otp);
    rec.otpExpiresAt = new Date(now + OTP_TTL_MS);
    rec.attempts = 0;
    rec.sendCount += 1;
    rec.lastSentAt = new Date(now);
    rec.expiresAt = new Date(rec.windowStart.getTime() + WINDOW_MS + OTP_TTL_MS);
    await rec.save();

    let result;
    try {
      result = await sendOtpSms(phone, otp);
    } catch (e) {
      console.error("[send-otp] SMS failed:", e.message);
      return fail(502, "We could not send the code right now. Please try again in a minute.");
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
      data: {
        resendIn: RESEND_GAP_MS / 1000,
        // only ever returned when SMS_PROVIDER=dev outside production
        ...(result?.dev && process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
      },
    });
  } catch (error) {
    console.error("[send-otp]", error);
    return fail(500, "Something went wrong. Please try again.");
  }
}