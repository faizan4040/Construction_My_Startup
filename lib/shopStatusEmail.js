import nodemailer from 'nodemailer'

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

function buildHtml({ shopOwnerName, shopName, blocked, reason }) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'
  const storeUrl  = process.env.NEXT_PUBLIC_BASE_URL  || '#'
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''
  const year      = new Date().getFullYear()

  const meta = blocked
    ? { emoji: '🚫', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', title: 'Your Shop Has Been Suspended', desc: 'Your shop and its products have been temporarily taken down by our admin team.' }
    : { emoji: '✅', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', title: 'Your Shop Has Been Reactivated', desc: 'Your shop is back online — your products are visible to customers again.' }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${meta.title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.09);">
  <tr><td style="background:linear-gradient(90deg,#f97316,#f59e0b,#dc2626);height:5px;"></td></tr>
  <tr><td style="background:linear-gradient(135deg,#fff8f3,#fefce8);padding:36px 40px 28px;text-align:center;">
    <div style="font-size:44px;margin-bottom:14px;">${meta.emoji}</div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1e293b;">${meta.title}</h1>
    <p style="margin:0;font-size:14px;color:#64748b;">Hi <strong style="color:#f97316;">${shopOwnerName || 'Shop Owner'}</strong>,</p>
  </td></tr>
  <tr><td style="padding:20px 40px 0;">
    <div style="background:${meta.bg};border:1.5px solid ${meta.border};border-radius:14px;padding:20px 24px;text-align:center;">
      <p style="margin:0;font-size:14px;color:${meta.color};line-height:1.6;font-weight:600;">${meta.desc}</p>
    </div>
  </td></tr>
  <tr><td style="padding:16px 40px 0;">
    <table width="100%" style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;border-collapse:collapse;">
      <tr>
        <td style="padding:13px 20px;font-size:13px;color:#64748b;font-weight:600;">Shop Name</td>
        <td style="padding:13px 20px;font-size:14px;font-weight:800;color:#1e293b;text-align:right;">${shopName || '—'}</td>
      </tr>
    </table>
  </td></tr>
  ${blocked && reason ? `
  <tr><td style="padding:16px 40px 0;">
    <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:16px 20px;">
      <p style="font-size:11px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">📝 Reason</p>
      <p style="font-size:14px;color:#92400e;margin:0;line-height:1.6;">${reason}</p>
    </div>
  </td></tr>` : ''}
  <tr><td style="padding:28px 40px;text-align:center;">
    <a href="${storeUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#f97316,#f59e0b);color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:700;">Visit ${storeName} →</a>
  </td></tr>
  <tr><td style="padding:0 40px 28px;">
    <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:16px 20px;text-align:center;">
      <p style="font-size:13px;color:#64748b;margin:0;">Questions? Contact us at <a href="mailto:${fromEmail}" style="color:#f97316;font-weight:700;text-decoration:none;">${fromEmail}</a></p>
    </div>
  </td></tr>
  <tr><td style="background:#f8faff;border-top:1.5px solid #edf0f8;padding:20px 40px;text-align:center;">
    <p style="font-size:11px;color:#cbd5e1;margin:0;">© ${year} ${storeName}. All rights reserved.</p>
  </td></tr>
  <tr><td style="background:linear-gradient(90deg,#f97316,#f59e0b,#dc2626);height:4px;"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

export async function sendShopStatusEmail({ to, shopOwnerName, shopName, blocked, reason = '' }) {
  if (!to) throw new Error('Recipient email (to) is required')

  const fromName  = process.env.SMTP_FROM_NAME  || process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

  const subject = blocked
    ? `🚫 Your Shop Has Been Suspended — ${process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'}`
    : `✅ Your Shop Is Back Online — ${process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'}`

  const html = buildHtml({ shopOwnerName, shopName, blocked, reason })
  const text = `Hi ${shopOwnerName || 'Shop Owner'},\n\n${blocked ? `Your shop "${shopName}" has been suspended.` : `Your shop "${shopName}" is active again.`}${reason ? `\n\nReason: ${reason}` : ''}`

  const info = await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  })

  console.log(`[Email] Shop ${blocked ? 'block' : 'unblock'} → ${to} | MsgID: ${info.messageId}`)
  return info
}