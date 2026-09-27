// Haversine formula — do lat/lng points ke beech straight-line distance (km me)
export function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null

  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ETA estimate — city traffic + stops ke hisaab se average 22km/h maana
// (Zomato/Swiggy bhi isi range ka average use karte hain two-wheeler delivery ke liye)
export function estimateEtaMinutes(distanceKm, avgSpeedKmh = 22) {
  if (distanceKm == null) return null
  const hours = distanceKm / avgSpeedKmh
  return Math.max(2, Math.round(hours * 60)) // minimum 2 min dikhayenge, 0 ajeeb lagta hai
}

export function formatDistance(km) {
  if (km == null) return "—"
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}