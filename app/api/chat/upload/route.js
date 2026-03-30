
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isAuthenticated } from "@/lib/authentication";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request) {
  try {
    // Allow both users and admins to upload
    const auth = await isAuthenticated("user") || await isAuthenticated("admin");
    // ── if your isAuthenticated throws on failure, wrap individually:
    // const userAuth  = await isAuthenticated("user").catch(() => ({ isAuth: false }));
    // const adminAuth = await isAuthenticated("admin").catch(() => ({ isAuth: false }));
    // if (!userAuth.isAuth && !adminAuth.isAuth) { ... }

    const formData = await request.formData();
    const file     = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
    }

    // Size guard
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "File too large. Max size is 5 MB." },
        { status: 400 }
      );
    }

    // Allowed types
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "File type not allowed." },
        { status: 400 }
      );
    }

    // Convert to buffer → base64 for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    const base64      = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder:         "chat_uploads",
      resource_type:  "auto",        // handles images + raw files
      use_filename:   true,
      unique_filename: true,
    });

    return NextResponse.json({
      success:  true,
      fileUrl:  result.secure_url,
      fileName: file.name,
      fileType: file.type,
    });

  } catch (error) {
    console.error("❌ chat upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed." },
      { status: 500 }
    );
  }
}