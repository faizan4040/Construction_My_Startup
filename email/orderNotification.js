/**
 * QuickMason - Order Confirmation / Bill Email
 *
 * Usage:
 *   const html = orderNotification({
 *     order_id: "QM123456",
 *     orderDetailsUrl: "https://your-website.com/my-orders/QM123456",
 *     customerName: "Faizan",
 *     orderDate: order.createdAt,
 *     expectedDelivery: "2026-09-30",
 *     paymentMethod: "COD",              // "COD" ya "Online"
 *     paymentStatus: "Pending",          // optional
 *     items: [
 *       { name: "Ultratech PPC Cement, 50 Kg Bag", image: "https://...", qty: 10, price: 450, mrp: 480, variant: "50 Kg" },
 *     ],
 *     subTotal: 4500,        // optional (nahi doge to items se calculate hoga)
 *     discount: 300,         // optional (coupon / offer)
 *     deliveryFee: 0,        // optional (0 = Free)
 *     platformFee: 19,       // optional
 *     tax: 0,                // optional (GST)
 *     total: 4219,           // optional (nahi doge to calculate hoga)
 *     address: { name, line1, line2, city, state, pincode, phone },
 *   })
 */

// ---------- Easy settings ----------
const BRAND_NAME = "QuickMason"
const BRAND_URL = "https://your-website.com" // apni website ka link
const SUPPORT_EMAIL = "support@your-website.com" // apna support email
const SUPPORT_PHONE = "+91 00000 00000" // apna support number
const DEFAULT_DELIVERY_DAYS = 3

// Colors
const ORANGE = "#f97316"
const ORANGE_DARK = "#ea580c"
const YELLOW = "#facc15"
const DARK = "#111827"
const TEXT = "#374151"
const MUTED = "#6b7280"
const GREEN = "#16a34a"
const PANEL = "#f1f5f9"
const BG = "#f3f4f6"

/* =====================================================================
   HELPERS
   ===================================================================== */

// User ke diye text ko HTML me safe banata hai
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const num = (v, fallback = 0) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""))
  return Number.isNaN(n) ? fallback : n
}

