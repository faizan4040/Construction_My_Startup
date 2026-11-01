import crypto from "crypto";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import { j } from "@/lib/serviceHelpers";

const isImage = (b) =>
  (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
  (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) ||
  (b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP");

export async function POST(req) {
  try {
    await connectDb();
    const a = await isAuthenticated("admin");
    if (!a.isAuth) return j({ message: "unauthorized" }, 401);

    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return j({ message: "No file" }, 400);
    if (file.size > 3 * 1024 * 1024) return j({ message: "Image must be under 3 MB" }, 400);
    if (!isImage(Buffer.from(await file.slice(0, 16).arrayBuffer()))) return j({ message: "Only JPG, PNG or WEBP images" }, 400);

    const ts = Math.floor(Date.now() / 1000);
    const folder = "constructezy/services";
    const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${ts}${process.env.CLOUDINARY_SECRET_KEY}`).digest("hex");
    const out = new FormData();
    out.append("file", file);
    out.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
    out.append("timestamp", String(ts));
    out.append("folder", folder);
    out.append("signature", signature);

    const r = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: out });
    const d = await r.json();
    if (!r.ok) return j({ message: d?.error?.message || "Upload failed" }, 502);
    return j({ url: d.secure_url, public_id: d.public_id });
  } catch (e) {
    console.error("service upload error", e);
    return j({ message: "Upload failed" }, 500);
  }
}