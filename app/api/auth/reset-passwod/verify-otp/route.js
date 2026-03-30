import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";
import { zSchema } from "@/lib/zodSchema";


export async function POST(request) {
  try {
    await connectDB();
    const payload = await request.json()
    const validationSchema = zSchema.pick({
        otp: true, email: true
    })

    const validatedData = validationSchema.safeParse(payload)
    if(!validatedData.success){
        return response(false, 401, `Invalid or missing input field.`, 
        validatedData.error)
    }

    const {email, otp} = validatedData.data

    const getOtpData = await OTPModel.findOne({ email, otp })
    if(!getOtpData){
        return response(false, 404, `Invalid or expired otp.`)
    }

    const getUser = await UserModel.findOne({ deleteAt: null, email }).lean()
    if(!getUser){
        return response(false, 404, 'User not fount.')
    }

   
    // remove otp after validation
    await getOtpData.deleteOne()
    
    return response(true, 200, 'Otp verified.')

  } catch (error) {
    return catchError(error, "Otp verification failed.");
  }
}