const money = (v) =>
  `&#8377;${num(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (d) => {
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

const addDays = (d, days) => {
  const date = new Date(d)
  date.setDate(date.getDate() + days)
  return date
}

/* =====================================================================
   TEMPLATE
   ===================================================================== */

export const orderNotification = (data = {}) => {
  /* ---------- Data ko ek standard shape me laate hain ---------- */
  const orderId = data.order_id || data.orderId || ""
  const orderUrl = data.orderDetailsUrl || data.orderUrl || BRAND_URL
  const customerName = data.customerName || data.name || "Customer"

  const placedAt = data.orderDate ? new Date(data.orderDate) : new Date()
  const expectedAt = data.expectedDelivery
    ? new Date(data.expectedDelivery)
    : addDays(placedAt, num(data.deliveryDays, DEFAULT_DELIVERY_DAYS))

  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.products)
    ? data.products
    : []

  const items = rawItems.map((it) => {
    const qty = Math.max(1, num(it.qty ?? it.quantity, 1))
    const unit = num(it.price ?? it.sellingPrice ?? it.salePrice)
    const mrp = num(it.mrp ?? it.originalPrice)
    return {
      name: it.name || it.title || "Product",
      image: it.image || it.thumbnail || (Array.isArray(it.images) ? it.images[0]?.url || it.images[0] : "") || "",
      variant: it.variant || it.size || it.unit || "",
      qty,
      unit,
      mrp: mrp > unit ? mrp : 0,
      lineTotal: num(it.total ?? it.lineTotal, unit * qty),
    }
  })

  const itemsSubTotal = items.reduce((s, i) => s + i.unit * i.qty, 0)
  const mrpSavings = items.reduce((s, i) => s + (i.mrp ? (i.mrp - i.unit) * i.qty : 0), 0)

  const subTotal = num(data.subTotal ?? data.subtotal, itemsSubTotal)
  const discount = num(data.discount ?? data.couponDiscount)
  const deliveryFee = num(data.deliveryFee ?? data.shippingFee)
  const platformFee = num(data.platformFee)
  const tax = num(data.tax ?? data.gst)
  const total = num(
    data.total ?? data.totalAmount,
    subTotal - discount + deliveryFee + platformFee + tax
  )
  const totalSaved = discount + mrpSavings

  const method = String(data.paymentMethod || "Cash On Delivery")
  const isCod = /cod|cash/i.test(method)
  const paymentLabel = isCod ? "Cash On Delivery" : method
  const payTitle = isCod ? "Amount to be Paid" : "Amount Paid"

  const a = data.address || data.shippingAddress || {}
  const addressLines = [
    a.line1 || a.address,
    a.line2 || a.landmark,
    [a.city, a.state].filter(Boolean).join(", "),
    [a.country || "India", a.pincode || a.zip].filter(Boolean).join(" - "),
  ].filter(Boolean)
  const addressName = a.name || customerName
  const addressPhone = a.phone || a.mobile || ""
  const pincode = a.pincode || a.zip || ""

  /* ---------- Chhote HTML blocks ---------- */
  const itemRow = (it, isLast) => `
    <tr>
      <td style="padding:14px 0;${isLast ? "" : "border-bottom:1px solid #dbe3ec;"}">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td width="64" valign="top" style="padding-right:12px;">
              ${
                it.image
                  ? `<img src="${esc(it.image)}" alt="${esc(it.name)}" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;background-color:#ffffff;" />`
                  : `<table role="presentation" width="56" height="56" border="0" cellpadding="0" cellspacing="0"><tr><td width="56" height="56" bgcolor="#e5e7eb" style="width:56px;height:56px;background-color:#e5e7eb;border-radius:8px;font-size:0;line-height:0;">&nbsp;</td></tr></table>`
              }
            </td>
            <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 4px 0;font-size:14px;line-height:1.4;font-weight:bold;color:${DARK};">${esc(it.name)}</p>
              ${it.variant ? `<p style="margin:0 0 2px 0;font-size:12.5px;color:${MUTED};">Size / Pack: <strong style="color:${TEXT};">${esc(it.variant)}</strong> &nbsp; Qty <strong style="color:${TEXT};">${it.qty}</strong></p>` : `<p style="margin:0 0 2px 0;font-size:12.5px;color:${MUTED};">Qty <strong style="color:${TEXT};">${it.qty}</strong></p>`}
              <p style="margin:0 0 2px 0;font-size:12.5px;color:${MUTED};">
                Price <strong style="color:${TEXT};">${money(it.unit)}</strong>
                ${it.mrp ? `<span style="color:#9ca3af;text-decoration:line-through;margin-left:6px;">${money(it.mrp)}</span>` : ""}
              </p>
              <p style="margin:0;font-size:12.5px;color:${MUTED};">Expected delivery <strong style="color:${TEXT};">${esc(formatDate(expectedAt))}</strong></p>
            </td>
            <td width="100" align="right" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${DARK};white-space:nowrap;">
              ${money(it.lineTotal)}
            </td>
          </tr>
        </table>
      </td>
    </tr>`

  const sumRow = (label, value, opts = {}) => `
    <tr>
      <td style="padding:5px 0;font-family:Arial,Helvetica,sans-serif;font-size:${opts.small ? "12px" : "14px"};color:${opts.small ? MUTED : TEXT};${opts.indent ? "padding-left:14px;" : ""}">${label}</td>
      <td align="right" style="padding:5px 0;font-family:Arial,Helvetica,sans-serif;font-size:${opts.small ? "12px" : "14px"};color:${opts.color || (opts.small ? MUTED : DARK)};${opts.bold ? "font-weight:bold;" : ""}">${value}</td>
    </tr>`

  const itemsHtml = items.length
    ? items.map((it, i) => itemRow(it, i === items.length - 1)).join("")
    : `<tr><td style="padding:14px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">No items found for this order.</td></tr>`

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <title>Order Confirmation - ${esc(BRAND_NAME)}</title>
  <style>
    body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    img { border:0; outline:none; text-decoration:none; }
    a { color:${ORANGE_DARK}; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
    @media only screen and (max-width:700px) {
      .container { width:100% !important; }
      .px { padding-left:16px !important; padding-right:16px !important; }
      .stack { display:block !important; width:100% !important; }
      .stack-gap { padding-top:14px !important; }
      .hdr-title { font-size:18px !important; }
      .btn-cell { display:block !important; width:100% !important; padding-top:14px !important; text-align:left !important; }
    }
  </style>
</head>

<body style="margin:0;padding:0;background-color:${BG};">

  <!-- Inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BG};">
    Your ${esc(BRAND_NAME)} order ${esc(orderId)} is confirmed. Total ${money(total)}.
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${BG}" style="background-color:${BG};">
    <tr>
      <td align="center" style="padding:24px 10px;">

        <table role="presentation" class="container" width="680" border="0" cellpadding="0" cellspacing="0"
          style="width:680px;max-width:680px;background-color:#ffffff;">

          <!-- Top stripe -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" height="6" bgcolor="${ORANGE}" style="background-color:${ORANGE};height:6px;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="25%" height="6" bgcolor="${YELLOW}" style="background-color:${YELLOW};height:6px;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="25%" height="6" bgcolor="${DARK}" style="background-color:${DARK};height:6px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td bgcolor="${DARK}" class="px" style="background-color:${DARK};padding:22px 24px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="stack" valign="middle" style="font-family:Arial,Helvetica,sans-serif;">
                    <a href="${esc(BRAND_URL)}" target="_blank" style="font-size:26px;font-weight:bold;color:#ffffff;text-decoration:none;letter-spacing:1px;">
                      Quick<span style="color:${ORANGE};">Mason</span>
                    </a>
                  </td>
                  <td class="stack stack-gap" align="right" valign="middle" style="font-family:Arial,Helvetica,sans-serif;">
                    <p class="hdr-title" style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">Order Confirmation</p>
                    <p style="margin:4px 0 0 0;font-size:13px;color:#d1d5db;">Order ID <a href="${esc(orderUrl)}" target="_blank" style="color:${YELLOW};text-decoration:underline;font-weight:bold;">${esc(orderId)}</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td class="px" bgcolor="#fff7ed" style="background-color:#fff7ed;border-bottom:1px solid #fed7aa;padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#7c2d12;">
              Thank you for choosing ${esc(BRAND_NAME)}. Your order has been placed successfully and we are getting your materials ready.
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td class="px" style="padding:26px 24px 8px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${TEXT};">
              <p style="margin:0 0 12px 0;">Hi <strong>${esc(customerName)}</strong>,</p>
              <p style="margin:0 0 12px 0;">Your ${esc(BRAND_NAME)} order has been placed successfully.</p>
              <p style="margin:0 0 12px 0;">We hope to deliver this order by <strong>${esc(formatDate(expectedAt))}</strong>. Once packed and shipped, we will update you on the promised date of delivery.</p>
              <p style="margin:0;">Regards,<br />Team ${esc(BRAND_NAME)}</p>
            </td>
          </tr>

          <!-- Order details -->
          <tr>
            <td class="px" style="padding:20px 24px 0 24px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${PANEL}" style="background-color:${PANEL};border-radius:10px;">
                <tr>
                  <td style="padding:20px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 14px 0;font-size:21px;font-weight:bold;color:${DARK};">Your Order Details</p>
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="stack" valign="middle" style="font-size:13.5px;line-height:1.9;color:${MUTED};">
                          Order ID <strong style="color:${ORANGE_DARK};">${esc(orderId)}</strong><br />
                          Order placed on <strong style="color:${TEXT};">${esc(formatDate(placedAt))}</strong><br />
                          Order delivered to <strong style="color:${TEXT};">${esc(addressName)}${pincode ? `, ${esc(pincode)}` : ""}</strong>
                        </td>
                        <td class="stack btn-cell" align="right" valign="middle">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" bgcolor="${DARK}" style="background-color:${DARK};border-radius:6px;">
                                <a href="${esc(orderUrl)}" target="_blank"
                                  style="display:inline-block;padding:12px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">
                                  View Order
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items + Bill -->
          <tr>
            <td class="px" style="padding:16px 24px 0 24px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${PANEL}" style="background-color:${PANEL};border-radius:10px;">
                <tr>
                  <td style="padding:20px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 6px 0;font-size:21px;font-weight:bold;color:${DARK};">Items you have purchased</p>

                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                      ${itemsHtml}
                    </table>

                    <!-- Bill summary -->
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:6px;border-top:1px solid #dbe3ec;">
                      <tr><td style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                      ${sumRow("Sub Total:", money(subTotal))}
                      ${discount > 0 ? sumRow("Coupon Savings:", `- ${money(discount)}`, { color: GREEN }) : ""}
                      ${sumRow("Delivery Fee", deliveryFee > 0 ? money(deliveryFee) : "Free", { small: true, indent: true, color: deliveryFee > 0 ? MUTED : GREEN })}
                      ${platformFee > 0 ? sumRow("Platform Fee", money(platformFee), { small: true, indent: true }) : ""}
                      ${tax > 0 ? sumRow("Tax (GST)", money(tax), { small: true, indent: true }) : ""}
                      ${sumRow("Order Total:", money(total), { bold: true })}
                    </table>

                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid #dbe3ec;">
                      <tr>
                        <td style="padding:14px 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;color:${DARK};">${payTitle}</td>
                        <td align="right" style="padding:14px 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:21px;font-weight:bold;color:${DARK};">${money(total)}</td>
                      </tr>
                      ${
                        totalSaved > 0
                          ? `<tr><td colspan="2" align="right" style="padding:2px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${GREEN};">You saved <strong>${money(totalSaved)}</strong> on this order</td></tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Address + Payment -->
          <tr>
            <td class="px" style="padding:16px 24px 0 24px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${PANEL}" style="background-color:${PANEL};border-radius:10px;">
                <tr>
                  <td class="stack" valign="top" width="60%" style="padding:20px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 10px 0;font-size:19px;font-weight:bold;color:${DARK};">Delivery Address</p>
                    <p style="margin:0 0 6px 0;font-size:15px;font-weight:bold;color:${DARK};">${esc(addressName)}</p>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:${TEXT};">
                      ${addressLines.map(esc).join("<br />")}
                      ${addressPhone ? `<br />Mobile: ${esc(addressPhone)}` : ""}
                    </p>
                  </td>
                  <td class="stack stack-gap" valign="top" width="40%" style="padding:20px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 10px 0;font-size:19px;font-weight:bold;color:${DARK};">Mode of Payment</p>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:${TEXT};">
                      ${esc(paymentLabel)}
                      ${data.paymentStatus ? `<br /><span style="color:${MUTED};">Status: ${esc(data.paymentStatus)}</span>` : ""}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Please note -->
          <tr>
            <td class="px" style="padding:24px 24px 8px 24px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 10px 0;font-size:20px;font-weight:bold;color:${DARK};">Please note:</p>
              <p style="margin:0 0 12px 0;font-size:13.5px;line-height:1.7;color:${TEXT};">
                We do not demand your banking and card details verbally or telephonically. Please do not share
                your details with anyone claiming to call on behalf of ${esc(BRAND_NAME)}.
              </p>
              <p style="margin:0;font-size:13.5px;line-height:1.7;color:${TEXT};">
                Have feedback or an order-related query? Call us on <strong>${esc(SUPPORT_PHONE)}</strong>
                or email <a href="mailto:${esc(SUPPORT_EMAIL)}" style="color:${ORANGE_DARK};">${esc(SUPPORT_EMAIL)}</a>.
                Our team will be glad to help you.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="${DARK}" class="px" style="background-color:${DARK};padding:26px 24px;margin-top:20px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#ffffff;">
                <a href="${esc(BRAND_URL)}" target="_blank" style="color:#ffffff;text-decoration:underline;">Visit Website</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="${esc(orderUrl)}" target="_blank" style="color:#ffffff;text-decoration:underline;">View Order</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="mailto:${esc(SUPPORT_EMAIL)}" style="color:#ffffff;text-decoration:underline;">Contact Us</a>
              </p>
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} ${esc(BRAND_NAME)}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};text-align:center;">
          This is an automated email, please do not reply.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
