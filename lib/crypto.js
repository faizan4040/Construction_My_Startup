import crypto from "crypto";

const key = () => {
  const k = process.env.BANK_ENC_KEY;
  if (!k || k.length !== 64) throw new Error("BANK_ENC_KEY must be 64 hex characters");
  return Buffer.from(k, "hex");
};

export const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(String(text), "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString("base64")).join(".");
};

export const decrypt = (payload) => {
  const [iv, tag, enc] = String(payload).split(".").map((s) => Buffer.from(s, "base64"));
  const d = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
};

export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const randomOtp = () => String(crypto.randomInt(0, 10000)).padStart(4, "0");