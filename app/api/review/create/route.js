import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { zSchema } from "@/lib/zodSchema"
import ReviewModel from "@/models/Review.model"

export async function POST(request) {
  try {
    await connectDB()

    const payload = await request.json()

    const schema = zSchema.pick({
      productId: true,
      userId: true,
      rating: true,
      title: true,
      review: true,
    })

    const validate = schema.safeParse(payload)
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields.", validate.error)
    }

    const { productId, userId, rating, title, review } = validate.data

    // Save review
    const newReview = new ReviewModel({
      product: productId,
      user: userId,
      rating,
      title,
      review,
    })

    await newReview.save()

    return response(true, 200, "Your review submitted successfully.")
  } catch (error) {
    return catchError(error)
  }
}







// import { isAuthenticated } from "@/lib/authentication"
// import connectDB from "@/lib/databaseConnection"
// import { catchError, response } from "@/lib/helperfunction"
// import { zSchema } from "@/lib/zodSchema"
// import ReviewModel from "@/models/Review.model"

// export async function POST(request) {
//   try {
//     const auth = await isAuthenticated("user")
//     if (!auth.isAuth) {
//       return response(false, 403, "Unauthorized.")
//     }

//     await connectDB()

//     const payload = await request.json()

//     const schema = zSchema.pick({
//       productId: true,
//       userId: true,
//       rating: true,
//       title: true,
//       review: true,
//     })

//     const validate = schema.safeParse(payload)
//     if (!validate.success) {
//       return response(false, 400, "Invalid or missing fields.", validate.error)
//     }

//     const { productId, userId, rating, title, review } = validate.data

//     // Save review
//     const newReview = new ReviewModel({
//       product: productId, // mapping
//       user: userId,
//       rating,
//       title,
//       review,
//     })

//     await newReview.save()

//     return response(true, 200, "Your review submitted successfully.")
//   } catch (error) {
//     return catchError(error)
//   }
// }