`

  return html
}


































// export const orderNotification = (data) => {
//   const html = `
//         <!DOCTYPE html>
//   <html lang="en-US" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
// <head>
// 	<title></title>
// 	<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
// 	<meta content="width=device-width, initial-scale=1.0" name="viewport" />
// 	<style>
// 		* {
// 			box-sizing: border-box;
// 		}

// 		body {
// 			margin: 0;
// 			padding: 0;
// 		}

// 		a[x-apple-data-detectors] {
// 			color: inherit !important;
// 			text-decoration: inherit !important;
// 		}

// 		#MessageViewBody a {
// 			color: inherit;
// 			text-decoration: none;
// 		}

// 		p {
// 			line-height: inherit
// 		}

// 		.desktop_hide,
// 		.desktop_hide table {
// 			mso-hide: all;
// 			display: none;
// 			max-height: 0px;
// 			overflow: hidden;
// 		}

// 		.image_block img+div {
// 			display: none;
// 		}

// 		sup,
// 		sub {
// 			font-size: 75%;
// 			line-height: 0;
// 		}

// 		.row-4 .column-1 .block-3 .button:hover {
// 			background-color: #000000 !important;
// 			border-bottom: 0 solid transparent !important;
// 			border-left: 0 solid transparent !important;
// 			border-right: 0px solid transparent !important;
// 			border-top: 0 solid transparent !important;
// 			color: #ffffff !important;
// 		}

