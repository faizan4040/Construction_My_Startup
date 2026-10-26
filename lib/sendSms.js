import crypto from "crypto";

export const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile

export const hashOtp = (phone, otp) =>
  crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(`${phone}:${otp}`)
    .digest("hex");

export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/**
 * SMS_PROVIDER in .env:
 *   dev        -> prints the code in the server console (local testing only, blocked in production)
 *   fast2sms   -> needs FAST2SMS_API_KEY
 *   2factor    -> needs TWOFACTOR_API_KEY
 */
export async function sendOtpSms(phone, otp) {
  const provider = (process.env.SMS_PROVIDER || "dev").toLowerCase();

  if (provider === "fast2sms") {
    const url = new URL("https://www.fast2sms.com/dev/bulkV2");
    url.searchParams.set("authorization", process.env.FAST2SMS_API_KEY || "");
    url.searchParams.set("route", "otp");
    url.searchParams.set("variables_values", otp);
    url.searchParams.set("numbers", phone);
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.return === false) {
      throw new Error(`Fast2SMS: ${JSON.stringify(data.message || data)}`);
    }
    return { dev: false };
  }

  if (provider === "2factor") {
    const res = await fetch(
      `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${phone}/${otp}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (data.Status !== "Success") throw new Error(`2Factor: ${data.Details || "failed"}`);
    return { dev: false };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SMS_PROVIDER is not configured for production.");
  }
  console.log(`[material-order otp] +91${phone} -> ${otp}`);
  return { dev: true };
}