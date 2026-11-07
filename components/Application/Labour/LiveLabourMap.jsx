'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { LocateFixed } from 'lucide-react'
import { CATEGORY_EMOJI, CATEGORY_LABEL } from './categoryMeta'

/* ───────────────────────── geo helpers ───────────────────────── */
const FALLBACK_KMH = 22 // city average when no routing service answers
const toRad = (d) => (d * Math.PI) / 180
const toDeg = (r) => (r * 180) / Math.PI
const hav = (a, b) => {
  const x = Math.sin(toRad(b[0] - a[0]) / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(toRad(b[1] - a[1]) / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
const bearing = (a, b) => {
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]))
  const x = Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) - Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]))
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}
export const fmtEta = (s) => { const m = Math.max(1, Math.round(s / 60)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr ${m % 60} min` }
export const fmtDist = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)
const ago = (t) => { const s = Math.max(0, Math.round((Date.now() - t) / 1000)); return s < 10 ? 'just now' : s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago` }

// road route: Geoapify (if key) -> OSRM public server -> null (straight line fallback)
async function fetchRoute(from, to) {
  const key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
  if (key) {
    try {
      const r = await fetch(`https://api.geoapify.com/v1/routing?waypoints=${from[0]},${from[1]}|${to[0]},${to[1]}&mode=drive&apiKey=${key}`)
      if (r.ok) {
        const f = (await r.json()).features?.[0]
        if (f) {
          const lines = f.geometry.type === 'MultiLineString' ? f.geometry.coordinates.flat(1) : f.geometry.coordinates
          return { points: lines.map(([lo, la]) => [la, lo]), distanceM: f.properties.distance, timeS: f.properties.time }
        }
      }
    } catch { /* next provider */ }
  }
  try {
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`)
    if (r.ok) {
      const x = (await r.json()).routes?.[0]
      if (x) return { points: x.geometry.coordinates.map(([lo, la]) => [la, lo]), distanceM: x.distance, timeS: x.duration }
    }
  } catch { /* straight line */ }
  return null
}

function prepRoute(points, timeS, approx) {
  const suffix = new Array(points.length).fill(0) // distance from point i to the end
  for (let i = points.length - 2; i >= 0; i--) suffix[i] = suffix[i + 1] + hav(points[i], points[i + 1])
  const total = suffix[0] || 1
  return { points, suffix, total, timeS: approx || !timeS ? total / (FALLBACK_KMH / 3.6) : timeS, approx, key: `${Date.now()}` }
}

// where on the route the labour is now -> remaining line + remaining metres
function progressOn(route, pos) {
  const cos = Math.cos(toRad(pos[0]))
  let best = 0, bd = Infinity
  for (let i = 0; i < route.points.length; i++) {
    const p = route.points[i]
    const dy = p[0] - pos[0], dx = (p[1] - pos[1]) * cos
    const d = dx * dx + dy * dy
    if (d < bd) { bd = d; best = i }
  }
  const next = Math.min(best + 1, route.points.length - 1)
  const remainingM = hav(pos, route.points[next]) + route.suffix[next]
  return { offRouteM: hav(route.points[best], pos), remainingM, remaining: [pos, ...route.points.slice(next)] }
}

/* ───────────────────────── markers ───────────────────────── */
const siteIcon = new L.DivIcon({
  html: `<div class="ce-site"><div class="ce-site-pin">🏠</div><div class="ce-site-tail"></div><div class="ce-site-dot"></div></div>`,
  className: '', iconSize: [48, 64], iconAnchor: [24, 60],
})
const labourIcon = (cat, label) => new L.DivIcon({
  html: `<div class="ce-rider"><div class="ce-dir"><i></i></div><div class="ce-ring"></div>
         <div class="ce-face">${CATEGORY_EMOJI[cat] || '👷'}</div></div>
         <div class="ce-tag">${label || CATEGORY_LABEL[cat] || 'Labour'}</div>`,
  className: '', iconSize: [60, 80], iconAnchor: [30, 30],
})

// glides between GPS fixes instead of jumping; arrow rotates to the direction of travel
function LabourMarker({ position, rotation, icon }) {
  const ref = useRef(null)
  const first = useRef(position).current // react-leaflet must never reset the position itself
  const cur = useRef(position)
  useEffect(() => {
    const m = ref.current
    if (!m) return
    const from = cur.current, to = position
    if (hav(from, to) > 2000) { m.setLatLng(to); cur.current = to; return } // teleport (first fix after long gap)
    const t0 = performance.now(), dur = 1100
    let raf
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur)
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2 // ease in-out
      const p = [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e]
      m.setLatLng(p); cur.current = p
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [position[0], position[1]]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = ref.current?.getElement()?.querySelector('.ce-dir')
    if (el) { el.style.transform = `rotate(${rotation ?? 0}deg)`; el.style.opacity = rotation == null ? '0' : '1' }
  }, [rotation, icon])
  return <Marker ref={ref} position={first} icon={icon} zIndexOffset={1000} />
}

/* ───────────────────────── camera ───────────────────────── */
function Camera({ site, labour, status, recenter, onDragged }) {
  const map = useMap()
  const dragged = useRef(false)
  const fittedFor = useRef('')
  const fit = (animate = true) => {
    const pts = [site, labour].filter(Boolean)
    if (!pts.length) return
    if (pts.length === 1 || hav(pts[0], pts[1]) < 40) map.setView(pts[0], 17, { animate })
    else map.fitBounds(L.latLngBounds(pts), { padding: [70, 70], maxZoom: 17, animate })
  }
  useMapEvents({ dragstart: () => { dragged.current = true; onDragged(true) } })

  useEffect(() => { // container height changes (mobile sheet, sidebar) -> tiles must re-layout
    const el = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [map])
  useEffect(() => { if (recenter) { dragged.current = false; onDragged(false); fit() } }, [recenter]) // eslint-disable-line
  useEffect(() => { // first fix / status change
    const k = `${status}|${!!labour}`
    if (k === fittedFor.current) return
    fittedFor.current = k
    if (!dragged.current) fit()
  }, [status, !!labour]) // eslint-disable-line
  useEffect(() => { // follow: keep both pins in view while the labour moves
    if (dragged.current || !labour) return
    const inner = map.getBounds().pad(-0.12)
    if (!inner.contains(labour) || (site && !inner.contains(site))) fit()
  }, [labour?.[0], labour?.[1]]) // eslint-disable-line
  return null
}

/* ───────────────────────── map ───────────────────────── */
/**
 * sitePos / labourPos: [lat, lon]. status: booking status.
 * onStats({ distanceM, timeS, approx }) while the labour is on the way.
 */
export default function LiveLabourMap({ sitePos, labourPos, heading, lastAt, category, status, onStats, labourLabel, showEtaChip = true }) {
  const [route, setRoute] = useState(null)
  const [recenter, setRecenter] = useState(0)
  const [dragged, setDragged] = useState(false)
  const [rotation, setRotation] = useState(null)
  const [, tick] = useState(0)
  const routeRef = useRef(null)
  const fetching = useRef(false)
  const lastFetch = useRef({ at: 0, from: null })
  const prevPos = useRef(null)
  const alive = useRef(true)
  useEffect(() => () => { alive.current = false }, [])
  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 10000); return () => clearInterval(i) }, [])

  const enRoute = status === 'confirmed' && !!labourPos && !!sitePos
  const atSite = ['arrived', 'started', 'work_completed'].includes(status)
  const icon = useMemo(() => labourIcon(category, labourLabel), [category, labourLabel])

  // direction of travel: GPS heading when moving, else bearing between fixes
  useEffect(() => {
    if (!labourPos) return
    const p = prevPos.current
    if (Number.isFinite(heading)) setRotation(heading)
    else if (p && hav(p, labourPos) > 4) setRotation(bearing(p, labourPos))
    if (!p || hav(p, labourPos) > 4) prevPos.current = labourPos
  }, [labourPos?.[0], labourPos?.[1], heading]) // eslint-disable-line

  // (re)load the road route: first time, off-route by >80 m, or every 60 s after moving 150 m
  useEffect(() => {
    if (!enRoute) { routeRef.current = null; setRoute(null); return }
    const r = routeRef.current
    const lf = lastFetch.current
    const need = !r || progressOn(r, labourPos).offRouteM > 80 ||
      (Date.now() - lf.at > 60000 && lf.from && hav(lf.from, labourPos) > 150)
    if (!need || fetching.current) return
    fetching.current = true
    lastFetch.current = { at: Date.now(), from: labourPos }
    fetchRoute(labourPos, sitePos)
      .then((res) => {
        if (!alive.current) return
        const next = res ? prepRoute(res.points, res.timeS, false) : prepRoute([labourPos, sitePos], null, true)
        routeRef.current = next
        setRoute(next)
      })
      .finally(() => { fetching.current = false })
  }, [enRoute, labourPos?.[0], labourPos?.[1], sitePos?.[0], sitePos?.[1]]) // eslint-disable-line

  const prog = useMemo(() => (route && enRoute ? progressOn(route, labourPos) : null), [route, enRoute, labourPos?.[0], labourPos?.[1]]) // eslint-disable-line
  const stats = prog ? { distanceM: prog.remainingM, timeS: route.timeS * (prog.remainingM / route.total), approx: route.approx } : null

  const sKey = stats ? `${Math.round(stats.distanceM / 10)}|${Math.round(stats.timeS / 15)}` : 'none'
  useEffect(() => { onStats?.(stats) }, [sKey]) // eslint-disable-line

  if (!sitePos) return <div className="h-full w-full bg-zinc-100 animate-pulse" />
  const stale = lastAt && Date.now() - lastAt > 90_000

  return (
    <div className="relative h-full w-full bg-zinc-100 isolate">
      <style>{`
        .ce-site{display:flex;flex-direction:column;align-items:center}
        .ce-site-pin{width:44px;height:44px;border-radius:50%;background:#0a0a0a;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:0 8px 20px rgba(0,0,0,.35)}
        .ce-site-tail{width:3px;height:10px;background:#0a0a0a}
        .ce-site-dot{width:10px;height:5px;border-radius:50%;background:rgba(0,0,0,.35)}
        .ce-rider{position:relative;width:60px;height:60px}
        .ce-face{position:absolute;left:10px;top:10px;width:40px;height:40px;border-radius:50%;background:#16a34a;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 6px 18px rgba(0,0,0,.35);z-index:2}
        .ce-ring{position:absolute;inset:4px;border-radius:50%;border:2px solid rgba(22,163,74,.75);animation:ce-ping 1.8s ease-out infinite}
        .ce-dir{position:absolute;inset:0;transition:transform .7s ease,opacity .3s;z-index:1}
        .ce-dir i{position:absolute;left:50%;top:-3px;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:14px solid #16a34a;filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
        .ce-tag{margin:2px auto 0;width:max-content;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:800 9px system-ui;letter-spacing:.08em;text-transform:uppercase;background:#fff;border-radius:99px;padding:3px 8px;box-shadow:0 2px 8px rgba(0,0,0,.2)}
        @keyframes ce-ping{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.6);opacity:0}}
        .leaflet-container{font-family:inherit}
      `}</style>

      <MapContainer center={sitePos} zoom={16} zoomControl={false} attributionControl style={{ width: '100%', height: '100%' }}>
        {/* Carto basemaps now need an API key (tiles render "API KEY REQUIRED"), so use Geoapify, else plain OSM */}
        {process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.geoapify.com/">Geoapify</a>'
            url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`}
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}
        <Camera site={sitePos} labour={labourPos} status={status} recenter={recenter} onDragged={setDragged} />

        {prog && (
          <>
            <Polyline positions={prog.remaining} pathOptions={{ color: '#ffffff', weight: 11, opacity: 1, lineCap: 'round', lineJoin: 'round', interactive: false }} />
            <Polyline positions={prog.remaining} pathOptions={{ color: '#111827', weight: 5.5, lineCap: 'round', lineJoin: 'round', dashArray: route.approx ? '1 12' : undefined, interactive: false }} />
          </>
        )}
        <Marker position={sitePos} icon={siteIcon} zIndexOffset={500} />
        {labourPos && <LabourMarker position={labourPos} rotation={atSite ? null : rotation} icon={icon} />}
      </MapContainer>

      {/* live badge */}
      {labourPos && (
        <div className="absolute top-3 right-3 z-[500] flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow border border-zinc-100">
          <span className={`w-1.5 h-1.5 rounded-full ${stale ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-[10px] font-bold text-zinc-700">{stale ? `Last seen ${ago(lastAt)}` : 'LIVE'}</span>
        </div>
      )}

      {showEtaChip && status === 'confirmed' && (
        <div className="absolute bottom-4 left-4 z-[500] max-w-[70%] bg-zinc-900 text-white px-4 py-2.5 rounded-2xl shadow-xl">
          {stats ? (
            <>
              <p className="text-base font-black leading-tight">{stats.approx ? '~' : ''}{fmtEta(stats.timeS)}</p>
              <p className="text-[10px] text-zinc-400 font-semibold">{fmtDist(stats.distanceM)} away{stats.approx ? ' · approx' : ''}</p>
            </>
          ) : (
            <p className="text-sm font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />{labourPos ? 'Finding the best route…' : 'Waiting for live location…'}</p>
          )}
        </div>
      )}
      {atSite && labourPos && showEtaChip && (
        <div className="absolute bottom-4 left-4 z-[500] bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl text-sm font-black">
          At the site
        </div>
      )}

      <button type="button" onClick={() => setRecenter((n) => n + 1)} aria-label="Re-center map"
        className={`absolute bottom-4 right-4 z-[500] w-11 h-11 rounded-full border shadow-lg flex items-center justify-center transition-colors ${dragged ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}>
        <LocateFixed size={18} />
      </button>
    </div>
  )
}