// 		@media (max-width:700px) {

// 			.desktop_hide table.icons-inner,
// 			.row-5 .column-2 .block-1.social_block .alignment table,
// 			.social_block.desktop_hide .social-table {
// 				display: inline-block !important;
// 			}

// 			.icons-inner {
// 				text-align: center;
// 			}

// 			.icons-inner td {
// 				margin: 0 auto;
// 			}

// 			.mobile_hide {
// 				display: none;
// 			}

// 			.row-content {
// 				width: 100% !important;
// 			}

// 			.stack .column {
// 				width: 100%;
// 				display: block;
// 			}

// 			.mobile_hide {
// 				min-height: 0;
// 				max-height: 0;
// 				max-width: 0;
// 				overflow: hidden;
// 				font-size: 0px;
// 			}

// 			.desktop_hide,
// 			.desktop_hide table {
// 				display: table !important;
// 				max-height: none !important;
// 			}

// 			.row-3 .column-1 .block-2.paragraph_block td.pad>div,
// 			.row-3 .column-3 .block-1.paragraph_block td.pad>div {
// 				font-size: 10px !important;
// 			}

// 			.row-3 .column-1 .block-2.paragraph_block td.pad {
// 				padding: 10px !important;
// 			}

// 			.row-3 .column-2 .block-1.divider_block td.pad,
// 			.row-3 .column-4 .block-1.divider_block td.pad {
// 				padding: 30px 10px 10px !important;
// 			}

