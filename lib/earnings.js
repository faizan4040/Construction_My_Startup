import Booking from "@/models/Booking.model";

const IST = 5.5 * 3600e3;
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// last 7 IST days, missing days = 0 (chart components expect exactly this shape)
export async function last7Days(match, field) {
  const today = new Date(Date.now() + IST);
  today.setUTCHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() - (6 - i) * 864e5));
  const from = new Date(days[0].getTime() - IST);

  const rows = await Booking.aggregate([
    { $match: { ...match, bookingStatus: "completed", closedAt: { $gte: from } } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$closedAt", timezone: "Asia/Kolkata" } },
        sum: { $sum: `$${field}` } } },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.sum]));
  return days.map((d) => ({
    date: `${String(d.getUTCDate()).padStart(2, "0")} ${MON[d.getUTCMonth()]}`,
    earnings: map.get(d.toISOString().slice(0, 10)) || 0,
  }));
}