import Razorpay from "razorpay";
import crypto from "crypto";
import { safeEqual } from "@/lib/crypto";

let client;
export const rzp = () =>
  (client ||= new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  }));

const hmac = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");

export const verifyPaymentSignature = (orderId, paymentId, sig) =>
  safeEqual(hmac(process.env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`), sig || "");

export const verifyWebhookSignature = (rawBody, sig) =>
  !!process.env.RAZORPAY_WEBHOOK_SECRET && safeEqual(hmac(process.env.RAZORPAY_WEBHOOK_SECRET, rawBody), sig || "");