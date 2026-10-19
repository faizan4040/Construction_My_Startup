'use client'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Clock, IndianRupee, Loader2, MapPin, Navigation, Phone, Play, User } from 'lucide-react'
import { getSocket } from '@/lib/socket-client'

const inr = (n) => Math.round(n || 0).toLocaleString('en-IN')
const fmtDT = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
const fmtDur = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s` : `${m}m ${String(s).padStart(2, '0')}s`
}
const navLink = (c) => (c ? `https://www.google.com/maps/dir/?api=1&destination=${c[1]},${c[0]}` : null)

function Timer({ startedAt }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])
  return <>{fmtDur(Math.max(0, Math.round((Date.now() - new Date(startedAt)) / 1000)))}</>
}

export default function PartnerBookings() {
  const [active, setActive] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async ({ silent = false } = {}) => {
    try {
      const { data } = await axios.get('/api/partner/bookings')
      setActive(data.active)
      setHistory(data.history)
      if (!silent) setError('')
    } catch (e) {
      if (!silent) setError('Could not load bookings')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const socket = getSocket()
    const refresh = () => load({ silent: true })
    socket.on('booking-cancelled', refresh)
    socket.on('connect', refresh)
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, 30000)
    return () => {
      socket.off('booking-cancelled', refresh)
      socket.off('connect', refresh)
      clearInterval(t)
    }
  }, [load])

  const act = async (id, action) => {
    if (acting) return
    if (action === 'complete' && !window.confirm('Is the work finished? This ends the timer.')) return
    setActing(`${id}:${action}`)
    setError('')
    try {
      await axios.post(`/api/partner/bookings/${id}/${action}`)
      await load({ silent: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed. Please try again.')
      load({ silent: true })
    } finally {
      setActing('')
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] pt-32 sm:pt-36 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-2">Start and finish your jobs here.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-600" /></div>
        ) : active.length === 0 ? (
          <div className="bg-white rounded-2xl border p-14 text-center text-gray-500">No active job right now.</div>
        ) : active.map((b) => {
          const map = navLink(b.coordinates)
          const canStart = ['confirmed', 'arrived'].includes(b.bookingStatus)
          return (
            <motion.div key={b._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border shadow-lg overflow-hidden">
              <div className="h-1 bg-black" />
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Active job</p>
                    <p className="text-2xl font-black capitalize">{b.category.replace(/-/g, ' ')}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black text-white">
                    {b.bookingStatus === 'started' ? 'Working' : b.bookingStatus === 'work_completed' ? 'Awaiting payment' : 'Accepted'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1"><User size={12} /> Customer</p>
                    <p className="font-semibold">{b.customerName}</p>
                    {b.customerPhone && (
                      <a href={`tel:${b.customerPhone}`} className="inline-flex items-center gap-1.5 text-sm underline">
                        <Phone size={13} /> {b.customerPhone}
                      </a>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1"><MapPin size={12} /> Work site</p>
                    <p className="text-sm font-medium leading-snug">{b.siteDetails ? `${b.siteDetails}, ` : ''}{b.workAddress}</p>
                    {map && (
                      <a href={map} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold underline">
                        <Navigation size={13} /> Get directions
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Booking value</p>
                    <p className="text-2xl font-black flex items-center"><IndianRupee size={18} />{inr(b.fare)}</p>
                    <p className="text-xs text-gray-400">{b.duration} {b.pricingType === 'hourly' ? 'hrs' : 'days'} @ ₹{inr(b.ratePerUnit)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">You earn</p>
                    <p className="text-2xl font-black flex items-center"><IndianRupee size={18} />{inr(b.youEarn)}</p>
                    <p className="text-xs text-gray-400">after platform commission</p>
                  </div>
                </div>

                {b.bookingStatus === 'started' && (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                    <Clock className="text-emerald-600" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Work time</p>
                      <p className="text-2xl font-black text-emerald-700 tabular-nums"><Timer startedAt={b.startedAt} /></p>
                    </div>
                    <p className="ml-auto text-xs text-emerald-700">Started {fmtDT(b.startedAt)}</p>
                  </div>
                )}

                {b.bookingStatus === 'work_completed' && (
                  <div className="bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 text-sm text-violet-700">
                    Work finished in {b.workDurationMinutes != null ? fmtDur(Math.round(b.workDurationMinutes * 60)) : '—'}. Waiting for the customer to pay.
                  </div>
                )}

                {canStart && (
                  <button type="button" disabled={!!acting} onClick={() => act(b._id, 'start')}
                    className="w-full h-14 rounded-2xl bg-black text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                    {acting === `${b._id}:start` ? <Loader2 className="animate-spin" size={18} /> : <><Play size={16} /> Start Work</>}
                  </button>
                )}
                {b.bookingStatus === 'started' && (
                  <button type="button" disabled={!!acting} onClick={() => act(b._id, 'complete')}
                    className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                    {acting === `${b._id}:complete` ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={16} /> Complete Work</>}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}

        {history.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3">Past jobs</h2>
            <div className="bg-white rounded-2xl border divide-y">
              {history.map((b) => (
                <div key={b._id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold capitalize">{b.category.replace(/-/g, ' ')} · {b.customerName}</p>
                    <p className="text-gray-400 text-xs truncate">{fmtDT(b.completedAt || b.acceptedAt)} · {b.workAddress}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">{b.bookingStatus === 'completed' ? `₹${inr(b.youEarn)}` : 'Cancelled'}</p>
                    {b.workDurationMinutes != null && <p className="text-xs text-gray-400">{fmtDur(Math.round(b.workDurationMinutes * 60))}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}