// 			.row-3 .column-2 .block-1.divider_block .alignment table,
// 			.row-3 .column-4 .block-1.divider_block .alignment table {
// 				display: inline-table;
// 			}

// 			.row-2 .column-1 .block-1.heading_block h1 {
// 				font-size: 30px !important;
// 			}

// 			.row-3 .column-3 .block-1.paragraph_block td.pad,
// 			.row-3 .column-5 .block-1.paragraph_block td.pad {
// 				padding: 25px 0 0 !important;
// 			}

// 			.row-3 .column-5 .block-1.paragraph_block td.pad>div {
// 				text-align: center !important;
// 				font-size: 10px !important;
// 			}

// 			.row-5 .column-1 .block-1.paragraph_block td.pad>div {
// 				text-align: center !important;
// 				font-size: 11px !important;
// 			}

// 			.row-5 .column-2 .block-1.social_block .alignment {
// 				text-align: center !important;
// 			}

// 			.row-7 .column-1 .block-1.paragraph_block td.pad>div,
// 			.row-7 .column-2 .block-1.paragraph_block td.pad>div,
// 			.row-7 .column-3 .block-1.paragraph_block td.pad>div {
// 				font-size: 11px !important;
// 			}

// 			.row-2 .row-content {
// 				padding: 30px !important;
// 			}

// 			.row-4 .row-content {
// 				padding: 0 30px 30px !important;
// 			}

// 			.row-5 .row-content {
// 				padding: 20px !important;
// 			}

// 			.row-6 .row-content {
// 				padding: 5px 30px !important;
// 			}

// 			.row-3 .column-1 {
// 				padding: 10px 0 5px 5px !important;
// 			}

// 			.row-3 .column-5 {
// 				padding: 5px 10px 5px 0 !important;
// 			}

// 			.row-5 .column-2 {
// 				padding: 20px 0 0 !important;
// 			}
// 		}
// 	</style>

// </head>

