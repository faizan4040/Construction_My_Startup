'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── Custom icons — delivery boy (bike) vs customer (house), Zomato-style ──
const deliveryIcon = new L.DivIcon({
  html: `<div style="background:#f97316;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h1m14-6a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-1m-13 0a2 2 0 1 0 4 0m-4 0h9m0 0a2 2 0 1 0 4 0"/></svg>
         </div>`,
  iconSize: [34, 34],
  className: '',
})

const houseIcon = new L.DivIcon({
  html: `<div style="background:#10b981;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z"/></svg>
         </div>`,
  iconSize: [34, 34],
  className: '',
})

// ── Auto-recenter map whenever delivery boy's position updates ──
function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView(position, map.getZoom())
  }, [position, map])
  return null
}

const DeliveryMap = ({ customerLocation, customerName }) => {
  const [myLocation, setMyLocation] = useState(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    if (!navigator.geolocation) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  const center = myLocation || customerLocation || { lat: 26.9124, lng: 75.7873 } // fallback: Jaipur

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      style={{ height: '320px', width: '100%', borderRadius: '16px' }}
    >
      <TileLayer
        url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`}
        attribution='&copy; OpenStreetMap contributors, © Geoapify'
      />

      {myLocation && (
        <>
          <Marker position={[myLocation.lat, myLocation.lng]} icon={deliveryIcon}>
            <Popup>You are here</Popup>
          </Marker>
          <RecenterMap position={[myLocation.lat, myLocation.lng]} />
        </>
      )}

      {customerLocation?.lat && (
        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={houseIcon}>
          <Popup>{customerName}'s location</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

export default DeliveryMap