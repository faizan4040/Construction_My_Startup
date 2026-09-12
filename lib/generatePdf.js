import { formatNumber } from "./calculate";

// ---- Palette ------------------------------------------------------------
const BRAND_GREEN = [21, 91, 44];
const BRAND_GOLD = [199, 144, 21];
const TEXT_DARK = [26, 26, 26];
const TEXT_GRAY = [110, 110, 110];
const TEXT_LIGHT_GRAY = [150, 150, 150];
const SUBTITLE_BLUE = [70, 95, 145];
const LINE_GRAY = [228, 224, 212];

/**
 * jsPDF's built-in "helvetica" font only supports WinAnsi encoding — it
 * does NOT contain the ₹ (U+20B9) glyph, or emoji like ⚡ (U+26A1). Either
 * one prints as a broken/wrong character (that's the "¹" you were seeing
 * next to every number). Rather than depend on embedding a custom
 * Unicode font (adds real weight to the bundle), every amount in this
 * file is formatted with a plain "Rs." prefix — guaranteed to render
 * correctly everywhere, on every OS/printer, with zero extra setup.
 *
 * If you specifically want the real ₹ glyph later, say so and I'll wire
 * in a proper embedded Unicode font (e.g. Noto Sans) via
 * doc.addFileToVFS/doc.addFont — that's a bigger, one-time change.
 */
function pdfMoney(amount) {
  return "Rs. " + Math.round(amount).toLocaleString("en-IN");
}

/**
 * Resolves a logo into a base64 data URL jsPDF can embed with addImage().
 * Accepts a plain string path/URL, or a Next.js static-import object
 * ({ src, width, height }). Never throws — returns null on any failure
 * so the caller can fall back to the vector mark below.
 */
async function loadImageAsDataUrl(source) {
  if (!source) return null;
  const url = typeof source === "string" ? source : source.src;
  if (!url) return null;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("[downloadEstimatePdf] Could not load logo, using the vector mark instead:", err);
    return null;
  }
}

/**
 * Draws a small rounded-square logo mark with the brand's first letter,
 * used whenever no real logo image is available. Built entirely from
 * vector shapes + a plain ASCII letter, so — unlike an emoji glyph —
 * it can never render as a broken character.
 */
function drawLogoMark(doc, x, y, size, brandName) {
  const letter = (brandName || "B").trim().charAt(0).toUpperCase();
  doc.setFillColor(...BRAND_GREEN);
  doc.roundedRect(x, y, size, size, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size * 0.58);
  doc.setTextColor(255, 255, 255);
  doc.text(letter, x + size / 2, y + size / 2 + size * 0.19, { align: "center" });
}

/**
 * Generates and downloads a real, itemised PDF estimate — client-side,
 * no server round-trip. Layout is wrap-safe: long city/state names,
 * varying row counts and multi-digit totals never break the alignment.
 *
 * @param {Object} params
 * @param {string} params.city
 * @param {string} [params.state]
 * @param {number} params.areaSqFt      - built-up area converted to sq.ft
 * @param {string} params.areaUnit      - 'sqft' | 'sqm' (only affects the label)
 * @param {number} params.areaInput     - the raw number the user typed
 * @param {string} params.tier          - 'basic' | 'medium' | 'premium'
 * @param {Array}  params.rows          - [{ name, qty, unit, displayQtyAsArea, cost }]
 * @param {number} params.total
 * @param {number} params.perSqFt
 * @param {string} [params.brandName]   - defaults to "ConstructEzy"
 * @param {string} [params.domain]      - shown in the footer, e.g. "construct-ezy.com"
 * @param {string|{src:string}} [params.logoUrl] - pass IMAGES.logo here; falls
 *   back to the vector mark automatically if this is missing or fails to load
 */
