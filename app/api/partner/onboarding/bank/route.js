import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import PartnerBank from "@/models/PartnerBank.model";
import User from "@/models/User.model";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

// Same roles allowed as steps 1 & 2 — user is "customer" on first
// application, or "laber" once already onboarded
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

    const { accountHolder, accountNumber, upi, ifsc, mobileNumber } =
      await req.json();

    if (!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
      return Response.json(
        { message: "send all bank details" },
        { status: 400 }
      );
    }

    if (accountHolder.trim().length < 3) {
      return Response.json(
        { message: "account holder name is too short" },
        { status: 400 }
      );
    }

    if (accountNumber.trim().length < 9) {
      return Response.json(
        { message: "invalid account number" },
        { status: 400 }
      );
    }

    const sanitizedIfsc = ifsc.trim().toUpperCase();
    if (!IFSC_REGEX.test(sanitizedIfsc)) {
      return Response.json(
        { message: "invalid IFSC code" },
        { status: 400 }
      );
    }

    const sanitizedMobile = mobileNumber.trim();
    if (!PHONE_REGEX.test(sanitizedMobile)) {
      return Response.json(
        { message: "invalid mobile number" },
        { status: 400 }
      );
    }

    // Duplicate account number check — exclude own record
    const duplicate = await PartnerBank.findOne({
      accountNumber: accountNumber.trim(),
      owner: { $ne: user._id },
    });
    if (duplicate) {
      return Response.json(
        { message: "account number already registered with another partner" },
        { status: 400 }
      );
    }

    const partnerBank = await PartnerBank.findOneAndUpdate(
      { owner: user._id },
      {
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: sanitizedIfsc,
        upi: upi || "",
        status: "added",
      },
      { upsert: true, new: true }
    );

    // Reuse existing User.phone field instead of a non-existent mobileNumber field
    user.phone = sanitizedMobile;
    user.partnerOnBoardingSteps = 3;
    user.partnerStatus = "pending";
    await user.save();

    return Response.json(partnerBank, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `partner bank error ${error}` },
      { status: 500 }
    );
  }
}

export async function GET(req) {
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

    const partnerBank = await PartnerBank.findOne({ owner: user._id });
    if (partnerBank) {
      return Response.json(
        { mobileNumber: user.phone, partnerBank },
        { status: 200 }
      );
    } else {
      return Response.json(
        { message: "bank details not found" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `get partner bank error ${error}` },
      { status: 500 }
    );
  }
}