// app/api/shopowner/media/upload/route.js

import { isAuthenticated } from "@/lib/authentication";
import cloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import MediaModel from "@/models/Media.model";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request) {
  let uploadedPublicIds = [];

  try {
    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return response(false, 400, "No files provided.");
    }

    const uploadedMedia = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return response(false, 400, `File type not allowed: ${file.type}. Use JPG, PNG, or WEBP.`);
      }

      if (file.size > MAX_SIZE_BYTES) {
        return response(false, 400, `File "${file.name}" exceeds 5 MB limit.`);
      }

      // Convert to base64 data URI
      const arrayBuffer = await file.arrayBuffer();
      const base64 = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64, {
        folder: "shop-owner/products",
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      });

      uploadedPublicIds.push(result.public_id);

      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      uploadedMedia.push({
        url: result.secure_url,
        public_id: result.public_id,
        alt: nameWithoutExt,
        title: nameWithoutExt,
        uploadedBy: auth.userId,
        deletedAt: null,
      });
    }

    const savedMedia = await MediaModel.insertMany(uploadedMedia);

    return response(true, 200, "Media uploaded successfully.", savedMedia);
  } catch (error) {
    // Rollback: delete any Cloudinary assets uploaded before the error
    if (uploadedPublicIds.length > 0) {
      try {
        await cloudinary.api.delete_resources(uploadedPublicIds);
      } catch (deleteError) {
        error.cloudinaryCleanup = deleteError.message;
      }
    }

    return catchError(error);
  }
}