export async function downloadEstimatePdf({
  city,
  state,
  areaSqFt,
  areaUnit,
  areaInput,
  tier,
  rows,
  total,
  perSqFt,
  brandName = "ConstructEzy",
  domain = "construct-ezy.com",
  logoUrl,
}) {
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default || autoTableModule;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = 50;

  // ---- Logo (real image if it loads, otherwise the vector mark) --------
  const LOGO_SIZE = 24;
  const logoDataUrl = await loadImageAsDataUrl(logoUrl);
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", margin, y - 18, LOGO_SIZE, LOGO_SIZE);
    } catch {
      drawLogoMark(doc, margin, y - 18, LOGO_SIZE, brandName);
    }
  } else {
    drawLogoMark(doc, margin, y - 18, LOGO_SIZE, brandName);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...BRAND_GREEN);
  doc.text(brandName, margin + LOGO_SIZE + 8, y);

  // ---- Top-right: label + date -----------------------------------------
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_GRAY);
  doc.text("Construction Cost Estimate", pageWidth - margin, y - 9, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(dateStr, pageWidth - margin, y + 6, { align: "right" });

  // ---- Green divider ------------------------------------------------
  y += 20;
  doc.setDrawColor(...BRAND_GREEN);
  doc.setLineWidth(1.75);
  doc.line(margin, y, pageWidth - margin, y);
  y += 34;

  // ---- Subject line (wraps to 2 lines automatically for long names) ----
  const areaLabel = `${formatNumber(areaInput)} ${areaUnit === "sqm" ? "sq.m" : "sq ft"}`;
  const locationLabel = `${city}${state ? ", " + state : ""}`;
  const subjectText = `Estimate for a ${areaLabel} home in ${locationLabel}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...TEXT_DARK);
  const subjectLines = doc.splitTextToSize(subjectText, contentWidth);
  doc.text(subjectLines, margin, y);
  y += subjectLines.length * 19;

  const tierLabel = (tier || "medium").charAt(0).toUpperCase() + (tier || "medium").slice(1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...SUBTITLE_BLUE);
  doc.text(`${tierLabel} quality \u00B7 indicative planning estimate`, margin, y);

  y += 36;

  // ---- Totals row: big cost (left) + per-sq.ft (right) -----------------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_LIGHT_GRAY);
  doc.text("TOTAL ESTIMATED COST", margin, y);
  doc.text("COST PER SQ FT", pageWidth - margin, y, { align: "right" });

  y += 28;
  // Shrink the big total's font a touch for very large numbers (7+ digits)
  // so it never runs into the per-sq.ft figure on the right.
  const totalStr = pdfMoney(total);
  const bigFontSize = totalStr.length > 13 ? 22 : 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(bigFontSize);
  doc.setTextColor(...BRAND_GOLD);
  doc.text(totalStr, margin, y);

  doc.setFontSize(16);
  doc.setTextColor(...TEXT_LIGHT_GRAY);
  doc.text(pdfMoney(perSqFt), pageWidth - margin, y, { align: "right" });

  y += 26;

  // ---- Material table ----------------------------------------------
  autoTable(doc, {
    startY: y,
    head: [["MATERIAL", "QUANTITY", "AMOUNT"]],
    body: rows.map((r) => [
      r.name,
      `${formatNumber(r.qty, r.qty < 10 ? 2 : 0)} ${r.displayQtyAsArea ? "sq ft" : r.unit}`,
      pdfMoney(r.cost),
    ]),
    foot: [["Total", "", pdfMoney(total)]],
    showFoot: "lastPage",
    theme: "plain",
    styles: {
      fontSize: 9.5,
      cellPadding: { top: 8, bottom: 8, left: 4, right: 4 },
      textColor: TEXT_DARK,
      lineColor: LINE_GRAY,
      lineWidth: 0.5,
      overflow: "linebreak",
    },
    headStyles: {
      textColor: TEXT_LIGHT_GRAY,
      fontStyle: "bold",
      fontSize: 8.5,
      lineWidth: { bottom: 0.75 },
      lineColor: [190, 190, 190],
    },
    bodyStyles: {
      lineWidth: { bottom: 0.5 },
    },
    footStyles: {
      textColor: TEXT_DARK,
      fontStyle: "bold",
      fontSize: 11,
      lineWidth: { top: 1.5 },
      lineColor: BRAND_GREEN,
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: "auto", textColor: BRAND_GREEN, fontStyle: "bold" },
      1: { cellWidth: 150, textColor: TEXT_GRAY },
      2: { cellWidth: 110, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin, top: margin, bottom: 64 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_LIGHT_GRAY);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 24,
        { align: "right" }
      );
    },
  });

  const finalY = doc.lastAutoTable.finalY + 26;

  // ---- Footer disclaimer (wraps safely at any width) --------------------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_GRAY);
  const disclaimer =
    "Prices are an indicative planning estimate, accurate to about \u00B110%, and exclude GST, land and approvals. " +
    "Final cost depends on quality choices, site conditions, design complexity and live market rates. " +
    `Generated by the ${brandName} Construction Cost Calculator \u00B7 ${domain}`;
  doc.text(doc.splitTextToSize(disclaimer, contentWidth), margin, finalY);

  const fileCity = (city || "estimate").replace(/\s+/g, "-").toLowerCase();
  doc.save(`${brandName}-Construction-Estimate-${fileCity}.pdf`);
}