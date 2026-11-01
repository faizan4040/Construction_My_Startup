import sharp from "sharp"

// ---------- Easy settings ----------
const BRAND_NAME = "QuickMason"
const BRAND_URL = "https://your-website.com" // apni website ka link
const SUPPORT_EMAIL = "support@your-website.com" // apna support email
const EXPIRY_TEXT = "1 hour"

// Apni khud ki construction photo lagani ho to link yahan paste karo (1200 x 480 px).
// Khali chhodoge to neeche wala banaya hua construction scene use hoga.
const HERO_IMAGE_URL = ""

// Colors
const ORANGE = "#f97316"
const ORANGE_DARK = "#ea580c"
const YELLOW = "#facc15"
const DARK = "#111827"
const TEXT = "#374151"
const MUTED = "#6b7280"
const BG = "#f3f4f6"

/* =====================================================================
   HERO IMAGE (construction scene, SVG -> PNG)
   ===================================================================== */

const HERO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="240" viewBox="0 0 600 240">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="0.55" stop-color="#7c2d12"/>
      <stop offset="1" stop-color="#f97316"/>
    </linearGradient>
    <pattern id="lat" width="12" height="10" patternUnits="userSpaceOnUse">
      <path d="M0 10 L6 0 L12 10" stroke="#facc15" stroke-width="1.4" fill="none"/>
    </pattern>
    <pattern id="haz" width="20" height="12" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
      <rect width="10" height="12" fill="#facc15"/>
      <rect x="10" width="10" height="12" fill="#111827"/>
    </pattern>
  </defs>

  <rect width="600" height="240" fill="url(#sky)"/>
  <circle cx="330" cy="188" r="62" fill="#fbbf24" opacity="0.35"/>
  <circle cx="330" cy="188" r="38" fill="#fde047" opacity="0.55"/>

  <g fill="#1e293b" opacity="0.85">
    <rect x="285" y="120" width="34" height="90"/>
    <rect x="322" y="100" width="26" height="110"/>
    <rect x="352" y="132" width="40" height="78"/>
    <rect x="488" y="110" width="30" height="100"/>
    <rect x="522" y="134" width="44" height="76"/>
    <rect x="570" y="118" width="30" height="92"/>
  </g>
  <g fill="#facc15" opacity="0.8">
    <rect x="292" y="132" width="5" height="6"/><rect x="304" y="146" width="5" height="6"/>
    <rect x="292" y="162" width="5" height="6"/><rect x="328" y="116" width="5" height="6"/>
    <rect x="336" y="136" width="5" height="6"/><rect x="328" y="158" width="5" height="6"/>
    <rect x="362" y="148" width="5" height="6"/><rect x="376" y="166" width="5" height="6"/>
    <rect x="496" y="126" width="5" height="6"/><rect x="506" y="148" width="5" height="6"/>
    <rect x="532" y="150" width="5" height="6"/><rect x="548" y="170" width="5" height="6"/>
    <rect x="578" y="136" width="5" height="6"/><rect x="586" y="160" width="5" height="6"/>
  </g>

  <rect y="204" width="600" height="36" fill="#0b1220"/>

  <g>
    <rect x="52" y="196" width="196" height="8" fill="#334155"/>
    <g fill="#475569">
      <rect x="62" y="96" width="7" height="102"/>
      <rect x="112" y="96" width="7" height="102"/>
      <rect x="162" y="96" width="7" height="102"/>
      <rect x="212" y="96" width="7" height="102"/>
      <rect x="240" y="96" width="7" height="102"/>
    </g>
    <g fill="#64748b">
      <rect x="56" y="162" width="196" height="7"/>
      <rect x="56" y="128" width="196" height="7"/>
      <rect x="56" y="94" width="196" height="7"/>
    </g>
    <rect x="70" y="170" width="42" height="26" fill="#1f2937"/>
    <rect x="120" y="170" width="42" height="26" fill="#1f2937"/>
    <rect x="70" y="136" width="42" height="26" fill="#1f2937"/>
    <g fill="#facc15" opacity="0.9">
      <rect x="78" y="178" width="10" height="10"/>
      <rect x="130" y="178" width="10" height="10"/>
      <rect x="78" y="144" width="10" height="10"/>
    </g>
    <g stroke="#94a3b8" stroke-width="2">
      <line x1="65" y1="94" x2="65" y2="80"/><line x1="115" y1="94" x2="115" y2="80"/>
      <line x1="165" y1="94" x2="165" y2="80"/><line x1="215" y1="94" x2="215" y2="80"/>
      <line x1="243" y1="94" x2="243" y2="80"/>
    </g>
    <g stroke="#facc15" stroke-width="1.2" fill="none" opacity="0.9">
      <rect x="252" y="100" width="22" height="98"/>
      <line x1="252" y1="100" x2="274" y2="132"/><line x1="274" y1="100" x2="252" y2="132"/>
      <line x1="252" y1="132" x2="274" y2="165"/><line x1="274" y1="132" x2="252" y2="165"/>
      <line x1="252" y1="165" x2="274" y2="198"/><line x1="274" y1="165" x2="252" y2="198"/>
    </g>
  </g>

  <g>
    <polyline points="426,204 438,190 426,176 438,162 426,148 438,134 426,120 438,106 426,92 438,78 426,64"
      fill="none" stroke="#facc15" stroke-width="1.8"/>
    <rect x="425" y="64" width="2.5" height="140" fill="#facc15"/>
    <rect x="436.5" y="64" width="2.5" height="140" fill="#facc15"/>
    <rect x="416" y="200" width="32" height="6" fill="#facc15"/>
    <rect x="422" y="56" width="20" height="10" rx="2" fill="#f97316"/>
    <polygon points="432,34 424,56 440,56" fill="#facc15"/>
    <rect x="232" y="56" width="230" height="10" fill="url(#lat)"/>
    <rect x="232" y="55" width="230" height="2" fill="#facc15"/>
    <rect x="232" y="65" width="230" height="2" fill="#facc15"/>
    <rect x="442" y="56" width="52" height="10" fill="url(#lat)"/>
    <rect x="478" y="66" width="18" height="16" fill="#475569"/>
    <line x1="432" y1="34" x2="240" y2="56" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="432" y1="34" x2="488" y2="56" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="292" y1="66" x2="292" y2="128" stroke="#e2e8f0" stroke-width="1.2"/>
    <rect x="287" y="124" width="10" height="6" fill="#f97316"/>
    <line x1="292" y1="130" x2="274" y2="146" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="292" y1="130" x2="310" y2="146" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="266" y="146" width="52" height="8" fill="#94a3b8"/>
    <rect x="266" y="146" width="52" height="2.5" fill="#cbd5e1"/>
  </g>

  <g>
    <rect x="300" y="190" width="26" height="14" rx="2" fill="#e2e8f0"/>
    <rect x="304" y="194" width="18" height="3" fill="#f97316"/>
    <rect x="328" y="190" width="26" height="14" rx="2" fill="#e2e8f0"/>
    <rect x="332" y="194" width="18" height="3" fill="#f97316"/>
    <rect x="314" y="176" width="26" height="14" rx="2" fill="#cbd5e1"/>
    <rect x="318" y="180" width="18" height="3" fill="#f97316"/>
    <g fill="#c2410c">
      <rect x="360" y="196" width="14" height="8"/><rect x="376" y="196" width="14" height="8"/>
      <rect x="368" y="188" width="14" height="8"/>
    </g>
  </g>

  <rect y="226" width="600" height="14" fill="url(#haz)"/>
