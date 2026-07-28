import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import User from "@/models/User.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const authResult = await isAuthenticated();
    if (!authResult.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 400 });
    }

    const user = await User.findById(authResult.userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 400 });
    }

    const freshUserData = {
      _id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      partnerOnBoardingSteps: user.partnerOnBoardingSteps,
      partnerStatus: user.partnerStatus,
      rejectionReason: user.rejectionReason,
      videoKycStatus: user.videoKycStatus,
      videoKycRoomId: user.videoKycRoomId,
      videoKycRejectionReason: user.videoKycRejectionReason,
    };

    return NextResponse.json(freshUserData, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "fetch current user error" },
      { status: 500 }
    );
  }
}