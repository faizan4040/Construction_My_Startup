import { otpEmail } from "@/email/otpEmail";
import connectDB from "@/lib/databaseConnection";
import { catchError, generateOTP, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";

export async function POST(request) {
  try {
    await connectDB();

    const payload = await request.json();
    const validationSchema = zSchema.pick({ email: true });
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error);
    }

    const { email } = validatedData.data;

    const getUser = await UserModel.findOne({ email });
    if (!getUser) {
      return response(false, 404, "User not found");
    }

    // remove old otps
    await OTPModel.deleteMany({ email });

    // generate otp value
    const otp = generateOTP();

    // create otp document
    const newOtpData = new OTPModel({
      email,
      otp,
    });

    // save otp
    await newOtpData.save();

    // send email
    const otpSendStatus = await sendMail(
      "Your login verification code.",
      email,
      otpEmail(otp)
    );

    if (!otpSendStatus.success) {
      return response(false, 400, "Failed to resend otp.");
    }

    return response(true, 200, "OTP send successfully.");

  } catch (error) {
    return catchError(error);
  }
}











// import connectDB from "@/lib/databaseConnection";
// import { catchError, generateOTP, response } from "@/lib/helperfunction";
// import { sendMail } from "@/lib/sendMail";
// import { zSchema } from "@/lib/zodSchema";
// import OTPModel from "@/models/Otp.model";
// import UserModel from "@/models/User.model";

// export async function POST(request) {
//     try{
//         await connectDB()

//         const payload = await request.json()
//         const validationSchema = zSchema({ email: true })
//         const validatedData = validationSchema.safeParse(payload)
//         if(!validatedData.success){
//             return response(false, 401, 'Invalid or missing input field.', validatedData.error)
//         }

//         const { email } = validatedData.data

//         const getUser = await UserModel.findOne({ email })
//         if (!getUser){
//             return response(false, 404, 'User not found')
//         }

//         //remove old otps
//         await OTPModel.deleteMany({ email })
//         const otp = generateOTP = new OTPModel({
//             email, otp
//         })

//         await newOtpData.save()

//         const otpSendStatus = await sendMail('Your login verification code.', email, otpEmail(otp))
          
//         if(!otpSendStatus.success){
//             return response(false, 400, 'Failed to resend otp.')
//         }
//         return response(true, 200, 'OTP send successfully.')

//     } catch(error){
//       return catchError(error)
//     }
// }