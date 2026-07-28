import { isAuthenticated } from "@/lib/authentication";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDb from "@/lib/databaseConnection";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/User.model";

// Required fields — must be uploaded before Continue is allowed
const REQUIRED_FIELDS = ["aadhaarFront", "aadhaarBack", "selfieImage"];

// Optional fields — saved only if provided
const OPTIONAL_FIELDS = [
  "addressProof",
  "experienceCertificate",
  "policeVerification",
];

// Same roles allowed as the labour step — user is still "customer"
// on first application, or "laber" if already onboarded once before
const ALLOWED_ROLES = ["customer", "laber"];

export async function POST(req) {
  try {
    await connectDb();

    const authResult = await isAuthenticated(ALLOWED_ROLES);
    if (!authResult.isAuth) {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }
    if (authResult.blocked) {
      return Response.json({ message: "account blocked" }, { status: 403 });
    }

    const user = await User.findById(authResult.userId);
    if (!user) {
      return Response.json({ message: "user not found" }, { status: 400 });
    }

    const formdata = await req.formData();

    const requiredFiles = {};
    for (const field of REQUIRED_FIELDS) {
      const file = formdata.get(field);
      if (!file) {
        return Response.json(
          { message: "Aadhaar (front & back) and a selfie are required" },
          { status: 400 }
        );
      }
      requiredFiles[field] = file;
    }

    const updatePayload = {
      status: "pending",
    };

    // Upload required files
    for (const [field, file] of Object.entries(requiredFiles)) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(
        buffer,
        `labour-docs/${user._id}`
      );
      if (!result?.url) {
        return Response.json(
          { message: `${field} upload failed` },
          { status: 500 }
        );
      }
      updatePayload[field] = result.url;
    }

    // Upload optional files only if provided
    for (const field of OPTIONAL_FIELDS) {
      const file = formdata.get(field);
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadToCloudinary(
          buffer,
          `labour-docs/${user._id}`
        );
        if (!result?.url) {
          return Response.json(
            { message: `${field} upload failed` },
            { status: 500 }
          );
        }
        updatePayload[field] = result.url;
      }
    }

    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: updatePayload },
      { upsert: true, new: true }
    );

    if (user.partnerOnBoardingSteps < 2) {
      user.partnerOnBoardingSteps = 2;
    } else {
      user.partnerOnBoardingSteps = 3;
    }
    user.partnerStatus = "pending";
    await user.save();

    return Response.json(partnerDocs, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `partner docs error ${error}` },
      { status: 500 }
    );
  }
}