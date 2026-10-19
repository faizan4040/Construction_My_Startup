// components/Website/LocationMap.jsx
// Leaflet map with a fixed centre pin (move the map, the pin stays). Free OpenStreetMap tiles, no API key.
'use client'
import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import "leaflet/dist/leaflet.css"

export default function LocationMap({ center, zoom = 17, focus, onMoveEnd }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const cbRef = useRef(onMoveEnd)
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    cbRef.current = onMoveEnd
  }, [onMoveEnd])

  /* Create the map once */
  useEffect(() => {
    let map = null
    let cancelled = false
    let timer = null

    ;(async () => {
      const mod = await import("leaflet")
      const L = mod.default || mod
      if (cancelled || !elRef.current) return

      map = L.map(elRef.current, { zoomControl: false, attributionControl: true }).setView(
        [center.lat, center.lng],
        zoom
      )
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)
      L.control.zoom({ position: "bottomright" }).addTo(map)

      map.on("movestart", () => setMoving(true))
      map.on("moveend", () => {
        setMoving(false)
        const c = map.getCenter()
        cbRef.current?.(c.lat, c.lng, map.getZoom())
      })

      mapRef.current = map
      timer = setTimeout(() => map && map.invalidateSize(), 250) // modal finished animating
    })()

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (map) map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Fly to a new place (search result / "locate me") */
  useEffect(() => {
    if (focus && mapRef.current) {
      mapRef.current.flyTo([focus.lat, focus.lng], 17, { duration: 0.8 })
    }
  }, [focus])

  return (
    <div className="relative isolate w-full h-full bg-gray-100">
      <div ref={elRef} className="absolute inset-0" />

      {/* Fixed centre pin */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-full">
        <div className={`flex flex-col items-center transition-transform duration-200 ${moving ? "-translate-y-3" : ""}`}>
          <span className="mb-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            {moving ? "Move map to adjust pin" : "Your order will be delivered here"}
          </span>
          <MapPin size={44} className="fill-green-500 text-green-700 drop-shadow-lg" strokeWidth={1.5} />
        </div>
      </div>
      <span
        className={`pointer-events-none absolute left-1/2 top-1/2 z-[999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 blur-[1px] transition-transform duration-200 ${
          moving ? "scale-150 opacity-60" : ""
        }`}
      />
    </div>
  )
}