import nodemailer from 'nodemailer'

/* ─── lazy-init transporter so env vars are read at runtime ─── */
let _transporter = null
function getTransporter() {
  if (_transporter) return _transporter
  _transporter = nodemailer.createTransport({
    host:   process.env.NODEMAILER_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.NODEMAILER_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  })
  return _transporter
}

/* ─── status display metadata ─── */
const ORDER_META = {
  pending:   { label:'Pending',   emoji:'⏳', color:'#d97706', bg:'#fffbeb', border:'#fde68a', desc:'Your order has been received and is awaiting confirmation.' },
  confirmed: { label:'Confirmed', emoji:'✅', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', desc:'Your order is confirmed and is now being prepared.' },
  shipped:   { label:'Shipped',   emoji:'🚚', color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', desc:'Your order has been dispatched and is on its way to you.' },
  delivered: { label:'Delivered', emoji:'🎉', color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', desc:'Your order has been delivered successfully. Enjoy!' },
  cancelled: { label:'Cancelled', emoji:'❌', color:'#dc2626', bg:'#fef2f2', border:'#fecaca', desc:'Your order has been cancelled. Contact us if you have questions.' },
}
const PAYMENT_META = {
  Pending: { label:'Payment Pending',  emoji:'💳', color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
  Paid:    { label:'Payment Received', emoji:'💰', color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  Failed:  { label:'Payment Failed',   emoji:'🚫', color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
}

const meta = (map, key) => map[key] || { label: key, emoji:'📋', color:'#6366f1', bg:'#eef2ff', border:'#c7d2fe', desc:'' }

/* ─── HTML email builder ─── */
function buildHtml(opts) {
  const {
    customerName, orderId,
    oldStatus, newStatus,
    oldPaymentStatus, newPaymentStatus,
    products, totalAmount, adminNote,
  } = opts

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'
  const storeUrl  = process.env.NEXT_PUBLIC_BASE_URL  || '#'
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''
  const year      = new Date().getFullYear()

  const osMeta = meta(ORDER_META,   newStatus)
  const psMeta = meta(PAYMENT_META, newPaymentStatus)

  const statusChanged  = oldStatus        !== newStatus
  const paymentChanged = oldPaymentStatus !== newPaymentStatus

  /* product rows */
  const productRows = (products || []).map(p => {
    const line = Number(p.qty || 1) * Number(p.price || 0)
    return `
      <tr>
        <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;font-weight:600;">${p.name || '—'}</td>
        <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">${p.qty || 1}</td>
        <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:right;">₹${Number(p.price||0).toLocaleString('en-IN')}</td>
        <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#6366f1;font-weight:700;text-align:right;">₹${line.toLocaleString('en-IN')}</td>
      </tr>`
  }).join('')

  /* change rows */
  const changeRows = []
  if (statusChanged) {
    const old = meta(ORDER_META, oldStatus)
    changeRows.push(`
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;white-space:nowrap;">Order Status</td>
        <td style="padding:10px 16px;font-size:13px;border-bottom:1px solid #f1f5f9;">
          <span style="background:#f1f5f9;color:#64748b;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;">${old.emoji} ${old.label}</span>
          &nbsp;→&nbsp;
          <span style="background:${osMeta.bg};color:${osMeta.color};padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid ${osMeta.border};">${osMeta.emoji} ${osMeta.label}</span>
        </td>
      </tr>`)
  }
  if (paymentChanged) {
    const old = meta(PAYMENT_META, oldPaymentStatus)
    changeRows.push(`
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;white-space:nowrap;">Payment Status</td>
        <td style="padding:10px 16px;font-size:13px;border-bottom:1px solid #f1f5f9;">
          <span style="background:#f1f5f9;color:#64748b;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;">${old.emoji} ${old.label}</span>
          &nbsp;→&nbsp;
          <span style="background:${psMeta.bg};color:${psMeta.color};padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid ${psMeta.border};">${psMeta.emoji} ${psMeta.label}</span>
        </td>
      </tr>`)
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Order Update</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.09);">

  <!-- gradient bar -->
  <tr><td style="background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);height:5px;"></td></tr>

  <!-- header -->
  <tr><td style="background:linear-gradient(135deg,#eef2ff,#f5f3ff);padding:36px 40px 28px;text-align:center;">
    <div style="font-size:44px;margin-bottom:14px;">📦</div>
    <h1 style="margin:0 0 8px;font-size:23px;font-weight:800;color:#1e293b;">Order Update</h1>
    <p style="margin:0;font-size:14px;color:#64748b;">Hi <strong style="color:#6366f1;">${customerName || 'Valued Customer'}</strong>, your order status has been updated.</p>
  </td></tr>

  <!-- status badge -->
  <tr><td style="padding:20px 40px 0;">
    <div style="background:${osMeta.bg};border:1.5px solid ${osMeta.border};border-radius:14px;padding:20px 24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">${osMeta.emoji}</div>
      <div style="font-size:18px;font-weight:800;color:${osMeta.color};margin-bottom:6px;">${osMeta.label}</div>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">${osMeta.desc}</p>
    </div>
  </td></tr>

  <!-- order id -->
  <tr><td style="padding:16px 40px 0;">
    <table width="100%" style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;border-collapse:collapse;">
      <tr>
        <td style="padding:13px 20px;font-size:13px;color:#64748b;font-weight:600;">Order Reference</td>
        <td style="padding:13px 20px;font-size:15px;font-weight:800;color:#1e293b;text-align:right;font-family:'Courier New',monospace;">#${orderId}</td>
      </tr>
    </table>
  </td></tr>

  <!-- what changed -->
  ${changeRows.length > 0 ? `
  <tr><td style="padding:16px 40px 0;">
    <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">What changed</p>
    <table width="100%" style="border:1.5px solid #e8ecf4;border-radius:12px;border-collapse:collapse;overflow:hidden;">
      ${changeRows.join('')}
    </table>
  </td></tr>` : ''}

  <!-- admin note -->
  ${adminNote ? `
  <tr><td style="padding:16px 40px 0;">
    <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:16px 20px;">
      <p style="font-size:11px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">📝 Note from our team</p>
      <p style="font-size:14px;color:#92400e;margin:0;line-height:1.6;">${adminNote}</p>
    </div>
  </td></tr>` : ''}

  <!-- products -->
  ${productRows ? `
  <tr><td style="padding:16px 40px 0;">
    <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Order Items</p>
    <table width="100%" style="border:1.5px solid #e8ecf4;border-radius:12px;border-collapse:collapse;overflow:hidden;">
      <thead>
        <tr style="background:#f8faff;">
          <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;text-align:left;">Product</th>
          <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;text-align:center;">Qty</th>
          <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;text-align:right;">Price</th>
          <th style="padding:10px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${productRows}</tbody>
    </table>
  </td></tr>
  <tr><td style="padding:12px 40px 0;">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:16px 24px;">
      <table width="100%"><tr>
        <td style="font-size:13px;font-weight:700;color:rgba(255,255,255,.8);text-transform:uppercase;letter-spacing:.06em;">Grand Total</td>
        <td style="font-size:22px;font-weight:800;color:#fff;text-align:right;font-family:'Courier New',monospace;">₹${Number(totalAmount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
      </tr></table>
    </div>
  </td></tr>` : ''}

  <!-- CTA -->
  <tr><td style="padding:28px 40px;text-align:center;">
    <a href="${storeUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:.02em;box-shadow:0 4px 18px rgba(99,102,241,.35);">Visit Our Store →</a>
  </td></tr>

  <!-- help -->
  <tr><td style="padding:0 40px 28px;">
    <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:16px 20px;text-align:center;">
      <p style="font-size:13px;color:#64748b;margin:0;line-height:1.7;">Questions about your order? Contact us at<br/>
        <a href="mailto:${fromEmail}" style="color:#6366f1;font-weight:700;text-decoration:none;">${fromEmail}</a>
      </p>
    </div>
  </td></tr>

  <!-- footer -->
  <tr><td style="background:#f8faff;border-top:1.5px solid #edf0f8;padding:20px 40px;text-align:center;">
    <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;font-weight:600;">${storeName}</p>
    <p style="font-size:11px;color:#cbd5e1;margin:0;">© ${year} ${storeName}. All rights reserved.</p>
  </td></tr>

  <!-- bottom bar -->
  <tr><td style="background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);height:4px;"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

/* ─── plain text fallback ─── */
function buildText({ customerName, orderId, newStatus, newPaymentStatus, totalAmount, adminNote }) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'
  const lines = [
    `Hi ${customerName || 'Valued Customer'},`,
    '',
    `Your order #${orderId} has been updated.`,
    '',
    `Order Status   : ${newStatus}`,
    `Payment Status : ${newPaymentStatus}`,
    `Grand Total    : ₹${Number(totalAmount||0).toLocaleString('en-IN')}`,
  ]
  if (adminNote) lines.push('', `Note: ${adminNote}`)
  lines.push('', `Thank you for shopping with ${storeName}!`)
  return lines.join('\n')
}

/* ─── smart subject line ─── */
function buildSubject(orderId, newStatus, newPaymentStatus, oldPaymentStatus) {
  const store = process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'
  if (newStatus === 'shipped')              return `🚚 Your Order #${orderId} is on the way! — ${store}`
  if (newStatus === 'delivered')            return `🎉 Your Order #${orderId} has been delivered! — ${store}`
  if (newStatus === 'confirmed')            return `✅ Your Order #${orderId} is Confirmed! — ${store}`
  if (newStatus === 'cancelled')            return `❌ Your Order #${orderId} has been Cancelled — ${store}`
  if (newPaymentStatus === 'Paid' && oldPaymentStatus !== 'Paid')
                                            return `💰 Payment Confirmed for Order #${orderId} — ${store}`
  if (newPaymentStatus === 'Failed')        return `🚫 Payment Failed for Order #${orderId} — ${store}`
  return `📦 Order #${orderId} Updated — ${store}`
}

/* ════════════════════════════════════════════════════════════════
   EXPORT
════════════════════════════════════════════════════════════════ */
/**
 * Send an order-update email to the customer.
 *
 * @param {object} opts
 * @param {string}   opts.to                 Customer email
 * @param {string}   opts.customerName
 * @param {string}   opts.orderId
 * @param {string}   opts.oldStatus
 * @param {string}   opts.newStatus
 * @param {string}   opts.oldPaymentStatus
 * @param {string}   opts.newPaymentStatus
 * @param {Array}    opts.products
 * @param {number}   opts.totalAmount
 * @param {string}   [opts.adminNote]
 */
export async function sendOrderUpdateEmail(opts) {
  const {
    to, customerName, orderId,
    oldStatus, newStatus,
    oldPaymentStatus, newPaymentStatus,
    products = [], totalAmount,
    adminNote = '',
  } = opts

  if (!to) throw new Error('Recipient email (to) is required')

  const fromName  = process.env.SMTP_FROM_NAME  || process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

  const subject = buildSubject(orderId, newStatus, newPaymentStatus, oldPaymentStatus)
  const html    = buildHtml({ customerName, orderId, oldStatus, newStatus, oldPaymentStatus, newPaymentStatus, products, totalAmount, adminNote })
  const text    = buildText({ customerName, orderId, newStatus, newPaymentStatus, totalAmount, adminNote })

  const info = await getTransporter().sendMail({
    from:    `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  })

  console.log(`[Email] Sent → ${to} | Subject: ${subject} | MsgID: ${info.messageId}`)
  return info
}