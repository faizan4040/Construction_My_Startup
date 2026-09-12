import { MATERIALS, QUALITY_TIERS, getCityMultiplier } from "./data";

const SQM_TO_SQFT = 10.7639;

export function toSqFt(area, unit) {
  const n = Number(area) || 0;
  return unit === "sqm" ? n * SQM_TO_SQFT : n;
}

/**
 * Build the full line-item breakdown for a given area / city.
 * @param {number} areaSqFt built-up area in square feet
 * @param {string} city selected city name
 * @param {string} globalTier default quality tier ("basic" | "medium" | "premium")
 * @param {Record<string,string>} overrides per-material tier overrides
 */
export function buildEstimate(areaSqFt, city, globalTier, overrides = {}) {
  const cityMultiplier = getCityMultiplier(city);

  const rows = MATERIALS.map((m) => {
    const tier = overrides[m.id] || globalTier;
    const qualityMultiplier = QUALITY_TIERS[tier].multiplier;
    const qty = areaSqFt * m.qtyPerSqft;
    const cost = qty * m.rate * cityMultiplier * qualityMultiplier;
    return { ...m, tier, qty, cost };
  });

  const total = rows.reduce((sum, r) => sum + r.cost, 0);
  const perSqFt = areaSqFt > 0 ? total / areaSqFt : 0;

  return { rows, total, perSqFt, cityMultiplier, areaSqFt };
}

/** Total cost at each of the three tiers, ignoring per-row overrides —
 * used for the "Basic / Medium / Premium" comparison cards. */
export function tierTotals(areaSqFt, city) {
  const cityMultiplier = getCityMultiplier(city);
  const totals = {};
  for (const tierKey of Object.keys(QUALITY_TIERS)) {
    const qualityMultiplier = QUALITY_TIERS[tierKey].multiplier;
    totals[tierKey] = MATERIALS.reduce((sum, m) => {
      const qty = areaSqFt * m.qtyPerSqft;
      return sum + qty * m.rate * cityMultiplier * qualityMultiplier;
    }, 0);
  }
  return totals;
}

export function formatINR(value, { decimals = 0 } = {}) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value || 0);
}

export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value || 0);
}

/** Compact "₹1.44 Cr" / "₹17.2 L" style formatting for headline totals. */
export function formatCompactINR(value) {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)} L`;
  return formatINR(value);
}