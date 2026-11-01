'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import useAdminLive from '@/hooks/useAdminLive'
import { inr, fmtDate } from '@/components/Services/ui'

function beep() {
  try {
    const C = window.AudioContext || window.webkitAudioContext
    const c = new C(), o = c.createOscillator(), g = c.createGain()
    o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.value = 0.08
    o.start(); o.stop(c.currentTime + 0.25)
  } catch { /* browsers block sound until the first click: fine */ }
}

export default function AdminBell() {
  const [list, setList] = useState([])
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const prev = useRef(null)
  const timer = useRef(null)

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/services/bookings', { params: { unseen: 1, limit: 6 } })
      setList(data.bookings); setCount(data.total)
      if (prev.current !== null && data.total > prev.current) beep()
      prev.current = data.total
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load(); const t = setInterval(() => document.visibilityState === 'visible' && load(), 30000); return () => clearInterval(t) }, [load])
  useAdminLive(() => { clearTimeout(timer.current); timer.current = setTimeout(load, 400) })

  const markAll = async () => { await axios.post('/api/admin/services/bookings', { action: 'seen_all' }).catch(() => {}); load() }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`${count} new bookings`}
        className="relative w-11 h-11 rounded-full border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50">
        <Bell size={19} className={count ? 'text-red-500 animate-pulse' : 'text-zinc-600'} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <span className="relative min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">{count > 99 ? '99+' : count}</span>
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute right-0 top-14 w-80 max-w-[88vw] bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b"><b className="text-sm">New bookings</b>{count > 0 && <button onClick={markAll} className="text-xs font-bold text-emerald-700">Mark all seen</button>}</div>
            {list.length === 0 ? <p className="text-sm text-zinc-400 text-center py-8">No new bookings</p> : list.map((b) => (
              <Link key={b._id} href="/admin/services" onClick={() => setOpen(false)} className="block px-4 py-3 border-b last:border-0 hover:bg-zinc-50">
                <p className="text-sm font-bold">#{b.code} · {b.categoryName}</p>
                <p className="text-xs text-zinc-500">{b.contactName} · {fmtDate(b.slotDate)}, {b.slotTime} · {inr(b.total)}</p>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}