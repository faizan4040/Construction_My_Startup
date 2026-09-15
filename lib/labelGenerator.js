import JsBarcode from "jsbarcode"
import QRCode from "qrcode"
import { createCanvas } from "canvas"

export function generateLabelCode(orderId, productId) {
  const shortProduct = String(productId).slice(-6).toUpperCase()
  return `CEZ-${orderId}-${shortProduct}`
}

export function generateBarcodePNG(code, { width = 2, height = 60 } = {}) {
  const canvas = createCanvas()
  JsBarcode(canvas, code, {
    format: "CODE128",
    width,
    height,
    displayValue: false,
    margin: 4,
  })
  return canvas.toBuffer("image/png")
}

export async function generateQRCodePNG(trackingUrl) {
  return await QRCode.toBuffer(trackingUrl, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 300,
  })
}

export function buildLabelHTML({ order, item, barcodeBase64, qrBase64, shop = {} }) {
  const {
    shopName = "CONSTRUCTEZY",
    shopAddress = "ConstructEzy Technologies Pvt. Ltd., Registered Office",
    gstin = "[GSTIN TO BE ADDED]",
  } = shop

  const regNumber = String(order._id || order.order_id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20).toUpperCase()

  const createdDate = new Date(order.createdAt)
  const hbd = createdDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }).replace("/", " - ")
  const cpdDate = new Date(createdDate)
  cpdDate.setDate(cpdDate.getDate() + 2)
  const cpd = cpdDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }).replace("/", " - ")

  const printedAt = new Date().toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
  const printedDate = new Date().toLocaleDateString("en-GB")

  const routeCode = [order.state, order.city]
    .filter(Boolean)
    .map((s) => String(s).slice(0, 3).toUpperCase())
    .join("/")

  const isCod = order.paymentMode === "cod"
  const paymentBadge = isCod ? "COD" : "PREPAID"

  const unitPrice = Number(item.sellingPrice) || 0
  const qty = Number(item.qty) || 0
  const itemTotal = unitPrice * qty
  const formatINR = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Shipping Label — ${order.order_id}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #eceef1;
    font-family: Arial, Helvetica, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 10px;
    min-height: 100vh;
  }

  .label {
    width: 100%;
    max-width: 460px;
    background: #fff;
    border: 2.5px solid #000;
    color: #000;
    overflow: hidden;
  }

  .border-b { border-bottom: 2px solid #000; }
  .border-r { border-right: 2px solid #000; }

  .header { display: flex; align-items: stretch; }
  .reg-cell {
    flex: 0 0 auto;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: clamp(16px, 4vw, 20px);
  }
  .header-mid { flex: 1 1 auto; min-width: 0; padding: 8px 12px; }
  .header-mid .logistics { font-weight: 800; font-size: clamp(14px, 3.6vw, 18px); word-break: break-word; }
  .header-mid .regno { font-size: clamp(10px, 2.8vw, 13px); letter-spacing: 0.4px; margin-top: 3px; word-break: break-all; }
  .header-right { flex: 0 0 auto; width: 62%; max-width: 185px; display: flex; flex-direction: column; }
  .header-right .brand { padding: 8px 10px; font-weight: 800; font-size: clamp(13px, 3.4vw, 17px); text-align: center; word-break: break-word; }
  .header-right .prepaid { padding: 6px 10px; font-weight: 700; font-size: clamp(11px, 3vw, 14px); text-align: center; border-top: 2px solid #000; }

  .middle { display: flex; align-items: stretch; }

  .left-col {
    flex: 0 0 auto;
    width: 42%;
    max-width: 190px;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }

  .ordered-through { font-size: clamp(11px, 3vw, 13px); margin-bottom: 8px; }
  .logo-block { display: flex; align-items: center; gap: 6px; }
  .logo-mark {
    flex-shrink: 0;
    width: 26px; height: 26px;
    border: 2.5px solid #000; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 13px;
  }
  .logo-text-wrap { min-width: 0; }
  .logo-text { font-size: clamp(13px, 3.4vw, 17px); font-weight: 800; line-height: 1.1; word-break: break-word; }
  .logo-sub { font-size: 7px; letter-spacing: 1px; color: #333; margin-top: 1px; }

  .vertical-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1 1 auto;
    min-height: 190px;
  }

  .v-box {
    flex: 0 0 auto;
    width: 20px;
    height: 190px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .v-box span {
    position: absolute;
    display: inline-block;
    white-space: nowrap;
    transform: rotate(-90deg);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
  }

  .v-barcode-box {
    flex: 0 0 auto;
    width: 44px;
    height: 190px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .v-barcode-box img {
    position: absolute;
    width: 180px;
    height: 40px;
    transform: rotate(-90deg);
  }

  .dates-block { font-size: clamp(11px, 3vw, 13px); line-height: 1.8; }

  .right-col { flex: 1 1 auto; display: flex; flex-direction: column; min-width: 0; }
  .qr-box {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px;
  }
  .qr-box img { width: 100%; max-width: 190px; height: auto; display: block; }

  .address-box { padding: 10px 12px 14px; min-width: 0; }
  .address-title { font-size: clamp(11px, 3vw, 13px); font-weight: 700; margin-bottom: 6px; }
  .address-line { font-size: clamp(11px, 3vw, 12.5px); line-height: 1.6; word-break: break-word; }
  .address-line b { font-weight: 700; }

  .soldby-box { padding: 10px 12px; font-size: clamp(10.5px, 2.8vw, 12px); line-height: 1.6; word-break: break-word; }
  .soldby-box b { font-weight: 700; }
  .gstin { margin-top: 5px; }

  table.sku { width: 100%; border-collapse: collapse; font-size: clamp(10px, 2.6vw, 11.5px); table-layout: fixed; }
  table.sku th, table.sku td { border-top: 2px solid #000; padding: 7px 6px; text-align: left; word-break: break-word; }
  table.sku th.num, table.sku td.num { width: 22px; border-right: 2px solid #000; text-align: center; }
  table.sku th.qty, table.sku td.qty { width: 34px; border-left: 2px solid #000; text-align: center; }
  table.sku th.price, table.sku td.price,
  table.sku th.amount, table.sku td.amount { width: 68px; border-left: 2px solid #000; text-align: right; white-space: nowrap; }
  table.sku th { font-weight: 700; }
  table.sku td.amount { font-weight: 700; }

  .total-box {
    display: flex;
    justify-content: flex-end;
    padding: 8px 12px;
    font-size: clamp(12px, 3.2vw, 14px);
    font-weight: 800;
    gap: 10px;
  }
  .total-box .cod-note {
    flex: 1;
    font-size: clamp(9.5px, 2.6vw, 11px);
    font-weight: 700;
    text-align: left;
    align-self: center;
  }

  .orderref-box { padding: 10px 12px; }
  .orderref-text { font-size: clamp(11px, 3vw, 13px); margin-bottom: 8px; word-break: break-all; }
  .footer-barcode { text-align: center; width: 100%; overflow: hidden; }
  .footer-barcode img { width: 100%; max-width: 100%; height: 45px; object-fit: contain; }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px;
    padding: 8px 12px;
    font-size: clamp(9.5px, 2.6vw, 11px);
    font-weight: 700;
  }

  /* ══ ACTION BUTTONS ══ */
  .no-print {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .no-print button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 24px;
    font-size: 14px;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: #fff;
  }
  .no-print button svg { width: 16px; height: 16px; flex-shrink: 0; }
  .no-print button.print-btn { background: #111; }
  .no-print button.download-btn { background: #155b2c; }
  .no-print button:disabled { opacity: 0.6; cursor: not-allowed; }

  @media print {
    body { background: #fff; padding: 0; min-height: 0; }
    .label { border-width: 2px; }
    .no-print { display: none; }
  }

  @media (max-width: 360px) {
    .left-col { width: 38%; padding: 10px 6px; }
    .v-box { width: 16px; height: 160px; }
    .v-barcode-box { width: 38px; height: 160px; }
    .v-barcode-box img { width: 150px; height: 32px; }
    .v-box span { font-size: 9px; }
    .vertical-strip { min-height: 160px; }
    table.sku th.price, table.sku td.price,
    table.sku th.amount, table.sku td.amount { width: 56px; }
  }
</style>
</head>
<body>

  <div class="label" id="label-root">

    <div class="header border-b">
      <div class="reg-cell border-r">REG</div>
      <div class="header-mid border-r">
        <div class="logistics">ConstructEzy Logistics</div>
        <div class="regno">${regNumber}</div>
      </div>
      <div class="header-right">
        <div class="brand border-b">CONSTRUCTEZY</div>
        <div class="prepaid">${paymentBadge}</div>
      </div>
    </div>

    <div class="middle border-b">
      <div class="left-col border-r">
        <div>
          <div class="ordered-through">Ordered through</div>
          <div class="logo-block">
            <div class="logo-mark">C</div>
            <div class="logo-text-wrap">
              <div class="logo-text">ConstructEzy</div>
              <div class="logo-sub">BUILD BETTER, EASIER</div>
            </div>
          </div>
        </div>

        <div class="vertical-strip">
          <div class="v-box"><span>${routeCode || "N/A"}</span></div>
          <div class="v-barcode-box">
            <img src="data:image/png;base64,${barcodeBase64}" alt="AWB barcode" />
          </div>
          <div class="v-box"><span>AWB No. ${item.labelCode}</span></div>
        </div>

        <div class="dates-block">
          <div>HBD: ${hbd}</div>
          <div>CPD: ${cpd}</div>
        </div>
      </div>

      <div class="right-col">
        <div class="qr-box border-b">
          <img src="data:image/png;base64,${qrBase64}" alt="QR code" />
        </div>
        <div class="address-box">
          <div class="address-title">Shipping/Customer address:</div>
          <div class="address-line"><b>Name:</b> ${order.name}</div>
          <div class="address-line"><b>Address:</b> ${order.address}${order.landmark ? ", " + order.landmark : ""}</div>
          <div class="address-line"><b>City:</b> ${order.city}</div>
          <div class="address-line"><b>State:</b> ${order.state} - <b>${order.pincode}</b>, ${order.country}</div>
        </div>
      </div>
    </div>

    <div class="soldby-box border-b">
      <div><b>Sold By:</b> ${shopName}</div>
      <div>${shopAddress}</div>
      <div class="gstin"><b>GSTIN:</b> ${gstin}</div>
    </div>

    <table class="sku">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>SKU ID</th>
          <th class="qty">QTY</th>
          <th class="price">Price</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="num">1</td>
          <td>${item.labelCode} | ${item.name}</td>
          <td class="qty">${qty}</td>
          <td class="price">${formatINR(unitPrice)}</td>
          <td class="amount">${formatINR(itemTotal)}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box border-b">
      ${isCod ? `<div class="cod-note">Amount to be collected on delivery</div>` : ""}
      <div>Total: ${formatINR(itemTotal)}</div>
    </div>

    <div class="orderref-box border-b">
      <div class="orderref-text">Order Ref No.: ${order.order_id}</div>
      <div class="footer-barcode">
        <img src="data:image/png;base64,${barcodeBase64}" alt="Order barcode" />
      </div>
    </div>

    <div class="footer">
      <span>Not for resale.</span>
      <span>Printed at ${printedAt} hrs, ${printedDate}</span>
    </div>

  </div>

  <div class="no-print">
    <button class="print-btn" onclick="window.print()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Print Label
    </button>
    <button class="download-btn" id="download-btn" onclick="downloadLabel()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span id="download-btn-text">Download PDF</span>
    </button>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script>
    async function downloadLabel() {
      const btnRow = document.querySelector('.no-print');
      const btn = document.getElementById('download-btn');
      const btnText = document.getElementById('download-btn-text');
      const label = document.getElementById('label-root');

      btn.disabled = true;
      btnText.textContent = 'Preparing...';
      btnRow.style.visibility = 'hidden'; // hide but keep layout, avoids reflow

      try {
        const canvas = await html2canvas(label, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
        });

        // ── Convert canvas pixel size to mm, then build a PDF page
        // exactly that size — this is what stops content from being
        // cut off, since the page always matches the actual content ──
        const scale = 3;
        const pxToMm = (px) => (px / scale) * (25.4 / 96);
        const pdfWidth = pxToMm(canvas.width);
        const pdfHeight = pxToMm(canvas.height);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          unit: 'mm',
          format: [pdfWidth, pdfHeight],
          orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('label-${order.order_id}-${item.labelCode}.pdf');
      } catch (e) {
        alert('Could not generate PDF. Please try Print instead.');
      } finally {
        btn.disabled = false;
        btnText.textContent = 'Download PDF';
        btnRow.style.visibility = 'visible';
      }
    }
  </script>

</body>
</html>`
}