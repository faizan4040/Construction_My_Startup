import { orderstatus } from "@/lib/utils";

// Allowed transitions — koi bhi API route isse bahar jump nahi kar sakta.
// Ye hi wo cheez hai jo "manual/hardcoded" status update ko replace karti hai.
export const ALLOWED_TRANSITIONS = {
  on_hold: ["pending", "cancelled"],
  pending: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["shipped", "cancelled"],
  shipped: ["delivered", "rto"],
  delivered: [],   // final
  rto: [],         // final
  cancelled: [],   // final
}

export function canTransition(currentStatus, nextStatus) {
  if (!orderstatus.includes(nextStatus)) return false
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false
}

// Every route calls this instead of directly mutating `item.status`.
// Throws if the transition is illegal — prevents bugs like
// "ready_to_ship -> pending" happening by accident.
export function applyTransition(item, nextStatus, changedBy, changedByUser = null, note = "") {
  if (!canTransition(item.status, nextStatus)) {
    const err = new Error(`Invalid transition: ${item.status} -> ${nextStatus}`)
    err.code = 400
    throw err
  }
  item.status = nextStatus
  item.statusHistory = item.statusHistory || []
  item.statusHistory.push({ status: nextStatus, changedBy, changedByUser, note, at: new Date() })

  if (nextStatus === "shipped") item.shippedAt = new Date()
  if (nextStatus === "delivered") item.deliveredAt = new Date()

  return item
}