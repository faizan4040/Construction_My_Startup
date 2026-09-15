import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { applyTransition } from "@/lib/orderStateMachine"
import { generateLabelCode } from "@/lib/labelGenerator"
import { getOrderStatusEmail } from "@/lib/email/orderStatusMail"
import { sendMail } from "@/lib/sendMail"
import { sendNotification, getNotificationContent } from "@/lib/notification"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import UserModel from "@/models/User.model"

export async function POST(request, { params }) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

    const order = await OrderModel.findOne({ order_id, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    const acceptedItems = []

    for (const item of order.products) {
      if (shopProductIds.some((id) => id.equals(item.productId)) && item.status === "pending") {
        applyTransition(item, "ready_to_ship", "shopowner", auth.userId)
        item.labelCode = generateLabelCode(order.order_id, item.productId)
        item.labelGeneratedAt = new Date()
        acceptedItems.push(item)
      }
    }

    if (acceptedItems.length === 0) return response(false, 400, "No items to accept.")

    // ── Stock decrement — happens ONLY here (on accept), never on order placement ──
    // Uses $inc so concurrent accepts across different orders don't overwrite each other.
    // NOTE: assuming ProductVariant has a `stock` field — confirm field name matches yours.
    for (const item of acceptedItems) {
      const updated = await ProductVariantModel.findOneAndUpdate(
        { _id: item.variantId, stock: { $gte: item.qty } }, // guard against negative stock
        { $inc: { stock: -item.qty } },
        { new: true }
      )
      if (!updated) {
        // Not enough stock — roll this item back instead of failing the whole request
        item.status = "pending"
        item.labelCode = null
        item.labelGeneratedAt = null
        item.statusHistory.pop()
        acceptedItems.splice(acceptedItems.indexOf(item), 1)
      }
    }

    if (acceptedItems.length === 0) {
      return response(false, 400, "Insufficient stock for all items.")
    }

    if (order.products.every((p) => p.status === "ready_to_ship" || p.status === "cancelled")) {
      applyTransition(order, "ready_to_ship", "shopowner", auth.userId)
    }

    await order.save()

    // ── Email ──
    const html = getOrderStatusEmail("ready_to_ship", order)
    if (html) await sendMail(order.email, "Order Update - ConstructEzy", html)

    // ── In-app notification ──
    // order.user hoga tabhi bhejenge (guest checkout me user null ho sakta hai)
    if (order.user) {
      const content = getNotificationContent("ready_to_ship", order)
      if (content) {
        await sendNotification({
          userId: order.user,
          ...content,
          orderMongoId: order._id,
          link: `/orders/${order.order_id}`, // customer-facing order tracking page
        })
      }
    }

    return response(true, 200, "Order accepted. Stock updated. Label generated.", order)
  } catch (error) {
    return catchError(error, "Failed to accept order.")
  }
}













// import { isAuthenticated } from "@/lib/authentication"
// import connectDB from "@/lib/databaseConnection"
// import { catchError, response } from "@/lib/helperfunction"
// import { applyTransition } from "@/lib/orderStateMachine"
// import { generateLabelCode } from "@/lib/labelGenerator"
// import { getOrderStatusEmail } from "@/lib/email/orderStatusMail"
// import { sendMail } from "@/lib/mail/sendMail"
// import OrderModel from "@/models/Order.model"
// import ProductModel from "@/models/Product.model"
// import ProductVariantModel from "@/models/ProductVariant.model"
// import UserModel from "@/models/User.model"

// export async function POST(request, { params }) {
//   try {
//     const auth = await isAuthenticated("shop owner")
//     if (!auth.isAuth) return response(false, 401, "Unauthorized.")

//     await connectDB()
//     const { order_id } = await params

//     const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
//     const shopProductIds = await ProductModel.find({ shop: user.shop, deletedAt: null }).distinct("_id")

//     const order = await OrderModel.findOne({ order_id, deleteAt: null })
//     if (!order) return response(false, 404, "Order not found.")

//     const acceptedItems = []

//     for (const item of order.products) {
//       if (shopProductIds.some((id) => id.equals(item.productId)) && item.status === "pending") {
//         applyTransition(item, "ready_to_ship", "shopowner", auth.userId)
//         item.labelCode = generateLabelCode(order.order_id, item.productId)
//         item.labelGeneratedAt = new Date()
//         acceptedItems.push(item)
//       }
//     }

//     if (acceptedItems.length === 0) return response(false, 400, "No items to accept.")

//     // ── Stock decrement — happens ONLY here (on accept), never on order placement ──
//     // Uses $inc so concurrent accepts across different orders don't overwrite each other.
//     // NOTE: assuming ProductVariant has a `stock` field — confirm field name matches yours.
//     for (const item of acceptedItems) {
//       const updated = await ProductVariantModel.findOneAndUpdate(
//         { _id: item.variantId, stock: { $gte: item.qty } }, // guard against negative stock
//         { $inc: { stock: -item.qty } },
//         { new: true }
//       )
//       if (!updated) {
//         // Not enough stock — roll this item back instead of failing the whole request
//         item.status = "pending"
//         item.labelCode = null
//         item.labelGeneratedAt = null
//         item.statusHistory.pop()
//         acceptedItems.splice(acceptedItems.indexOf(item), 1)
//       }
//     }

//     if (acceptedItems.length === 0) {
//       return response(false, 400, "Insufficient stock for all items.")
//     }

//     if (order.products.every((p) => p.status === "ready_to_ship" || p.status === "cancelled")) {
//       applyTransition(order, "ready_to_ship", "shopowner", auth.userId)
//     }

//     await order.save()

//     const html = getOrderStatusEmail("ready_to_ship", order)
//     if (html) await sendMail(order.email, "Order Update - ConstructEzy", html)

//     return response(true, 200, "Order accepted. Stock updated. Label generated.", order)
//   } catch (error) {
//     return catchError(error, "Failed to accept order.")
//   }
// }