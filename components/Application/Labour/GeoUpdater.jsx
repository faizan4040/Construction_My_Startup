'use client'
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket-client';
import React, { useEffect, useRef } from 'react'

function GeoUpdater({ userId }) {
  const watcherRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;

    // This actually calls socket.connect() and announces identity —
    // getSocket() alone never connects (autoConnect is false).
    const socket = connectSocket({ userId });

    const sendIdentity = () => {
      socket.emit("identity", userId);
    };
    socket.on("connect", sendIdentity);

    watcherRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (!socket.connected) return;
        socket.emit("update-location", {
          userId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (err) => {
        console.log("Geolocation error:", err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      if (watcherRef.current !== null) {
        navigator.geolocation.clearWatch(watcherRef.current);
      }
      socket.off("connect", sendIdentity);
      socket.emit("go-offline", { userId });
    };
  }, [userId]);

  return null;
}

export default GeoUpdater;