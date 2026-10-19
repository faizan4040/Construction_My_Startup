'use client'
import { connectSocket } from '@/lib/socket-client';
import React, { useEffect, useRef } from 'react'

const MIN_INTERVAL_MS = 10000;
const MIN_MOVE_M = 25;
const HEARTBEAT_MS = 60000;

const toRad = (d) => (d * Math.PI) / 180;
const distM = (aLat, aLon, bLat, bLon) => {
  const x =
    Math.sin(toRad(bLat - aLat) / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(toRad(bLon - aLon) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

function GeoUpdater({ userId }) {
   console.log("GeoUpdater mounted, userId =", userId)
  const latestRef = useRef(null) // newest GPS fix, kept even while the socket is down
  const sentRef = useRef({ t: 0, lat: null, lon: null })

  useEffect(() => {
    console.log("[GeoUpdater] mounted, userId =", userId)
    if (!userId) return
    if (!navigator.geolocation) {
      console.warn("[GeoUpdater] Geolocation not supported on this device")
      return
    }

    const socket = connectSocket({ userId })

    const send = (force = false) => {
      const fix = latestRef.current
      if (!fix || !socket.connected) return
      const s = sentRef.current
      const moved = s.lat == null ? Infinity : distM(s.lat, s.lon, fix.lat, fix.lon)
      if (!force && Date.now() - s.t < MIN_INTERVAL_MS && moved < MIN_MOVE_M) return
      sentRef.current = { t: Date.now(), lat: fix.lat, lon: fix.lon }
      console.log("[GeoUpdater] update-location sent", fix)
      socket.emit("update-location", {
        latitude: fix.lat,
        longitude: fix.lon,
        accuracy: fix.accuracy,
      })
    }

    // on every (re)connect: announce identity, then push the latest known fix
    const onConnect = () => {
      console.log("[GeoUpdater] socket connected, emitting identity", userId)
      socket.emit("identity", userId)
      send(true)
    }
    const onConnectError = (err) =>
      console.error("[GeoUpdater] socket connect_error:", err.message)

    socket.on("connect", onConnect)
    socket.on("connect_error", onConnectError)
    if (socket.connected) onConnect()

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        console.log("[GeoUpdater] GPS fix", coords.latitude, coords.longitude, "accuracy", coords.accuracy)
        latestRef.current = { lat: coords.latitude, lon: coords.longitude, accuracy: coords.accuracy }
        send()
      },
      (err) => console.warn("[GeoUpdater] Geolocation error:", err.code, err.message), // code 1 = permission denied
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    // keeps a stationary labour "fresh" for the nearby search
    const heartbeat = setInterval(() => send(true), HEARTBEAT_MS)

    return () => {
      navigator.geolocation.clearWatch(watchId)
      clearInterval(heartbeat)
      socket.off("connect", onConnect)
      socket.off("connect_error", onConnectError)
    }
  }, [userId])

  return null
}

export default GeoUpdater