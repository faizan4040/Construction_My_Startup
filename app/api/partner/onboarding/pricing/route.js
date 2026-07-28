import { isAuthenticated } from "@/lib/authentication";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";
import Labour from "@/models/Labour.model";

export async function POST(req) {
  try {
    await connectDb();

    const { isAuth, userId } = await isAuthenticated();
    if (!isAuth) {
      return Response.json({ message: "unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "laber") {
      return Response.json({ message: "labour not found" }, { status: 404 });
    }

    // FIX: pricing/rate fields (rateType, pricePerHour, pricePerDay,
    // profileImage) live on the Labour model, not on User — the old
    // version was writing to `User` fields that don't exist in the
    // schema, so nothing actually persisted.
    const labour = await Labour.findOne({ owner: userId });
    if (!labour) {
      return Response.json(
        { message: "labour profile not found, complete earlier steps first" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image");
    const rateType = formData.get("rateType");
    const pricePerHour = formData.get("pricePerHour");
    const pricePerDay = formData.get("pricePerDay");

    let updated = false;

    // FIX: uploadToCloudinary is the correct named export (the old code
    // imported a non-existent `uploadOnCloudinary` default export, which
    // resolved to the cloudinary config object — not a function).
    // It also expects a Buffer, so the File from formData must be
    // converted first.
    if (image && image.size > 0) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadToCloudinary(buffer, "labour-profiles");
      labour.profileImage = result.url;
      updated = true;
    }

    if (rateType) {
      labour.rateType = rateType; // "hour" | "day" | "both"
      updated = true;
    }

    // Only set the price fields that are relevant to the chosen rateType,
    // mirroring the schema's conditional `required` logic
    if (
      (rateType === "hour" || rateType === "both" || labour.rateType === "hour" || labour.rateType === "both") &&
      pricePerHour !== null &&
      pricePerHour !== ""
    ) {
      labour.pricePerHour = Number(pricePerHour);
      updated = true;
    }

    if (
      (rateType === "day" || rateType === "both" || labour.rateType === "day" || labour.rateType === "both") &&
      pricePerDay !== null &&
      pricePerDay !== ""
    ) {
      labour.pricePerDay = Number(pricePerDay);
      updated = true;
    }

    if (!updated) {
      return Response.json({ message: "Nothing to update" }, { status: 400 });
    }

    // Pricing submission goes into review — this Labour doc's own
    // `status` field (not User.partnerStatus) drives step 6/7 review UI
    labour.status = "pending";
    await labour.save();

    // Advance the user's onboarding step now that pricing is submitted
    user.partnerOnBoardingSteps = 6;
    await user.save();

    return Response.json({ message: "pricing submitted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `pricing error ${error}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDb();

    const { isAuth, userId } = await isAuthenticated();
    if (!isAuth) {
      return Response.json({ message: "unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "laber") {
      return Response.json({ message: "labour not found" }, { status: 404 });
    }

    const labour = await Labour.findOne({ owner: userId });
    if (!labour) {
      return Response.json(
        { message: "labour profile not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        rateType: labour.rateType,
        pricePerHour: labour.pricePerHour,
        pricePerDay: labour.pricePerDay,
        profileImage: labour.profileImage,
        status: labour.status,
        rejectionReason: labour.rejectionReason,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: "labour pricing get error" },
      { status: 500 }
    );
  }
}