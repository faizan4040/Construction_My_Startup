import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import connectDB from "@/lib/databaseConnection";
import UserModel from "@/models/User.model";

export const isAuthenticated = async (role) => {
  try {
    const cookieStore = await cookies()
    if (!cookieStore.has('access_token')) {
      return { isAuth: false }
    }

    const access_token = cookieStore.get('access_token')
    const { payload } = await jwtVerify(access_token.value, new TextEncoder().
    encode(process.env.SECRET_KEY))

    if (payload.role !== role) {
      return { isAuth: false }
    }

    // real-time block check for shop owners — this single check protects
    // every shopowner route (dashboard, product, orders, manual orders, etc.)
    // without touching any of those individual route files
    if (role === "shop owner") {
      await connectDB()
      const user = await UserModel.findById(payload._id).select('isBlocked deletedAt')
      if (!user || user.deletedAt || user.isBlocked) {
        return { isAuth: false, blocked: true }
      }
    }

    return {
      isAuth: true,
      userId: payload._id
    }

  } catch (error) {
    return {
      isAuth: false,
      error
    }
  }
}













// import { jwtVerify } from "jose";
// import { cookies } from "next/headers";


// export const isAuthenticated = async (role) => {
//   try{
//        const cookieStore = await cookies()
//        if (!cookieStore.has('access_token')){
//         return{
//           isAuth: false
//         }
//        }

//        const access_token = cookieStore.get('access_token')
//        const { payload } = await jwtVerify(access_token.value, new TextEncoder().
//        encode(process.env.SECRET_KEY))

//        if (payload.role !== role) {
//         return {
//           isAuth: false
//         }
//        }

//        return {
//         isAuth: true,
//         userId: payload._id
//        }
       

//   } catch(error){
//      return {
//         isAuth: false,
//         error
//      }
//   }
// }



















// import { jwtVerify } from "jose";
// import { cookies } from "next/headers";


// export const isAuthenticated = async (role) => {
//   try{
//        const cookieStore = await cookies()
//        if (!cookieStore.has('access_token')){
//         return{
//           isAuth: false
//         }
//        }

//        const access_token = cookieStore.get('access_token')
//        const { payload } = await jwtVerify(access_token.value, new TextEncoder().
//        encode(process.env.SECRET_KEY))

//        if (payload.role !== role) {
//         return {
//           isAuth: false
//         }
//        }

//        return {
//         isAuth: true,
//         // userId: payload._id
//         userId: payload.userId
//        }
       

//   } catch(error){
//      return {
//         isAuth: false,
//         error
//      }
//   }
// }