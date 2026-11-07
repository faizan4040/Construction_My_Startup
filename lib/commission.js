import { getSettings } from "@/lib/settings";

// legacy constant (env only); new code reads the admin setting via getCommissionPercent()
export const COMMISSION_PERCENT =
  Number(process.env.PLATFORM_COMMISSION_PERCENT) >= 0 && process.env.PLATFORM_COMMISSION_PERCENT !== undefined
    ? Number(process.env.PLATFORM_COMMISSION_PERCENT)
    : 10;

// whole rupees: commission is rounded, labour gets the remainder (no paise lost)
export function calcSplit(fare, percent = COMMISSION_PERCENT) {
  const f = Number(fare) || 0;
  const commission = Math.round((f * percent) / 100);
  return { commission, labourAmount: f - commission, percent };
}

export async function getCommissionPercent(kind = "labour") {
  const s = await getSettings();
  return kind === "service" ? s.serviceCommissionPercent : s.labourCommissionPercent;
}

// live labour job, using the commission the admin has set right now
export async function calcSplitLive(fare) {
  return calcSplit(fare, await getCommissionPercent("labour"));
}

// scheduled service job: customer paid price + fee. Platform keeps the whole fee
// plus a commission on the price; labour gets the rest of the price.
export async function calcServiceSplit({ price, fee, total }) {
  const percent = await getCommissionPercent("service");
  const cut = Math.round(((Number(price) || 0) * percent) / 100);
  const labourAmount = Math.max(0, (Number(price) || 0) - cut);
  return { percent, labourAmount, commission: (Number(total) || 0) - labourAmount };
}
