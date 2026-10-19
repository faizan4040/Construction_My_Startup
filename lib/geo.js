// lib/geo.js
// Helpers: geocoding (OpenStreetMap Nominatim), GPS, distance and delivery-time calculation.

export const COUNTRY_CODES = "in" // search only inside India
export const SERVICE_RADIUS_KM = 15 // beyond this distance from the nearest shop => "not available"
export const PREP_MINUTES = 8 // packing time at the shop
export const MINUTES_PER_KM = 3.5 // riding time per km
export const MIN_MINUTES = 10 // never show less than this
export const DEFAULT_MAP_CENTER = { lat: 22.9734, lng: 78.6569, zoom: 5 } // India

export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/* ── Distance (km) between two lat/lng points ── */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/* ── Delivery time from distance: prep time + riding time ── */
export function calcEtaMinutes(distanceKm) {
  if (!Number.isFinite(distanceKm)) return null
  return Math.max(MIN_MINUTES, Math.round(PREP_MINUTES + distanceKm * MINUTES_PER_KM))
}

export function formatEta(minutes) {
  if (minutes == null) return ""
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h} hr ${m} mins` : `${h} hr`
  }
  return `${minutes} mins`
}

/* ── Nominatim response -> our address shape ── */
export function parseNominatim(d) {
  const a = d.address || {}
  const road = a.road || a.pedestrian || a.footway || a.residential || ""
  const area = a.suburb || a.neighbourhood || a.quarter || a.city_district || a.village || ""
  const city = a.city || a.town || a.village || a.county || a.state_district || ""
  const short = [...new Set([area || road, city].filter(Boolean))].join(", ")
  return {
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
    title: road || area || city || "Selected location",
    short: short || d.display_name?.split(",").slice(0, 2).join(",") || "Selected location",
    fullAddress: d.display_name || "",
    house: a.house_number || "",
    area,
    city,
    state: a.state || "",
    pincode: a.postcode || "",
  }
}

export async function reverseGeocode(lat, lng, signal) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&zoom=18&accept-language=en`,
    { signal }
  )
  if (!res.ok) throw new Error("Reverse geocoding failed")
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return parseNominatim(data)
}

export async function searchPlaces(query, signal) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=${COUNTRY_CODES}&accept-language=en&q=${encodeURIComponent(query)}`,
    { signal }
  )
  if (!res.ok) throw new Error("Search failed")
  const data = await res.json()
  return data.map((d) => ({ ...parseNominatim(d), id: `osm-${d.place_id}` }))
}

/* ── GPS: keep listening for a few seconds and use the most accurate reading ── */
export function getBestPosition({ goodEnough = 30, maxWait = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject({ code: 0, message: "Geolocation not supported" })
      return
    }
    let best = null
    let done = false
    let watchId = null
    let timer = null

    const finish = (fn) => {
      if (done) return
      done = true
      clearTimeout(timer)
      if (watchId != null) navigator.geolocation.clearWatch(watchId)
      fn()
    }
    const toResult = (pos) => ({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    })

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos
        if (pos.coords.accuracy <= goodEnough) finish(() => resolve(toResult(best)))
      },
      (err) => finish(() => (best ? resolve(toResult(best)) : reject(err))),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    )
    timer = setTimeout(
      () => finish(() => (best ? resolve(toResult(best)) : reject({ code: 3, message: "Timeout" }))),
      maxWait
    )
  })
}

/* ── One-line text for an address (house + building + area) ── */
export function addressLine(a) {
  if (!a) return ""
  const own = [a.house, a.building].filter(Boolean).join(", ")
  const place = a.short || a.fullAddress || ""
  return [own, place].filter(Boolean).join(", ")
}