</svg>`

/* =====================================================================
   ATTACHMENTS (sirf hero image)
   Naam purana hi rakha hai taaki register/login routes me kuch na badalna pade.
   ===================================================================== */

let cachedAttachments = null

export const getEmailIconAttachments = async () => {
  // Agar apni image ka link diya hai to koi attachment nahi chahiye
  if (HERO_IMAGE_URL) return []

  if (cachedAttachments) return cachedAttachments

  const heroPng = await sharp(Buffer.from(HERO_SVG), { density: 144 })
    .resize(1200, 480)
    .png()
    .toBuffer()

  cachedAttachments = [
    {
      filename: "hero.png",
      content: heroPng,
      contentType: "image/png",
      cid: "hero@quickmason",
      contentDisposition: "inline",
    },
  ]

  return cachedAttachments
}

const heroSrc = HERO_IMAGE_URL || "cid:hero@quickmason"

/* =====================================================================
   TEMPLATE
   ===================================================================== */

export const emailVerificationLink = (link, userName = "") => {
  const greeting = userName ? `Hi ${userName},` : "Hi there,"
  const year = new Date().getFullYear()

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <title>Verify your email - ${BRAND_NAME}</title>
  <style>
    body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    img { border:0; outline:none; text-decoration:none; }
    a { color:${ORANGE_DARK}; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
    @media only screen and (max-width:620px) {
      .container { width:100% !important; }
      .px { padding-left:20px !important; padding-right:20px !important; }
      .h1 { font-size:24px !important; }
      .btn a { display:block !important; }
    }
  </style>
</head>

<body style="margin:0;padding:0;background-color:${BG};">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BG};">
    Verify your email to start building with ${BRAND_NAME}. Link expires in ${EXPIRY_TEXT}.
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${BG}" style="background-color:${BG};">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <table role="presentation" class="container" width="600" border="0" cellpadding="0" cellspacing="0"
          style="width:600px;max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.10);">

          <!-- Brand bar -->
          <tr>
            <td align="center" bgcolor="${DARK}" style="background-color:${DARK};padding:22px 20px;">
              <a href="${BRAND_URL}" target="_blank"
                style="font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:bold;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
                Quick<span style="color:${ORANGE};">Mason</span>
              </a>
            </td>
          </tr>

          <!-- Hero image -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;background-color:${DARK};">
              <img src="${heroSrc}" alt="Construction site" width="600"
                style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="px" style="padding:36px 44px 12px 44px;font-family:Arial,Helvetica,sans-serif;">

              <p style="margin:0 0 10px 0;text-align:center;font-size:12px;letter-spacing:3px;font-weight:bold;color:${ORANGE_DARK};text-transform:uppercase;">
                Almost there
              </p>

              <h1 class="h1" style="margin:0 0 14px 0;font-size:28px;line-height:1.25;color:${DARK};text-align:center;font-weight:800;">
                Verify your email address
              </h1>

              <p style="margin:0 0 8px 0;font-size:16px;line-height:1.6;color:${TEXT};text-align:center;">
                <strong>${greeting}</strong>
              </p>
              <p style="margin:0 0 28px 0;font-size:15px;line-height:1.7;color:${TEXT};text-align:center;">
                Welcome to <strong>${BRAND_NAME}</strong> &mdash; get cement, steel, bricks and all your
                construction materials delivered fast. Tap the button below to confirm your email
                and activate your account.
              </p>

              <!-- Button -->
              <table role="presentation" class="btn" align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" bgcolor="${ORANGE}" style="border-radius:50px;background-color:${ORANGE};">
                    <a href="${link}" target="_blank"
                      style="display:inline-block;padding:16px 54px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:50px;border:1px solid ${ORANGE_DARK};">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry note -->
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td bgcolor="#fff7ed" style="background-color:#fff7ed;border-left:4px solid ${ORANGE};border-radius:8px;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#7c2d12;">
                    <strong>This link expires in ${EXPIRY_TEXT}.</strong>
                    If you did not create an account, you can safely ignore this email.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td class="px" style="padding:26px 44px 0 44px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr><td height="1" bgcolor="#e5e7eb" style="height:1px;background-color:#e5e7eb;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td class="px" style="padding:20px 44px 26px 44px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px 0;font-size:12.5px;line-height:1.6;color:${MUTED};text-align:center;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;text-align:center;word-break:break-all;">
                <a href="${link}" target="_blank" style="color:${ORANGE_DARK};text-decoration:underline;">${link}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="${DARK}" style="background-color:${DARK};padding:26px 24px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 6px 0;font-size:14px;color:#ffffff;font-weight:bold;">
                Thank you,<br />
                <a href="${BRAND_URL}" target="_blank" style="color:${ORANGE};text-decoration:none;">${BRAND_NAME} Team</a>
              </p>
              <p style="margin:10px 0 0 0;font-size:12px;line-height:1.6;color:#9ca3af;">
                Need help? Write to us at
                <a href="mailto:${SUPPORT_EMAIL}" style="color:${YELLOW};text-decoration:none;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin:12px 0 0 0;font-size:11px;color:#6b7280;">
                &copy; ${year} ${BRAND_NAME}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};text-align:center;">
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























// export const emailVerificationLink = (link) => {
//   const html = `
// <!DOCTYPE html>
// <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">

