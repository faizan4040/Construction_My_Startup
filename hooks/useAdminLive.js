'use client'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { connectSocket } from '@/lib/socket-client'

// Connects the admin's socket and calls onEvent when any booking changes.
export default function useAdminLive(onEvent) {
  const auth = useSelector((s) => s.authStore.auth)
  const id = auth?._id ?? auth?.id
  const cbRef = useRef(onEvent)
  cbRef.current = onEvent
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!id) return
    const socket = connectSocket({ userId: id })
    const onConnect = () => { socket.emit('identity', id); setConnected(true) }
    const onDown = () => setConnected(false)
    const onUpdate = (p) => cbRef.current?.(p)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDown)
    socket.on('admin-booking-update', onUpdate)
    if (socket.connected) onConnect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDown)
      socket.off('admin-booking-update', onUpdate)
    }
  }, [id])

  return connected
}