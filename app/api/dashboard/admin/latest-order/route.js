import { isAuthenticated } from "@/lib/authentication"
import { catchError, response } from "@/lib/helperfunction"
import connectDB from "@/lib/databaseConnection"
import OrderModel from "@/models/Order.model"

export async function GET() {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 401, "Unauthorized")
    }

    await connectDB()

    // Fetch latest 20 orders with populated product and variant media
    const latestOrder = await OrderModel.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "products.productId",
        select: "name",
      })
      .populate({
        path: "products.variantId",
        populate: {
          path: "media",
          select: "secure_url url path",
        },
      })
      .select("_id payment_id products status totalAmount")
      .lean()

    return response(true, 200, "Latest orders found.", latestOrder)
  } catch (error) {
    return catchError(error)
  }
}















// import { isAuthenticated } from "@/lib/authentication"
// import { catchError, response } from "@/lib/helperfunction"
// import connectDB from "@/lib/databaseConnection"
// import OrderModel from "@/models/Order.model"

// export async function GET() {
//   try {
//     const auth = await isAuthenticated("admin")
//     if (!auth.isAuth) {
//       return response(false, 401, "Unauthorized")
//     }

//     await connectDB()

//     const latestOrder = await OrderModel.find({
//       deletedAt: null,
//     })
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .select("_id payment_id products status totalAmount")
//       .lean()

//     return response(true, 200, "Latest orders found.", latestOrder)
//   } catch (error) {
//     return catchError(error)
//   }
// }