// <head>
//     <title></title>
//     <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
//     <meta content="width=device-width, initial-scale=1.0" name="viewport" />
//     <style>
//         * {
//             box-sizing: border-box;
//         }

//         body {
//             margin: 0;
//             padding: 0;

//         }

//         a[x-apple-data-detectors] {
//             color: inherit !important;
//             text-decoration: inherit !important;
//         }

//         #MessageViewBody a {
//             color: inherit;
//             text-decoration: none;
//         }

//         p {
//             line-height: inherit
//         }

//         .desktop_hide,
//         .desktop_hide table {
//             mso-hide: all;
//             display: none;
//             max-height: 0px;
//             overflow: hidden;
//         }

//         .image_block img+div {
//             display: none;
//         }

//         sup,
//         sub {
//             font-size: 75%;
//             line-height: 0;
//         }

//         @media (max-width:520px) {
//             .desktop_hide table.icons-inner {
//                 display: inline-block !important;
//             }

//             .icons-inner {
//                 text-align: center;
//             }

//             .icons-inner td {
//                 margin: 0 auto;
//             }

//             .mobile_hide {
//                 display: none;
//             }

//             .row-content {
//                 width: 100% !important;
//             }

//             .stack .column {
//                 width: 100%;
//                 display: block;
//             }

