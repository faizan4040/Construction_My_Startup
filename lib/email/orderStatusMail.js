// Same visual style as emailVerificationLink — reused wrapper, different body text.
const wrapEmail = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background:#f5f5f5;margin:0;padding:50px 0;font-family:Tahoma,Verdana,Segoe,sans-serif;">
  <table align="center" width="500" style="background:#fff;border-radius:8px;padding:20px;">
    <tr><td>
      <h1 style="text-align:center;color:#393d47;font-size:22px;">${title}</h1>
      ${bodyHtml}
      <p style="text-align:center;color:#393d47;font-size:13px;margin-top:20px;">Thank you,<br/>ConstructEzy</p>
    </td></tr>
  </table>
</body>
</html>`

const statusMessages = {
  pending: (order) => wrapEmail(
    "Order Accepted for Pickup",
    `<p style="text-align:center;font-size:14px;color:#393d47;">Your order <b>${order.order_id}</b> has been picked up by our delivery boy and is now pending shop confirmation.</p>`
  ),
  ready_to_ship: (order) => wrapEmail(
    "Order Ready to Ship",
    `<p style="text-align:center;font-size:14px;color:#393d47;">Great news! Your order <b>${order.order_id}</b> has been packed and is ready to ship.</p>`
  ),
  shipped: (order) => wrapEmail(
    "Order Shipped",
    `<p style="text-align:center;font-size:14px;color:#393d47;">Your order <b>${order.order_id}</b> is on its way!</p>`
  ),
  delivered: (order) => wrapEmail(
    "Order Delivered",
    `<p style="text-align:center;font-size:14px;color:#393d47;">Your order <b>${order.order_id}</b> has been delivered. Thank you for shopping with ConstructEzy!</p>`
  ),
  cancelled: (order) => wrapEmail(
    "Order Cancelled",
    `<p style="text-align:center;font-size:14px;color:#393d47;">Your order <b>${order.order_id}</b> has been cancelled.</p>`
  ),
}

export function getOrderStatusEmail(status, order) {
  const builder = statusMessages[status]
  return builder ? builder(order) : null
}