// <body class="body"
// 	style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
// 	<table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"
// 		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;" width="100%">
// 		<tbody>
// 			<tr>
// 				<td>
// 					<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1"
// 						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// 						<tbody>
// 							<tr>
// 								<td>
// 									<table align="center" border="0" cellpadding="0" cellspacing="0"
// 										class="row-content stack" role="presentation"
// 										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f1ed; border-radius: 0 0 20px 20px; color: #000000; width: 680px; margin: 0 auto;"
// 										width="680">
// 										<tbody>
// 											<tr>
// 												<td class="column column-1"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; vertical-align: top;"
// 													width="100%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="image_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="width:100%;padding-right:0px;padding-left:0px;">
// 																<div align="center" class="alignment">
// 																	<div style="max-width: 248px;"><img alt="Logo"
// 																			height="auto" src="https://res.cloudinary.com/do7xdfl3y/image/upload/v1746551738/next-ecommerce/logo-black_bxt60d.png"
// 																			style="display: block; height: auto; border: 0; width: 100%;"
// 																			title="Logo" width="248" /></div>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 											</tr>
// 										</tbody>
// 									</table>
// 								</td>
// 							</tr>
// 						</tbody>
// 					</table>
// 					<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2"
// 						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// 						<tbody>
// 							<tr>
// 								<td>
// 									<table align="center" border="0" cellpadding="0" cellspacing="0"
// 										class="row-content stack" role="presentation"
// 										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; padding: 30px 60px 20px; width: 680px; margin: 0 auto;"
// 										width="680">
// 										<tbody>
// 											<tr>
// 												<td class="column column-1"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;"
// 													width="100%">
// 													<table border="0" cellpadding="10" cellspacing="0"
// 														class="heading_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad">
// 																<h1
// 																	style="margin: 0; color: #000000; direction: ltr; font-family: TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif; font-size: 40px; font-weight: 400; letter-spacing: -2px; line-height: 1.2; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 48px;">
// 																	<span class="tinyMce-placeholder"
// 																		style="word-break: break-word;">YOUR ORDER WILL
// 																		BE SHIPPED SOON!</span>
// 																</h1>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 											</tr>
// 										</tbody>
// 									</table>
// 								</td>
// 							</tr>
// 						</tbody>
// 					</table>
// 					<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3"
// 						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// 						<tbody>
// 							<tr>
// 								<td>
// 									<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content"
// 										role="presentation"
// 										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 680px; margin: 0 auto;"
// 										width="680">
// 										<tbody>
// 											<tr>
// 												<td class="column column-1"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 45px; padding-top: 10px; vertical-align: top;"
// 													width="25%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="image_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="width:100%;padding-right:0px;padding-left:0px;">
// 																<div align="center" class="alignment">
// 																	<div style="max-width: 13px;"><img alt="Check"
// 																			height="auto" src="https://res.cloudinary.com/do7xdfl3y/image/upload/v1746551738/next-ecommerce/check-orange_g480te.png"
// 																			style="display: block; height: auto; border: 0; width: 100%;"
// 																			title="Check" width="13" /></div>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-2" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad" style="padding-top:10px;">
// 																<div
// 																	style="color:#000000;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:18px;font-weight:700;letter-spacing:0px;line-height:1.2;text-align:center;mso-line-height-alt:22px;">
// 																	<p style="margin: 0;">Confirmed</p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 												<td class="column column-2"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;"
// 													width="16.666666666666668%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="divider_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:35px;">
// 																<div align="center" class="alignment">
// 																	<table border="0" cellpadding="0" cellspacing="0"
// 																		role="presentation"
// 																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 																		width="100%">
// 																		<tr>
// 																			<td class="divider_inner"
// 																				style="font-size: 1px; line-height: 1px; border-top: 2px solid #e1cabf;">
// 																				<span
// 																					style="word-break: break-word;"> </span>
// 																			</td>
// 																		</tr>
// 																	</table>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 												<td class="column column-3"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;"
// 													width="16.666666666666668%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad" style="padding-top:25px;">
// 																<div
// 																	style="color:#e1cabf;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:18px;font-weight:400;letter-spacing:0px;line-height:1.2;text-align:center;mso-line-height-alt:22px;">
// 																	<p style="margin: 0;">Shipped</p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 												<td class="column column-4"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;"
// 													width="16.666666666666668%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="divider_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:35px;">
// 																<div align="center" class="alignment">
// 																	<table border="0" cellpadding="0" cellspacing="0"
// 																		role="presentation"
// 																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 																		width="100%">
// 																		<tr>
// 																			<td class="divider_inner"
// 																				style="font-size: 1px; line-height: 1px; border-top: 2px solid #e1cabf;">
// 																				<span
// 																					style="word-break: break-word;"> </span>
// 																			</td>
// 																		</tr>
// 																	</table>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 												<td class="column column-5"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 10px; padding-top: 5px; vertical-align: top;"
// 													width="25%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad" style="padding-left:10px;padding-top:25px;">
// 																<div
// 																	style="color:#e1cabf;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:18px;font-weight:400;letter-spacing:0px;line-height:1.2;text-align:left;mso-line-height-alt:22px;">
// 																	<p style="margin: 0;">Delivered</p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 											</tr>
// 										</tbody>
// 									</table>
// 								</td>
// 							</tr>
// 						</tbody>
// 					</table>
// 					<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4"
// 						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// 						<tbody>
// 							<tr>
// 								<td>
// 									<table align="center" border="0" cellpadding="0" cellspacing="0"
// 										class="row-content stack" role="presentation"
// 										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; padding-bottom: 60px; padding-left: 60px; padding-right: 60px; width: 680px; margin: 0 auto;"
// 										width="680">
// 										<tbody>
// 											<tr>
// 												<td class="column column-1"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;"
// 													width="100%">
// 													<table border="0" cellpadding="40" cellspacing="0"
// 														class="image_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad">
// 																<div align="center" class="alignment">
// 																	<div style="max-width: 130px;"><img
// 																			alt="a hand with a star" height="auto"
// 																			src="https://res.cloudinary.com/do7xdfl3y/image/upload/v1746551738/next-ecommerce/order-conf-icon_ljhxtd.png"
// 																			style="display: block; height: auto; border: 0; width: 100%;"
// 																			title="a hand with a star" width="130" />
// 																	</div>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="heading_block block-2" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:35px;padding-left:10px;padding-right:10px;padding-top:10px;text-align:center;width:100%;">
// 																<h3
// 																	style="margin: 0; color: #4400ff; direction: ltr; font-family: TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: normal; line-height: 1.2; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 29px;">
// 																	<span class="tinyMce-placeholder"
// 																		style="word-break: break-word;">Order Id:
// 																		${data.order_id} </span>
// 																</h3>
// 															</td>
// 														</tr>
// 													</table>
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="button_block block-3" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad" style="text-align:center;">
// 																<div align="center" class="alignment"><a
// 																		href="${data.orderDetailsUrl}"
// 																		style="color:#ffffff;text-decoration:none;"
// 																		target="_blank"> <span class="button"
// 																			style="background-color: #9502f5; border-bottom: 0px solid #f65c03; border-left: 0px solid #f65c03; border-radius: 30px; border-right: 0px solid #f65c03; border-top: 0px solid #f65c03; color: #ffffff; display: inline-block; font-family: TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif; font-size: 16px; font-weight: 700; mso-border-alt: none; padding-bottom: 5px; padding-top: 5px; padding-left: 30px; padding-right: 30px; text-align: center; width: auto; word-break: keep-all; letter-spacing: 1px;"><span
// 																				style="word-break: break-word; line-height: 32px;">VIEW
// 																				MY
// 																				ORDER</span></span> </a>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 											</tr>
// 										</tbody>
// 									</table>
// 								</td>
// 							</tr>
// 						</tbody>
// 					</table>
// 					<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5"
// 						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// 						<tbody>
// 							<tr>
// 								<td>
// 									<table align="center" border="0" cellpadding="0" cellspacing="0"
// 										class="row-content stack" role="presentation"
// 										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #000000; border-radius: 20px 20px 0 0; color: #000000; padding-bottom: 20px; padding-left: 60px; padding-top: 20px; width: 680px; margin: 0 auto;"
// 										width="680">
// 										<tbody>
// 											<tr>
// 												<td class="column column-1"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-top: 20px; vertical-align: top;"
// 													width="58.333333333333336%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:5px;padding-left:10px;padding-right:10px;padding-top:5px;">
// 																<div
// 																	style="color:#f7f1ed;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:14px;font-weight:700;letter-spacing:3px;line-height:1.2;text-align:left;mso-line-height-alt:17px;">
// 																	<p style="margin: 0;">FUEL FOR YOUR INNER GLOW</p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 												<td class="column column-2"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-right: 50px; padding-top: 20px; vertical-align: top;"
// 													width="41.666666666666664%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="social_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="text-align:right;padding-right:0px;padding-left:0px;">
// 																<div align="right" class="alignment">
// 																	<table border="0" cellpadding="0" cellspacing="0"
// 																		class="social-table" role="presentation"
// 																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;"
// 																		width="108px">
// 																		<tr>
// 																			<td style="padding:0 0 0 4px;"><a
// 																					href="https://www.facebook.com/"
// 																					target="_blank"><img alt="facebook"
// 																						height="auto"
// 																						src="https://res.cloudinary.com/do7xdfl3y/image/upload/v1746551738/next-ecommerce/facebook2x_i55n3x.png"
// 																						style="display: block; height: auto; border: 0;"
// 																						title="facebook"
// 																						width="32" /></a></td>
// 																			<td style="padding:0 0 0 4px;"><a
// 																					href="https://www.twitter.com/"
// 																					target="_blank"><img alt="twitter"
// 																						height="auto"
// 																						src="https://res.cloudinary.com/do7xdfl3y/image/upload/v1746551738/next-ecommerce/twitter2x_mw4wta.png"
// 																						style="display: block; height: auto; border: 0;"
// 																						title="twitter"
// 																						width="32" /></a></td>
// 																			<td style="padding:0 0 0 4px;"><a
// 																					href="https://www.instagram.com/"
// 																					target="_blank"><img alt="instagram"
// 																						height="auto"
// 																						src="https://res.cloudinary.com/do7xdfl3y/image/upload/v1746551738/next-ecommerce/instagram2x_te7lqu.png"
// 																						style="display: block; height: auto; border: 0;"
// 																						title="instagram"
// 																						width="32" /></a></td>
// 																		</tr>
// 																	</table>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 											</tr>
// 										</tbody>
// 									</table>
// 								</td>
// 							</tr>
// 						</tbody>
// 					</table>
// 					<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6"
// 						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// 						<tbody>
// 							<tr>
// 								<td>
// 									<table align="center" border="0" cellpadding="0" cellspacing="0"
// 										class="row-content stack" role="presentation"
// 										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #000000; border-radius: 0; color: #000000; padding: 5px 60px; width: 680px; margin: 0 auto;"
// 										width="680">
// 										<tbody>
// 											<tr>
// 												<td class="column column-1"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top;"
// 													width="100%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="divider_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:10px;padding-top:10px;">
// 																<div align="center" class="alignment">
// 																	<table border="0" cellpadding="0" cellspacing="0"
// 																		role="presentation"
// 																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 																		width="100%">
// 																		<tr>
// 																			<td class="divider_inner"
// 																				style="font-size: 1px; line-height: 1px; border-top: 1px solid #3a3a3a;">
// 																				<span
// 																					style="word-break: break-word;"> </span>
// 																			</td>
// 																		</tr>
// 																	</table>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-2" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:20px;padding-top:20px;">
// 																<div
// 																	style="color:#ffffff;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:18px;font-weight:400;letter-spacing:0px;line-height:1.2;text-align:left;mso-line-height-alt:22px;">
// 																	<p style="margin: 0;"><strong>Have a
// 																			question?</strong> We love curiosity. <a
// 																			href="contact-us.com" rel="noopener"
// 																			style="text-decoration: underline; color: #ffffff;"
// 																			target="_blank">contact us</a></p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="divider_block block-3" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:10px;padding-top:10px;">
// 																<div align="center" class="alignment">
// 																	<table border="0" cellpadding="0" cellspacing="0"
// 																		role="presentation"
// 																		style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
// 																		width="100%">
// 																		<tr>
// 																			<td class="divider_inner"
// 																				style="font-size: 1px; line-height: 1px; border-top: 1px solid #3a3a3a;">
// 																				<span
// 																					style="word-break: break-word;"> </span>
// 																			</td>
// 																		</tr>
// 																	</table>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-4" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:5px;padding-top:15px;">
// 																<div
// 																	style="color:#ffffff;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:15px;font-weight:400;letter-spacing:0px;line-height:1.2;text-align:left;mso-line-height-alt:18px;">
// 																	<p style="margin: 0;">How much do you want to hear
// 																		from us?</p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 											</tr>
// 										</tbody>
// 									</table>
// 								</td>
// 							</tr>
// 						</tbody>
// 					</table>
// 					<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-7"
// 						role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
// 						<tbody>
// 							<tr>
// 								<td>
// 									<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content"
// 										role="presentation"
// 										style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #000000; border-radius: 0; color: #000000; width: 680px; margin: 0 auto;"
// 										width="680">
// 										<tbody>
// 											<tr>
// 												<td class="column column-1"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 20px; padding-top: 5px; vertical-align: top;"
// 													width="33.333333333333336%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:20px;padding-top:15px;">
// 																<div
// 																	style="color:#f7f1ed;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:13px;font-weight:400;letter-spacing:0px;line-height:1.2;text-align:center;mso-line-height-alt:16px;">
// 																	<p style="margin: 0;"><a
// 																			href="https://www.example.com"
// 																			rel="noopener"
// 																			style="text-decoration: underline; color: #f7f1ed;"
// 																			target="_blank">Give me everything!</a></p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 												<td class="column column-2"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 20px; padding-right: 20px; padding-top: 5px; vertical-align: top;"
// 													width="33.333333333333336%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:20px;padding-top:15px;">
// 																<div
// 																	style="color:#f7f1ed;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:13px;font-weight:400;letter-spacing:0px;line-height:1.2;text-align:center;mso-line-height-alt:16px;">
// 																	<p style="margin: 0;"><a
// 																			href="https://www.example.com"
// 																			rel="noopener"
// 																			style="text-decoration: underline; color: #f7f1ed;"
// 																			target="_blank">Just the essentials.</a></p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 												<td class="column column-3"
// 													style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-right: 20px; padding-top: 5px; vertical-align: top;"
// 													width="33.333333333333336%">
// 													<table border="0" cellpadding="0" cellspacing="0"
// 														class="paragraph_block block-1" role="presentation"
// 														style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
// 														width="100%">
// 														<tr>
// 															<td class="pad"
// 																style="padding-bottom:20px;padding-top:15px;">
// 																<div
// 																	style="color:#f7f1ed;direction:ltr;font-family:TimesNewRoman, 'Times New Roman', Times, Baskerville, Georgia, serif;font-size:13px;font-weight:400;letter-spacing:0px;line-height:1.2;text-align:center;mso-line-height-alt:16px;">
// 																	<p style="margin: 0;"><a
// 																			href="https://www.example.com"
// 																			rel="noopener"
// 																			style="text-decoration: underline; color: #f7f1ed;"
// 																			target="_blank">Unsubscribe</a></p>
// 																</div>
// 															</td>
// 														</tr>
// 													</table>
// 												</td>
// 											</tr>
// 										</tbody>
// 									</table>
// 								</td>
// 							</tr>
// 						</tbody>
// 					</table>

// 				</td>
// 			</tr>
// 		</tbody>
// 	</table> 
// </body>

// </html>
// `;

//   return html;
// };