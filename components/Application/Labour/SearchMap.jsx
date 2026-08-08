'use client'
import React, { useEffect, useRef, useState } from 'react'
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

function FitAllBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points || points.length === 0) return
    map.invalidateSize()
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true })
    } else {
      map.fitBounds(points, { padding: [70, 70], maxZoom: 15, animate: true })
    }
  }, [points, map])
  return null
}

const workIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
      <div style="
        background:#0a0a0a;color:#fff;
        padding:5px 14px;border-radius:100px;
        font-size:10px;font-weight:800;letter-spacing:0.14em;
        text-transform:uppercase;white-space:nowrap;
        font-family:-apple-system,system-ui,sans-serif;
        box-shadow:0 2px 12px rgba(0,0,0,0.25);
      ">Your Site</div>
      <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>
      <div style="
        width:13px;height:13px;background:#0a0a0a;border-radius:50%;
        border:3px solid #fff;
        box-shadow:0 0 0 2px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.3);
      "></div>
    </div>`,
  className: "",
  iconSize: [90, 58],
  iconAnchor: [45, 58]
})

const labourIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.2))">
      <div style="
        width:34px;height:34px;background:#fff;border-radius:50%;
        border:2.5px solid #0a0a0a;display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
      ">
        <div style="width:10px;height:10px;background:#16a34a;border-radius:50%"></div>
      </div>
    </div>`,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 34]
})

/**
 * props:
 *  - address: string (customer's work-site address)
 *  - addressCoords: optional initial [lat, lon] for the work-site
 *  - labourList: array of { _id, name, latitude, longitude, ... } - nearby labour to plot
 *  - onAddressChange(addr): fired when the work-site text is resolved after a drag
 *  - onCoordsChange([lat, lon]): fired whenever the work-site coordinates change -
 *    the parent uses this as the source of truth for re-searching + booking.
 */
function SearchMap({ address, addressCoords, labourList = [], onAddressChange, onCoordsChange }) {
  const [workPos, setWorkPos] = useState(addressCoords)
  const [ready, setReady] = useState(!!addressCoords)
  const didInitRef = useRef(false)

  const geoCoding = async (q) => {
    try {
      const { data } = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
        params: {
          text: q.trim(),
          apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
          filter: "countrycode:in",
          limit: 1
        }
      })
      if (!data.features.length) return null
      const [lon, lat] = data.features[0].geometry.coordinates
      return [lat, lon]
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const reverseGeoCoding = async (lat, lon) => {
    try {
      const { data } = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
        params: {
          lat,
          lon,
          apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
          filter: "countrycode:in"
        }
      })
      if (!data.features.length) return null
      const p = data.features[0].properties
      return [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(", ")
    } catch (error) {
      console.log(error)
      return null
    }
  }

  // Resolve the work address to coordinates on first load, unless we
  // already got exact coordinates passed in from the Hire Labour page.
  useEffect(() => {
    if (didInitRef.current) return
    if (addressCoords) {
      setWorkPos(addressCoords)
      setReady(true)
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
    })()
  }, [address, addressCoords])

  const dragWork = async (lat, lon) => {
    const newPos = [lat, lon]
    setWorkPos(newPos)
    onCoordsChange?.(newPos)
    const addr = await reverseGeoCoding(lat, lon)
    onAddressChange?.(addr || address)
  }

  const labourPoints = labourList
    .filter(l => l.latitude && l.longitude)
    .map(l => [l.latitude, l.longitude])

  const allPoints = workPos ? [workPos, ...labourPoints] : labourPoints

  return (
    <div className='relative h-full w-full bg-zinc-100'>
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={workPos ?? [0, 0]}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">"CARTO"</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" />

        {allPoints.length > 0 && <FitAllBounds points={allPoints} />}

        {workPos && (
          <Marker
            position={workPos}
            icon={workIcon}
            draggable
            eventHandlers={{
              dragend: e => {
                const m = e.target.getLatLng()
                dragWork(m.lat, m.lng)
              }
            }}
          />
        )}

        {labourList.map(l => (
          l.latitude && l.longitude ? (
            <Marker key={l._id} position={[l.latitude, l.longitude]} icon={labourIcon} />
          ) : null
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

      {ready && labourList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl shadow-lg"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className='text-zinc-900 text-xs font-bold'>{labourList.length} nearby</span>
        </motion.div>
      )}
    </div>
  )
}

export default SearchMap
