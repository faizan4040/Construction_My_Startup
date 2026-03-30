import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import UserModel from "@/models/User.model";
import { jwtVerify } from "jose";
import { isValidObjectId } from "mongoose";

export async function POST(request) {
  try {
    await connectDB();

    const { token } = await request.json();

    if (!token) {
      return response(false, 400, "Invalid or missing token.");
    }

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const decoded = await jwtVerify(token, secret)
    const userId = decoded.payload.userId

    if (!isValidObjectId(userId)) {
      return response(false, 400, "Invalid user id.", userId);
    }

    // get user
    const user = await UserModel.findById(userId);
    if (!user) {
      return response(false, 404, "User not found.");
    }

    if (user.isEmailVerified) {
      return response(true, 200, "Email already verified.");
    }

    user.isEmailVerified = true;
    await user.save();

    return response(true, 200, "Email verified successfully.");
    
  } catch (error) {
    return catchError(error, "Email verification failed.");
  }
}
