'use client'
import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import axios from 'axios'
import { Clock, LocateFixed } from 'lucide-react'
import { CATEGORY_EMOJI, CATEGORY_LABEL } from './categoryMeta'

const FALLBACK_KMH = 25
const toRad = (d) => (d * Math.PI) / 180
const hav = (aLat, aLon, bLat, bLon) => {
  const x = Math.sin(toRad(bLat - aLat) / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(toRad(bLon - aLon) / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
const fmtEta = (s) => { const m = Math.max(1, Math.round(s / 60)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr ${m % 60} min` }
const fmtDist = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)

const siteIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 14px rgba(0,0,0,.3))">
    <div style="width:44px;height:44px;border-radius:50%;background:#0a0a0a;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:22px">🏠</div>
    <div style="width:2px;height:8px;background:#0a0a0a"></div></div>`,
  className: '', iconSize: [44, 56], iconAnchor: [22, 56],
})
const labourIconFor = (cat) =>
  new L.DivIcon({
    html: `<div class="ce-lab"><span>${CATEGORY_EMOJI[cat] || '👷'}</span><i></i></div>
           <div class="ce-lab-tag">${CATEGORY_LABEL[cat] || 'Labour'}</div>`,
    className: '', iconSize: [64, 70], iconAnchor: [32, 28],
  })

// moves the marker smoothly instead of jumping
function AnimatedMarker({ position, icon }) {
  const ref = useRef(null)
  const first = useRef(position).current // fixed: react-leaflet must not reset the position itself
  const cur = useRef(position)
  useEffect(() => {
    const m = ref.current
    if (!m) return
    const from = cur.current, to = position, t0 = performance.now(), dur = 900
    let raf
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur)
      const p = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k]
      m.setLatLng(p); cur.current = p
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [position[0], position[1]]) // eslint-disable-line
  return <Marker ref={ref} position={first} icon={icon} zIndexOffset={600} />
}

function Fit({ points, fitKey, recenter, onUserMove }) {
  const map = useMap()
  const moved = useRef(false)
  useMapEvents({ dragstart: () => { moved.current = true; onUserMove?.() } })
  useEffect(() => { if (recenter) moved.current = false }, [recenter])
  useEffect(() => {
    if (moved.current || !points.length) return
    map.invalidateSize()
    if (points.length === 1) map.setView(points[0], 16, { animate: true })
    else map.fitBounds(points, { padding: [70, 70], maxZoom: 17, animate: true })
    // eslint-disable-next-line
  }, [fitKey, recenter, map])
  return null
}

export default function LiveLabourMap({ sitePos, labourPos, category, status, onStats }) {
  const [route, setRoute] = useState(null)
  const [recenter, setRecenter] = useState(0)
  const last = useRef({ t: 0, pos: null })
  const reqId = useRef(0)
  const enRoute = status === 'confirmed' && !!labourPos && !!sitePos

  useEffect(() => {
    if (!enRoute) { setRoute(null); onStats?.(null); return }
    const now = Date.now(), l = last.current
    if (l.pos && hav(l.pos[0], l.pos[1], labourPos[0], labourPos[1]) < 40 && now - l.t < 20000) return
    last.current = { t: now, pos: labourPos }
    const id = ++reqId.current
    ;(async () => {
      let r = null
      try {
        const { data } = await axios.get('https://api.geoapify.com/v1/routing', {
          params: { waypoints: `${labourPos[0]},${labourPos[1]}|${sitePos[0]},${sitePos[1]}`, mode: 'drive',
            apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY },
        })
        const f = data.features?.[0]
        if (f) {
          const lines = f.geometry.type === 'MultiLineString' ? f.geometry.coordinates.flat(1) : f.geometry.coordinates
          r = { key: `${Date.now()}`, points: lines.map(([lo, la]) => [la, lo]), distanceM: f.properties.distance, timeS: f.properties.time, approx: false }
        }
      } catch { /* fall back below */ }
      if (!r) {
        const d = hav(labourPos[0], labourPos[1], sitePos[0], sitePos[1])
        r = { key: `${Date.now()}`, points: [labourPos, sitePos], distanceM: d, timeS: (d / 1000 / FALLBACK_KMH) * 3600, approx: true }
      }
      if (id !== reqId.current) return
      setRoute(r)
      onStats?.({ distanceM: r.distanceM, timeS: r.timeS, approx: r.approx })
    })()
    // eslint-disable-next-line
  }, [labourPos?.[0], labourPos?.[1], enRoute, sitePos?.[0], sitePos?.[1]])

  if (!sitePos) return <div className="h-full w-full bg-zinc-100" />
  const pts = [sitePos, ...(labourPos && status === 'confirmed' ? [labourPos] : [])]

  return (
    <div className="relative h-full w-full bg-zinc-100">
      <style>{`
        .ce-lab{position:relative;width:46px;height:46px;margin:0 9px;border-radius:50%;background:#0a0a0a;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 6px 18px rgba(0,0,0,.35)}
        .ce-lab i{position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(34,197,94,.7);animation:ce-ping 1.8s ease-out infinite}
        .ce-lab-tag{margin-top:4px;text-align:center;font:800 9px system-ui;letter-spacing:.1em;text-transform:uppercase;background:#fff;border-radius:99px;padding:2px 8px;box-shadow:0 2px 8px rgba(0,0,0,.2)}
        @keyframes ce-ping{0%{transform:scale(.8);opacity:.9}100%{transform:scale(1.5);opacity:0}}
      `}</style>

      <MapContainer center={sitePos} zoom={16} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Fit points={pts} fitKey={route?.key || (labourPos ? 'l' : 's')} recenter={recenter} />

        {route && (
          <>
            <Polyline positions={route.points} pathOptions={{ color: '#fff', weight: 10, opacity: 0.95, lineCap: 'round', lineJoin: 'round', interactive: false }} />
            <Polyline positions={route.points} pathOptions={{ color: '#0a0a0a', weight: 5, lineCap: 'round', lineJoin: 'round', dashArray: route.approx ? '2 10' : undefined, interactive: false }} />
          </>
        )}
        <Marker position={sitePos} icon={siteIcon} zIndexOffset={500} />
        {labourPos && <AnimatedMarker position={labourPos} icon={labourIconFor(category)} />}
      </MapContainer>

      {status === 'confirmed' && (
        <div className="absolute bottom-4 left-4 z-[500] flex items-center gap-3 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-lg">
          <Clock size={16} />
          <div className="leading-tight">
            {route ? (
              <>
                <p className="text-sm font-black">{route.approx ? '~' : ''}{fmtEta(route.timeS)} away</p>
                <p className="text-[10px] text-zinc-400 font-semibold">{fmtDist(route.distanceM)} to the site</p>
              </>
            ) : (
              <p className="text-sm font-bold">Waiting for live location…</p>
            )}
          </div>
        </div>
      )}
      <button type="button" onClick={() => setRecenter((n) => n + 1)} aria-label="Re-center map"
        className="absolute bottom-4 right-4 z-[500] w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-lg flex items-center justify-center hover:bg-zinc-50">
        <LocateFixed size={18} />
      </button>
    </div>
  )
}