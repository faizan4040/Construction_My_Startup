import PlatformSetting from "@/models/PlatformSetting.model";

const num = (v, d) => (Number.isFinite(Number(v)) && v !== "" && v != null ? Number(v) : d);

const defaults = () => {
  const labour = num(process.env.PLATFORM_COMMISSION_PERCENT, 10);
  return {
    labourCommissionPercent: labour,
    serviceCommissionPercent: num(process.env.SERVICE_COMMISSION_PERCENT, labour),
    settlementHoldHours: num(process.env.SETTLEMENT_HOLD_HOURS, 24),
    maxCashDues: num(process.env.MAX_CASH_DUES, 1000),
    minPayout: num(process.env.MIN_PAYOUT, 100),
  };
};

export const SETTING_RULES = {
  labourCommissionPercent: { min: 0, max: 50, label: "Labour commission %" },
  serviceCommissionPercent: { min: 0, max: 50, label: "Service commission %" },
  settlementHoldHours: { min: 0, max: 720, label: "Settlement hold (hours)" },
  maxCashDues: { min: 0, max: 100000, label: "Max cash dues" },
  minPayout: { min: 1, max: 100000, label: "Minimum withdrawal" },
};

const TTL = 30_000;
let cache = null;
let cachedAt = 0;

export async function getSettings(force = false) {
  if (!force && cache && Date.now() - cachedAt < TTL) return cache;
  const doc = await PlatformSetting.findOne({ key: "global" }).lean();
  const out = defaults();
  for (const k of Object.keys(SETTING_RULES)) if (doc && Number.isFinite(doc[k])) out[k] = doc[k];
  out.updatedAt = doc?.updatedAt || null;
  cache = out;
  cachedAt = Date.now();
  return out;
}

export async function updateSettings(patch, adminId) {
  const set = {};
  for (const [k, rule] of Object.entries(SETTING_RULES)) {
    if (patch[k] === undefined || patch[k] === "") continue;
    const v = Number(patch[k]);
    if (!Number.isFinite(v) || v < rule.min || v > rule.max)
      return { error: `${rule.label} must be between ${rule.min} and ${rule.max}` };
    // percentages can have one decimal, money is whole rupees
    set[k] = k.endsWith("Percent") ? Math.round(v * 10) / 10 : Math.round(v);
  }
  if (!Object.keys(set).length) return { error: "nothing to update" };
  await PlatformSetting.updateOne(
    { key: "global" },
    { $set: { ...set, updatedBy: adminId } },
    { upsert: true }
  );
  cache = null;
  return { settings: await getSettings(true) };
}
