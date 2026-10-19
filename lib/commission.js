export const COMMISSION_PERCENT =
  Number(process.env.PLATFORM_COMMISSION_PERCENT) > 0
    ? Number(process.env.PLATFORM_COMMISSION_PERCENT)
    : 10;

// whole rupees: commission is rounded, labour gets the remainder (no paise lost)
export function calcSplit(fare, percent = COMMISSION_PERCENT) {
  const f = Number(fare) || 0;
  const commission = Math.round((f * percent) / 100);
  return { commission, labourAmount: f - commission, percent };
}