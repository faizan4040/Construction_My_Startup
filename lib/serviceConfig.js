export const SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
export const SLOT_CAPACITY = Number(process.env.SERVICE_SLOT_CAPACITY ?? 3);
export const FEE_PERCENT = Number(process.env.SERVICE_FEE_PERCENT ?? 6);
export const MAX_DAYS_AHEAD = 60;
export const ACTIVE = ["pending_payment", "pending", "confirmed", "assigned", "in_progress"];
export const SERVICE_TYPES = ["Repair & Maintenance", "Installation", "New Construction", "Renovation"];
export const ICON_NAMES = [
  "Wrench", "Zap", "PaintRoller", "Hammer", "Wind", "House", "Settings", "HardHat", "ShieldCheck",
  "Bug", "Sparkles", "Drill", "Ruler", "Lightbulb", "Fan", "Layers", "Droplet", "Construction",
];

export const calcTotal = (price) => {
  const fee = Math.round((price * FEE_PERCENT) / 100);
  return { price, fee, total: price + fee };
};

const IST = 5.5 * 3600e3;
export const istToday = () => new Date(Date.now() + IST).toISOString().slice(0, 10);
export const istHour = () => new Date(Date.now() + IST).getUTCHours();
export const addDays = (ymd, n) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const slotHour24 = (label) => {
  const [t, ap] = label.split(" ");
  let h = Number(t.split(":")[0]);
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h;
};