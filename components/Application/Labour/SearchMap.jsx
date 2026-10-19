'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Loader2, MapPin, Search } from 'lucide-react'

const SITE_ZOOM = 17
const FALLBACK_KMH = 25 // used only when the routing API fails

/* ───────── helpers ───────── */
const toRad = (d) => (d * Math.PI) / 180
const haversineM = (aLat, aLon, bLat, bLon) => {
  const x =
    Math.sin(toRad(bLat - aLat) / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(toRad(bLon - aLon) / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
const fmtEta = (sec) => {
  const m = Math.max(1, Math.round(sec / 60))
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  return `${h} hr ${m % 60} min`
}
const fmtKm = (m) => `${(m / 1000).toFixed(1)} km`

/* ───────── icons ───────── */
const workIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
      <div style="background:#0a0a0a;color:#fff;padding:5px 14px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;white-space:nowrap;font-family:-apple-system,system-ui,sans-serif;box-shadow:0 2px 12px rgba(0,0,0,0.25);">Your Site</div>
      <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>
      <div style="width:13px;height:13px;background:#0a0a0a;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.3);"></div>
    </div>`,
  className: "",
  iconSize: [90, 58],
  iconAnchor: [45, 58],
})

const labourIcon = new L.DivIcon({
  html: `<div style="filter:drop-shadow(0 4px 12px rgba(0,0,0,0.2))">
      <div style="width:34px;height:34px;background:#fff;border-radius:50%;border:2.5px solid #0a0a0a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);">
        <div style="width:10px;height:10px;background:#16a34a;border-radius:50%"></div>
      </div>
    </div>`,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

const labourIconActive = new L.DivIcon({
  html: `<div style="filter:drop-shadow(0 6px 16px rgba(0,0,0,0.35))">
      <div style="width:42px;height:42px;background:#0a0a0a;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;">
        <div style="width:12px;height:12px;background:#22c55e;border-radius:50%;box-shadow:0 0 0 4px rgba(34,197,94,0.25)"></div>
      </div>
    </div>`,
  className: "",
  iconSize: [42, 42],
  iconAnchor: [21, 21],
})

const radarIcon = new L.DivIcon({
  html: `<div class="ce-radar"><i></i><i></i><i></i></div>`,
  className: "",
  iconSize: [280, 280],
  iconAnchor: [140, 140],
})

/* ───────── map controllers ───────── */
function FlyToSite({ pos, flyKey }) {
  const map = useMap()
  useEffect(() => {
    if (!pos || !flyKey) return
    map.invalidateSize()
    map.setView(pos, Math.min(map.getZoom(), 13), { animate: false })
    map.flyTo(pos, SITE_ZOOM, { duration: 1.4 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyKey, map])
  return null
}

function FitRoute({ points, fitKey }) {
  const map = useMap()
  const ptsRef = useRef(points)
  ptsRef.current = points
  useEffect(() => {
    if (!fitKey) return
    const t = setTimeout(() => {
      const pts = ptsRef.current
      if (pts && pts.length >= 2) {
        map.fitBounds(pts, { padding: [80, 80], maxZoom: 16, animate: true })
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [fitKey, map])
  return null
}

function SearchMap({
  address,
  addressCoords,
  labourList = [],
  searching = false,
  categoryLabel = "labour",
  onAddressChange,
  onCoordsChange,
}) {
  const [workPos, setWorkPos] = useState(addressCoords)
  const [ready, setReady] = useState(!!addressCoords)
  const [flyKey, setFlyKey] = useState(addressCoords ? 1 : 0)
  const [selectedId, setSelectedId] = useState(null)
  const [route, setRoute] = useState(null)
  const didInitRef = useRef(false)
  const routeCache = useRef(new Map())

  const geoCoding = async (q) => {
    try {
      const { data } = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
        params: {
          text: q.trim(),
          apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
          filter: "countrycode:in",
          limit: 1,
        },
      })
      if (!data.features.length) return null
      const [lon, lat] = data.features[0].geometry.coordinates
      return [lat, lon]
    } catch (error) {
      console.log(error)
      return null
    }
  }

  // reverse API does not support "filter", so it is not sent
  const reverseGeoCoding = async (lat, lon) => {
    try {
      const { data } = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
        params: { lat, lon, apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY },
      })
      if (!data.features.length) return null
      const p = data.features[0].properties
      return [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(", ")
    } catch (error) {
      console.log(error)
      return null
    }
  }

  useEffect(() => {
    if (didInitRef.current) return
    if (addressCoords) {
      setWorkPos(addressCoords)
      setReady(true)
      setFlyKey((k) => k + 1)
      didInitRef.current = true
      return
    }
    if (!address) return
    ;(async () => {
      const p = await geoCoding(address)
      didInitRef.current = true
      if (!p) {
        setReady(true)
        return
      }
      setWorkPos(p)
      onCoordsChange?.(p)
      setReady(true)
      setFlyKey((k) => k + 1)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, addressCoords])

  const dragWork = async (lat, lon) => {
    const newPos = [lat, lon]
    setWorkPos(newPos)
    onCoordsChange?.(newPos)
    const addr = await reverseGeoCoding(lat, lon)
    onAddressChange?.(addr || address)
  }

  const labourPoints = useMemo(
    () => labourList.filter((l) => l.latitude && l.longitude),
    [labourList]
  )
  const selected =
    labourPoints.find((l) => l._id === selectedId) || labourPoints[0] || null

  const routeKey =
    selected && workPos
      ? `${selected.latitude.toFixed(4)},${selected.longitude.toFixed(4)}|${workPos[0].toFixed(5)},${workPos[1].toFixed(5)}`
      : null

  useEffect(() => {
    if (!routeKey) return
    const cached = routeCache.current.get(routeKey)
    if (cached) {
      setRoute(cached)
      return
    }

    const [a, b] = routeKey.split("|")
    const [fLat, fLon] = a.split(",").map(Number)
    const [tLat, tLon] = b.split(",").map(Number)
    let cancelled = false

    const t = setTimeout(async () => {
      let result = null
      try {
        const { data } = await axios.get("https://api.geoapify.com/v1/routing", {
          params: {
            waypoints: `${fLat},${fLon}|${tLat},${tLon}`,
            mode: "drive",
            apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
          },
        })
        const f = data.features?.[0]
        if (f) {
          const lines =
            f.geometry.type === "MultiLineString" ? f.geometry.coordinates.flat(1) : f.geometry.coordinates
          result = {
            key: routeKey,
            points: lines.map(([lon, lat]) => [lat, lon]),
            distanceM: f.properties.distance,
            timeS: f.properties.time,
            approx: false,
          }
        }
      } catch (error) {
        console.log("routing failed, using straight line", error?.message)
      }

      if (!result) {
        const d = haversineM(fLat, fLon, tLat, tLon)
        result = {
          key: routeKey,
          points: [[fLat, fLon], [tLat, tLon]],
          distanceM: d,
          timeS: (d / 1000 / FALLBACK_KMH) * 3600,
          approx: true,
        }
      }

      routeCache.current.set(routeKey, result)
      if (!cancelled) setRoute(result)
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [routeKey])

  const shownRoute = route && route.key === routeKey ? route : null

  return (
    <div className='relative h-full w-full bg-zinc-100'>
      <style>{`
        @keyframes ce-radar { 0% { transform: scale(.15); opacity: .6 } 100% { transform: scale(1); opacity: 0 } }
        .ce-radar { position: relative; width: 280px; height: 280px; pointer-events: none }
        .ce-radar i { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(10,10,10,.45);
          background: rgba(10,10,10,.08); animation: ce-radar 2.6s ease-out infinite }
        .ce-radar i:nth-child(2) { animation-delay: .87s }
        .ce-radar i:nth-child(3) { animation-delay: 1.73s }
      `}</style>

      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={workPos ?? [0, 0]}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToSite pos={workPos} flyKey={flyKey} />
        <FitRoute points={shownRoute?.points} fitKey={shownRoute ? shownRoute.key : ""} />

        {shownRoute && (
          <>
            <Polyline
              positions={shownRoute.points}
              pathOptions={{ color: "#ffffff", weight: 10, opacity: 0.95, lineCap: "round", lineJoin: "round", interactive: false }}
            />
            <Polyline
              positions={shownRoute.points}
              pathOptions={{
                color: "#0a0a0a",
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
                dashArray: shownRoute.approx ? "2 10" : undefined,
                interactive: false,
              }}
            />
          </>
        )}

        {searching && workPos && (
          <Marker position={workPos} icon={radarIcon} interactive={false} zIndexOffset={-1000} />
        )}

        {workPos && (
          <Marker
            position={workPos}
            icon={workIcon}
            draggable
            zIndexOffset={500}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng()
                dragWork(m.lat, m.lng)
              },
            }}
          />
        )}

        {labourPoints.map((l) => (
          <Marker
            key={l._id}
            position={[l.latitude, l.longitude]}
            icon={selected && l._id === selected._id ? labourIconActive : labourIcon}
            zIndexOffset={selected && l._id === selected._id ? 400 : 0}
            eventHandlers={{ click: () => setSelectedId(l._id) }}
          />
        ))}
      </MapContainer>

      <AnimatePresence>
        {!ready && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 z-[999] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <div className='relative w-14 h-14 flex items-center justify-center'>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900"
              />
              <MapPin size={15} className="text-zinc-800" />
            </div>
            <p className='text-zinc-900 text-xs font-black tracking-[0.22em] uppercase'>Loading Map</p>
          </motion.div>
        )}
      </AnimatePresence>

      {ready && (
        <div className="absolute top-5 right-5 z-[500]">
          <AnimatePresence mode="wait">
            {searching ? (
              <motion.div key="s" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-2 rounded-full shadow-lg">
                <Loader2 size={13} className="animate-spin" />
                <span className="text-xs font-bold">Searching for {categoryLabel.toLowerCase()} nearby…</span>
              </motion.div>
            ) : labourList.length === 0 ? (
              <motion.div key="n" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 px-3.5 py-2 rounded-full shadow-lg">
                <Search size={13} />
                <span className="text-xs font-bold">No {categoryLabel.toLowerCase()} nearby</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      {ready && !searching && labourList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl shadow-lg"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className='text-zinc-900 text-xs font-bold'>{labourList.length} nearby</span>
        </motion.div>
      )}

      <AnimatePresence>
        {shownRoute && selected && (
          <motion.div
            key={shownRoute.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 right-4 z-[500] flex items-center gap-3 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-lg"
          >
            <Clock size={16} />
            <div className="leading-tight">
              <p className="text-sm font-black">
                {shownRoute.approx ? "~" : ""}{fmtEta(shownRoute.timeS)} away
              </p>
              <p className="text-[10px] text-zinc-400 font-semibold">
                {selected.name} · {shownRoute.approx ? "~" : ""}{fmtKm(shownRoute.distanceM)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchMap