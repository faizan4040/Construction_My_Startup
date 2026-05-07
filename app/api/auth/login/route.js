// app/api/auth/login/route.js

import { emailVerificationLink } from "@/email/emailVerificationLink";
import { otpEmail } from "@/email/otpEmail";
import connectDB from "@/lib/databaseConnection";
import { catchError, generateOTP, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { z } from "zod";

export async function POST(request) {
  try {
    await connectDB();

    /* ── Validate input ── */
    const validationSchema = zSchema.pick({ email: true }).extend({
      password: z.string().min(1, "Password is required."),
    });

    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error);
    }

    const { email, password } = validatedData.data;

    /* ── Find user (fix: deletedAt not deleteAt) ── */
    const getUser = await UserModel.findOne({
      email,
      deletedAt: null,   // ← fixed typo from original (was "deleteAt")
    }).select("+password isEmailVerified email name role");

    if (!getUser) {
      return response(false, 404, "Invalid login credentials.");
    }

    /* ── Resend email verification if not verified ── */
    if (!getUser.isEmailVerified) {
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const token = await new SignJWT({ userId: getUser._id.toString() })
        .setIssuedAt()
        .setExpirationTime("1h")
        .setProtectedHeader({ alg: "HS256" })
        .sign(secret);

      await sendMail(
        "Email verification request from BrandName",
        email,
        emailVerificationLink(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`
        )
      );

      return response(
        false,
        400,
        "Your email is not verified. A new verification link has been sent to your email."
      );
    }

    /* ── Verify password ── */
    const isPasswordValid = await getUser.comparePassword(password);
    if (!isPasswordValid) {
      return response(false, 400, "Invalid login credentials.");
    }

    /* ── Generate & store OTP ── */
    await OTPModel.deleteMany({ email }); // remove any old OTPs

    const otp = generateOTP();
    const newOtp = new OTPModel({ email, otp });
    await newOtp.save();

    /* ── Send OTP email ── */
    const emailStatus = await sendMail(
      "Your login verification code — BrandName",
      email,
      otpEmail(otp)
    );

    if (!emailStatus.success) {
      return response(false, 500, "Failed to send OTP. Please try again.");
    }

    return response(true, 200, "Please verify your device. Check your email for the OTP.");
  } catch (error) {
    return catchError(error);
  }
}





















// import { emailVerificationLink } from "@/email/emailVerificationLink"
// import { otpEmail } from "@/email/otpEmail"
// import connectDB from "@/lib/databaseConnection"
// import { catchError, generateOTP, response } from "@/lib/helperfunction"
// import { sendMail } from "@/lib/sendMail"
// import { zSchema } from "@/lib/zodSchema"
// import OTPModel from "@/models/Otp.model"
// import UserModel from "@/models/User.model"
// import { SignJWT } from "jose"
// import {z} from "zod"

// export async function POST(request){
//  try{
//     await connectDB()
//     const payload = await request.json()

//     const validationSchema = zSchema.pick({
//         email: true
//     }).extend({
//         password: z.string()
//     })

//     const validatedData = validationSchema.safeParse(payload)
//     if(!validatedData.success) {
//         return response(false, 401, 'Invalid or missing input field.', 
//         validatedData.error)
//     }

//     const {email, password} = validatedData.data
    
//     //get user data
//     const getUser = await UserModel.findOne({ deleteAt: null, email }).select("+password isEmailVerified email name role")
//     if(!getUser){
//         return response(false, 404, 'Invalid login credentials.')        
//     }

//     // resend email verification link
//         if(!getUser.isEmailVerified){
//         const secret = new TextEncoder().encode(process.env.SECRET_KEY);
//         const token = await new SignJWT({ userId: getUser._id.toString() })
//         .setIssuedAt()
//         .setExpirationTime("1h")
//         .setProtectedHeader({ alg: "HS256" })
//         .sign(secret);

//         await sendMail(
//         "Email verification request from ConstructEzy",
//         email, emailVerificationLink(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`));

//         return response(false, 400, 'Your email is not verified. We have send a verifation link to your registered email address.')
//         }


//     // password verification
//     const isPasswordVerified = await getUser.comparePassword(password)

//     if(!isPasswordVerified) {
//         return response(false, 400, 'Invalid login credentials.')
//     }

//     //otp generation
//     await OTPModel.deleteMany({ email })  //deleting old opts

//     const otp = generateOTP()

//     //storing otp into database
//     const newOtpData = new OTPModel({
//         email, otp
//     }) 

//     await newOtpData.save()
    
//     const otpEmailStatus = await sendMail('Your login verification code',
//         email, otpEmail(otp))
//         if (!otpEmailStatus.success) {
//             return response(false, 400, 'Failed to send OTP.')
//         }

//      return response(true, 200, 'Please verify your device.')
//  }  catch(error){
//     return catchError(error)
//  }
// }