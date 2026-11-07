'use client'
import { useEffect, useRef } from 'react'
import { connectSocket } from '@/lib/socket-client'

const MIN_INTERVAL_MS = 8000
const MIN_MOVE_M = 20
const HEARTBEAT_MS = 45000

const toRad = (d) => (d * Math.PI) / 180
const distM = (aLat, aLon, bLat, bLon) => {
  const x =
    Math.sin(toRad(bLat - aLat) / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(toRad(bLon - aLon) / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

/**
 * Streams the labour's GPS to the socket server while they are ON duty.
 * The server saves it (live search, "I've reached" check, admin map) and, if a live job
 * is running, forwards it to that job's map room — so tracking works on every page.
 * Mount it ONCE (LabourShell does that). `enabled=false` stops GPS completely.
 */
function GeoUpdater({ userId, enabled = true }) {
  const latestRef = useRef(null)
  const sentRef = useRef({ t: 0, lat: null, lon: null })

  useEffect(() => {
    if (!userId || !enabled) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return

    const socket = connectSocket({ userId })

    const send = (force = false) => {
      const fix = latestRef.current
      if (!fix || !socket.connected) return
      const s = sentRef.current
      const moved = s.lat == null ? Infinity : distM(s.lat, s.lon, fix.lat, fix.lon)
      if (!force && Date.now() - s.t < MIN_INTERVAL_MS && moved < MIN_MOVE_M) return
      sentRef.current = { t: Date.now(), lat: fix.lat, lon: fix.lon }
      socket.emit('update-location', {
        latitude: fix.lat, longitude: fix.lon, accuracy: fix.accuracy, heading: fix.heading, speed: fix.speed,
      })
    }

    const onConnect = () => send(true)
    socket.on('connect', onConnect)
    if (socket.connected) onConnect()

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        latestRef.current = {
          lat: coords.latitude, lon: coords.longitude, accuracy: coords.accuracy,
          heading: Number.isFinite(coords.heading) ? coords.heading : null,
          speed: Number.isFinite(coords.speed) ? coords.speed : null,
        }
        send()
      },
      (err) => console.warn('[GeoUpdater] geolocation error:', err.code, err.message), // 1 = permission denied
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    )

    // keeps a stationary labour "fresh" for the nearby search
    const heartbeat = setInterval(() => send(true), HEARTBEAT_MS)

    return () => {
      navigator.geolocation.clearWatch(watchId)
      clearInterval(heartbeat)
      socket.off('connect', onConnect)
    }
  }, [userId, enabled])

  return null
}

export default GeoUpdater