//             .mobile_hide {
//                 min-height: 0;
//                 max-height: 0;
//                 max-width: 0;
//                 overflow: hidden;
//                 font-size: 0px;
//             }

//             .desktop_hide,
//             .desktop_hide table {
//                 display: table !important;
//                 max-height: none !important;
//             }
//         }
//     </style>
// </head>

// <body class="body"
//     style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
//     <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"
//         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;" width="100%">
//         <tbody>
//             <tr>
//                 <td>
//                     <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1"
//                         role="presentation"
//                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f5f5f5; padding:50px 0;"
//                         width="100%">
//                         <tbody>
//                             <tr>
//                                 <td>
//                                     <table align="center" border="0" cellpadding="0" cellspacing="0"
//                                         class="row-content stack" role="presentation"
//                                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 500px; margin: 0 auto;"
//                                         width="500">
//                                         <tbody>
//                                             <tr>
//                                                 <td class="column column-1"
//                                                     style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
//                                                     width="100%">
//                                                     <table border="0" cellpadding="0" cellspacing="0"
//                                                         class="image_block block-1" role="presentation"
//                                                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
//                                                         width="100%">
//                                                         <tr>
//                                                             <td class="pad"
//                                                                 style="padding-bottom:5px;padding-left:5px;padding-right:5px;width:100%;">
//                                                                 <div align="center" class="alignment"
//                                                                     style="line-height:10px">
//                                                                     <div style="max-width: 250px;"><img
//                                                                             alt="reset-password" height="auto"
//                                                                             src="https://res.cloudinary.com/do7xdfl3y/image/upload/v1737487850/next-ecommerce/rb_27348_hfzgxd.png"
//                                                                             style="display: block; height: auto; border: 0; width: 100%;"
//                                                                             title="reset-password" width="250" /></div>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                     <table border="0" cellpadding="0" cellspacing="0"
//                                                         class="heading_block block-2" role="presentation"
//                                                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
//                                                         width="100%">
//                                                         <tr>
//                                                             <td class="pad" style="text-align:center;width:100%;">
//                                                                 <h1
//                                                                     style="margin: 0; color: #393d47; direction: ltr; font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 25px; font-weight: normal; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 30px;">
//                                                                     <strong>Email Verification</strong>
//                                                                 </h1>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                     <table border="0" cellpadding="10" cellspacing="0"
//                                                         class="paragraph_block block-3" role="presentation"
//                                                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
//                                                         width="100%">
//                                                         <tr>
//                                                             <td class="pad">
//                                                                 <div
//                                                                     style="color:#393d47;font-family:Tahoma,Verdana,Segoe,sans-serif;font-size:14px;line-height:150%;text-align:center;mso-line-height-alt:21px;">
//                                                                     <p style="margin: 0; word-break: break-word;">We
//                                                                         received a request to verify your identity. Use
//                                                                         the following link to
//                                                                         complete the verification process:</p>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                     <table border="0" cellpadding="10" cellspacing="0"
//                                                         class="heading_block block-4" role="presentation"
//                                                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
//                                                         width="100%">
//                                                         <tr>
//                                                             <td class="pad">
//                                                                 <h4
//                                                                     style="margin: 0; color: #7747FF; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 20px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 45.6px;">

