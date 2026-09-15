import NotificationModel from "@/models/Notification.model"

// Ek jagah se notification create karo — email ki tarah ye bhi
// order-status routes se hi call hogi, alag se manual trigger nahi.
export async function sendNotification({ userId, title, message, type = "order_status", orderMongoId = null, link = null }) {
  if (!userId) return null
  try {
    return await NotificationModel.create({
      user: userId,
      title,
      message,
      type,
      order: orderMongoId,
      link,
    })
  } catch (error) {
    // Notification fail hone se poora order-transition fail nahi hona chahiye
    console.error("Notification create failed:", error.message)
    return null
  }
}

// Order status ke hisaab se title/message templates — email wale
// orderStatusMail.js jaisa hi pattern, taaki dono sync me rahein
const NOTIF_TEMPLATES = {
  pending: (order) => ({
    title: "Order Picked Up",
    message: `Order ${order.order_id} has been picked up and is pending your confirmation.`,
  }),
  ready_to_ship: (order) => ({
    title: "Order Ready to Ship",
    message: `Order ${order.order_id} is packed and ready to ship.`,
  }),
  shipped: (order) => ({
    title: "Order Shipped",
    message: `Order ${order.order_id} has been shipped.`,
  }),
  delivered: (order) => ({
    title: "Order Delivered",
    message: `Order ${order.order_id} has been delivered successfully.`,
  }),
  cancelled: (order) => ({
    title: "Order Cancelled",
    message: `Order ${order.order_id} has been cancelled.`,
  }),
}

export function getNotificationContent(status, order) {
  const builder = NOTIF_TEMPLATES[status]
  return builder ? builder(order) : null
}