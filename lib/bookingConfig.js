export { ACTIVE_STATUSES, BUSY_STATUSES } from "@/models/Booking.model";

export const BOOKING_CONFIG = {
  SEARCH_RADIUS_M: Number(process.env.LABOUR_SEARCH_RADIUS_M) || 10000,
  REQUEST_TTL_MS: (Number(process.env.BOOKING_REQUEST_TTL_SEC) || 120) * 1000,
  LOCATION_FRESH_MS: (Number(process.env.LABOUR_LOCATION_FRESH_SEC) || 300) * 1000,
  MAX_RESULTS: 20,
};

export const DURATION_DAYS = { day: 1, week: 7, month: 30, year: 365 };
export const DURATION_DISCOUNT = { day: 0, week: 0.05, month: 0.1, year: 0.2 };

export const LABOUR_CATEGORIES = [
  "helpers", "masons", "electricians", "plumbers", "carpenters", "painters",
  "tile-experts", "welders", "jcb-operators", "contractors", "engineers",
];

export const isValidMobile = (v) => /^[6-9]\d{9}$/.test(String(v || ""));


