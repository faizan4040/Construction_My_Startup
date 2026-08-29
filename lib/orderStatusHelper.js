/**
 * Ek hi, unified overall order status nikalta hai saare products ke
 * individual status se — chahe update admin ne kiya ho ya shopowner ne.
 *
 * Actual `orderstatus` enum (lib/utils.js):
 *   ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'unverified']
 *
 * Isme 'cancelled' aur 'unverified' normal progress-flow ka hissa nahi hain —
 * ye "exception" states hain, isliye inka apna alag, EXPLICIT progress-rank
 * define kiya gaya hai (raw array position pe depend nahi karte):
 *
 *   unverified(0) → pending(1) → processing(2) → shipped(3) → delivered(4)
 *   cancelled = special, kisi bhi stage se ho sakta hai
 *
 * ASSUMPTION: 'unverified' ka matlab hai order/payment abhi verify nahi hua
 * (COD ya manual-verification wale orders me), isliye ye "pending" se bhi
 * PEHLE ka stage maana gaya hai. Agar aapke project me iska matlab kuch aur
 * hai (e.g. delivery ke baad "unverified" — jaise return/dispute), to bata
 * dena, rank order badal dunga.
 *
 * Rule:
 *  - Agar SAARE products ka status same hai -> wahi overall status hai.
 *  - Warna, "cancelled" wale products ko calculation se bahar rakha jata hai
 *    (jab tak SAARE cancel na ho gaye ho — tab overall = "cancelled").
 *  - Baaki bache "active" products me se, order sirf utna hi "aage" mana
 *    jayega jitna uska SABSE PEECHE (least advanced) wala product hai —
 *    order tab tak "delivered" nahi kaha jayega jab tak har product
 *    delivered na ho jaye.
 */

const PROGRESS_ORDER = ["unverified", "pending", "processing", "shipped", "delivered"]

const rankOf = (status) => {
  const idx = PROGRESS_ORDER.indexOf(status)
  return idx === -1 ? 0 : idx // unknown status ko sabse "peeche" treat karo (safe default)
}

export const getOverallOrderStatus = (products = []) => {
  if (!products.length) return "pending"

  const statuses = products.map((p) =>
    String(p.status || "pending").toLowerCase().trim()
  )

  const allSame = statuses.every((s) => s === statuses[0])
  if (allSame) return statuses[0]

  const active = statuses.filter((s) => s !== "cancelled")
  if (!active.length) return "cancelled" // sab products cancel ho chuke hain

  return active.reduce(
    (least, s) => (rankOf(s) < rankOf(least) ? s : least),
    active[0]
  )
}