//                                                                     <a href="${link}"
//                                                                         style="background-color: #7747FF;color:white;padding:10px 30px;text-decoration: none; border-radius: 50px;">Verify</a>
//                                                                 </h4>
                                                                
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                     <table border="0" cellpadding="10" cellspacing="0"
//                                                         class="paragraph_block block-3" role="presentation"
//                                                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
//                                                         width="100%">
//                                                         <tr>
//                                                             <td class="pad">
//                                                                 <div
//                                                                     style="color:#393d47;font-family:Tahoma,Verdana,Segoe,sans-serif;font-size:14px;line-height:150%;text-align:center;mso-line-height-alt:21px;">
//                                                                     <p style="margin: 0; word-break: break-word;">If the button above doesn’t work, you can copy and
//                                                                         paste the following link into your browser:</p>
                                                                      
//                                                                         <a href="${link}">${link}</a>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                     <table border="0" cellpadding="0" cellspacing="0"
//                                                         class="paragraph_block block-5" role="presentation"
//                                                         style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
//                                                         width="100%">
//                                                         <tr>
//                                                             <td class="pad"
//                                                                 style="padding-bottom:5px;padding-left:10px;padding-right:10px;padding-top:10px;">
//                                                                 <div
//                                                                     style="color:#393d47;font-family:Tahoma,Verdana,Segoe,sans-serif;font-size:13px;line-height:150%;text-align:center;mso-line-height-alt:19.5px;">
//                                                                     <p style="margin: 10px;"><strong>Note:</strong> This link will expire in 1 hours. If you did not create an account, you can safely ignore this email.</p>
                                                                         
//                                                                     <p style="margin: 0;">Thank you,<br />
                                            
//                                                                     <a href="" target="_blank"> ConstructEzy </a>
//                                                                     </p>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </td>
//             </tr>
//         </tbody>
//     </table>
// </body>

// </html>

//       `;

//   return html;
// };
