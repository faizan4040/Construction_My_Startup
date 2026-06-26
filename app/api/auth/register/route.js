// app/api/auth/register/route.js

import connectDB from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { emailVerificationLink } from "@/email/emailVerificationLink";
import { catchError, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import { z } from "zod";

/* ─── Allowed roles for self-registration (admin is excluded) ─── */
const ALLOWED_ROLES = ["customer", "shop owner", "laber", "delivery boy", "admin"];

export async function POST(request) {
  try {
    await connectDB();

    /* ── Validation Schema ── */
    const validationSchema = zSchema
      .pick({ name: true, email: true, password: true })
      .extend({
        role: z
          .string()
          .refine((r) => ALLOWED_ROLES.includes(r), {
            message: "Invalid role selected.",
          }),
      });

    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error);
    }

    const { name, email, password, role } = validatedData.data;


    // if (role === "admin") {
    //   return response(false, 403, "Admin registration is not allowed via this form.");
    // }

    /* ── Check if email is already registered ── */
    const existingUser = await UserModel.exists({ email });
    if (existingUser) {
      return response(false, 409, "User already registered with this email.");
    }

    /* ── Create new user ── */
    const newUser = new UserModel({ name, email, password, role });
    await newUser.save();

    /* ── Generate email-verification token ── */
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({ userId: newUser._id.toString() })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    /* ── Send verification email ── */
    await sendMail(
      "Email verification request from ConstructEzy",
      email,
      emailVerificationLink(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`
      )
    );

    return response(
      true,
      200,
      "Registration successful! Please verify your email address."
    );
  } catch (error) {
    return catchError(error);
  }
}



















// import connectDB from "@/lib/databaseConnection";
// import { zSchema } from "@/lib/zodSchema";
// import UserModel from "@/models/User.model";
// import { SignJWT } from "jose";
// import { emailVerificationLink } from "@/email/emailVerificationLink";
// import { catchError, response } from "@/lib/helperfunction";
// import { sendMail } from "@/lib/sendMail";


// export async function POST(request) {
//     try {
//         await connectDB();
//         // validation schema
//         const validationSchema = zSchema.pick({
//             name: true,
//             email: true,
//             password: true,
//         })

//         const payload = await request.json();

//         const validatedData = validationSchema.safeParse(payload);
        
//         if(!validatedData.success){
//             return response(false, 401, 'Invalid or missing input field.', 
//                 validatedData.error)
//         }

//           const {name, email, password} = validatedData.data;

//         // check already registered user
//           const checkUser = await UserModel.exists({email})
//           if(checkUser){
//             return response(true, 409, 'User already registered with this email.');
//           }

//           // new user creation
//           const NewRegistration = new UserModel({
//             name,
//             email,
//             password,
//           })

//           await NewRegistration.save();

//          const secret = new TextEncoder().encode(process.env.SECRET_KEY);
//          const token = await new SignJWT({ userId: NewRegistration._id.toString() })
//          .setIssuedAt()
//          .setExpirationTime("1h")
//          .setProtectedHeader({ alg: "HS256" })
//          .sign(secret);

//             await sendMail(
//             "Email verification request from ConstructEzy",
//             email, emailVerificationLink(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`));

//          return response(true, 200, 'Registration success, please verify your email address.');

//         } catch (error){
//            catchError(error)
//         }
// }


