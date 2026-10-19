'use client'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { AlertTriangle, Bell, MapPin, Wifi, WifiOff } from 'lucide-react'
import { getSocket } from '@/lib/socket-client'

export default function PartnerLiveRequests() {
  const [count, setCount] = useState(0)
  const [geo, setGeo] = useState('unknown') // granted | prompt | denied | unknown
  const [online, setOnline] = useState(false)

  const fetchCount = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/partner/bookings/pending-requests-count')
      const n = Number(data)
      setCount(Number.isFinite(n) && n > 0 ? n : 0)
    } catch (e) {
      console.log(e)
    }
  }, [])

  useEffect(() => {
    fetchCount()
    const socket = getSocket()
    setOnline(socket.connected)
    const refresh = () => fetchCount()
    const up = () => { setOnline(true); fetchCount() }
    const down = () => setOnline(false)
    socket.on('new-booking', refresh)
    socket.on('booking-cancelled', refresh)
    socket.on('connect', up)
    socket.on('disconnect', down)
    const t = setInterval(fetchCount, 30000)
    return () => {
      socket.off('new-booking', refresh)
      socket.off('booking-cancelled', refresh)
      socket.off('connect', up)
      socket.off('disconnect', down)
      clearInterval(t)
    }
  }, [fetchCount])

  useEffect(() => {
    if (!navigator.permissions?.query) return
    let status
    navigator.permissions.query({ name: 'geolocation' }).then((p) => {
      status = p
      setGeo(p.state)
      p.onchange = () => setGeo(p.state)
    }).catch(() => {})
    return () => { if (status) status.onchange = null }
  }, [])

  const receiving = online && geo !== 'denied'

  return (
    <div className="bg-white rounded-3xl border shadow-xl p-8 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-zinc-900">Job Requests</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {count > 0 ? `${count} request${count > 1 ? 's' : ''} waiting for you` : 'No requests right now'}
          </p>
        </div>
        <Link href="/partner/pending-requests"
          className="relative inline-flex items-center gap-2 bg-black text-white font-semibold text-sm px-6 py-3 rounded-xl">
          <Bell size={16} /> Open Requests
          {count > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-[#F5A623] text-black text-xs font-bold flex items-center justify-center animate-pulse">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
          online ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {online ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span className="font-semibold">{online ? 'Connected — you can receive requests' : 'Not connected to server'}</span>
        </div>
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
          geo === 'granted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : geo === 'denied' ? 'bg-red-50 border-red-200 text-red-600'
          : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          {geo === 'granted' ? <MapPin size={16} /> : <AlertTriangle size={16} />}
          <span className="font-semibold">
            {geo === 'granted' ? 'Location sharing is ON'
              : geo === 'denied' ? 'Location blocked — customers cannot find you'
              : 'Please allow location access'}
          </span>
        </div>
      </div>

      {!receiving && (
        <p className="text-xs text-zinc-400">
          Customers only see you when this page is open, you are connected, and location is allowed.
        </p>
      )}
    </div>
  )
}