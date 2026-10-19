// hooks/useDeliveryLocation.js
'use client'
import { useCallback, useEffect, useRef, useState } from "react"
import { calcEtaMinutes, haversineKm, makeId, SERVICE_RADIUS_KM } from "@/lib/geo"

const ACTIVE_KEY = "delivery_location_v2"
const SAVED_KEY = "saved_addresses_v1"
const REFRESH_MS = 2 * 60 * 1000 // re-check nearest shop + time every 2 minutes

/**
 * status: "idle" | "checking" | "ok" | "unserviceable" | "error"
 * Expects POST /api/labor/nearest  { latitude, longitude, city }
 *   -> 200 { name, distance (km), rating, latitude?, longitude? }
 *   -> 404 (or empty body) when no shop is available near that point
 */
export function useDeliveryLocation() {
  const [active, setActive] = useState(null)
  const [saved, setSaved] = useState([])
  const [status, setStatus] = useState("idle")
  const [shop, setShop] = useState(null)
  const [etaMinutes, setEtaMinutes] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  const reqRef = useRef(0)
  const etaRef = useRef(null)
  const firstRunRef = useRef(true)

  useEffect(() => {
    etaRef.current = etaMinutes
  }, [etaMinutes])

  /* Restore after refresh */
  useEffect(() => {
    try {
      const a = JSON.parse(window.localStorage.getItem(ACTIVE_KEY) || "null")
      const s = JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]")
      if (Array.isArray(s)) setSaved(s)
      if (a?.active?.lat != null) {
        setActive(a.active)
        setShop(a.shop || null)
        setEtaMinutes(a.etaMinutes ?? null)
        etaRef.current = a.etaMinutes ?? null
        setStatus(a.etaMinutes != null ? "ok" : "idle")
      }
    } catch (e) {
      console.log("Could not read saved location:", e)
    }
    setHydrated(true)
  }, [])

  /* Persist */
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
    } catch {}
  }, [hydrated, saved])

  useEffect(() => {
    if (!hydrated) return
    try {
      if (!active) window.localStorage.removeItem(ACTIVE_KEY)
      else window.localStorage.setItem(ACTIVE_KEY, JSON.stringify({ active, shop, etaMinutes }))
    } catch {}
  }, [hydrated, active, shop, etaMinutes])

  /* Reset derived data when there is no active location */
  useEffect(() => {
    if (hydrated && !active) {
      setStatus("idle")
      setShop(null)
      setEtaMinutes(null)
    }
  }, [hydrated, active])

  /* Find nearest shop and calculate delivery time */
  const check = useCallback(async (addr, { silent = false } = {}) => {
    const id = ++reqRef.current
    if (!silent) setStatus("checking")

    const unserviceable = () => {
      setShop(null)
      setEtaMinutes(null)
      setStatus("unserviceable")
    }

    try {
      const res = await fetch("/api/labor/nearest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: addr.lat, longitude: addr.lng, city: addr.city || "" }),
      })
      if (id !== reqRef.current) return
      if (res.status === 404) return unserviceable()
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (id !== reqRef.current) return
      if (!data) return unserviceable()

      let distance = Number(data.distance)
      if (!Number.isFinite(distance)) {
        const sLat = Number(data.latitude ?? data.lat)
        const sLng = Number(data.longitude ?? data.lng)
        if (Number.isFinite(sLat) && Number.isFinite(sLng)) {
          distance = haversineKm(addr.lat, addr.lng, sLat, sLng)
        }
      }
      if (!Number.isFinite(distance)) throw new Error("No distance in response")
      if (distance > SERVICE_RADIUS_KM) return unserviceable()

      setShop({ ...data, distance })
      setEtaMinutes(calcEtaMinutes(distance))
      setStatus("ok")
    } catch (e) {
      if (id !== reqRef.current) return
      console.log("Nearest shop check failed:", e)
      if (!silent) {
        setShop(null)
        setEtaMinutes(null)
      }
      setStatus((prev) => (silent && prev === "ok" ? "ok" : "error"))
    }
  }, [])

  /* Re-check whenever the delivery point changes */
  useEffect(() => {
    if (!hydrated || !active) return
    const silent = firstRunRef.current && etaRef.current != null
    firstRunRef.current = false
    check(active, { silent })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, active?.lat, active?.lng, check])

  /* Keep time fresh (nearest shop can change, e.g. a shop closes / a rider becomes free) */
  useEffect(() => {
    if (!hydrated || !active) return
    const t = setInterval(() => check(active, { silent: true }), REFRESH_MS)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, active?.lat, active?.lng, check])

  /* Save (insert or update) an address and make it the active one */
  const activate = useCallback((addr) => {
    const a = { ...addr, id: addr.id || makeId() }
    setSaved((prev) => {
      const i = prev.findIndex((x) => x.id === a.id)
      if (i >= 0) {
        const copy = [...prev]
        copy[i] = a
        return copy
      }
      return [a, ...prev].slice(0, 10)
    })
    setActive(a)
  }, [])

  const deleteAddress = useCallback((id) => {
    setSaved((prev) => prev.filter((x) => x.id !== id))
    setActive((cur) => (cur?.id === id ? null : cur))
  }, [])

  const clearActive = useCallback(() => setActive(null), [])
  const recheck = useCallback(() => active && check(active), [active, check])

  return { active, saved, status, shop, etaMinutes, hydrated, activate, deleteAddress, clearActive, recheck }
}