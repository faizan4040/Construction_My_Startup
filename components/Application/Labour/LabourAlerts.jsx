'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  BellRing, CalendarClock, Clock, IndianRupee, Loader2, MapPin, Volume2, X, Zap,
} from 'lucide-react'
import { connectSocket, disconnectSocket } from '@/lib/socket-client'
import { logout } from '@/store/reducer/authReducer'
import { audioReady, startRinging, stopRinging, systemNotify, unlockAudio } from '@/lib/alertSound'
import { CATEGORY_EMOJI, CATEGORY_LABEL } from './categoryMeta'

const inr = (n) => Math.round(n || 0).toLocaleString('en-IN')

function Countdown({ until, onEnd }) {
  const [left, setLeft] = useState(() => Math.max(0, Math.round((new Date(until) - Date.now()) / 1000)))
  useEffect(() => {
    const i = setInterval(() => {
      const l = Math.max(0, Math.round((new Date(until) - Date.now()) / 1000))
      setLeft(l)
      if (l === 0) { clearInterval(i); onEnd?.() }
    }, 1000)
    return () => clearInterval(i)
  }, [until, onEnd])
  return <span className="tabular-nums">{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span>
}

/**
 * Mounted once for a logged-in labour (LabourBackground).
 * - "new-booking"       live request from a customer  -> ringtone + popup (Accept / Reject, expires)
 * - "service-job-offer" admin assigned a scheduled job -> ringtone + popup (Accept / Decline)
 * - "account-status"    admin blocked / removed the account -> logged out at once
 */
export default function LabourAlerts() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [queue, setQueue] = useState([])
  const [busy, setBusy] = useState('')
  const [soundOk, setSoundOk] = useState(true)
  const queueRef = useRef([])
  queueRef.current = queue

  const remove = useCallback((id) => {
    setQueue((q) => {
      const next = q.filter((a) => a.id !== id)
      if (!next.length) stopRinging()
      return next
    })
  }, [])

  // browsers need one touch before sound may play
  useEffect(() => {
    const unlock = () => { unlockAudio(); setTimeout(() => setSoundOk(audioReady()), 100) }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    const t = setTimeout(() => setSoundOk(audioReady()), 1500)
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); clearTimeout(t) }
  }, [])

  useEffect(() => {
    const s = connectSocket()
    const push = (a) => {
      if (queueRef.current.some((x) => x.id === a.id)) return
      setQueue((q) => [...q, a])
      startRinging(a.kind === 'live' ? 60000 : 30000)
      systemNotify(a.title, a.body, a.id)
    }
    const onLive = (r) => push({
      id: String(r._id), kind: 'live', data: r,
      title: `New ${CATEGORY_LABEL[r.category] || 'labour'} request`,
      body: `₹${inr(r.fare)} · ${r.distanceKm != null ? `${r.distanceKm} km away` : r.workAddress || ''}`,
    })
    const onOffer = (j) => push({
      id: String(j._id), kind: 'service', data: j,
      title: `Job assigned: ${j.categoryName}`,
      body: `${j.slotDate} ${j.slotTime} · ${j.address?.city || ''} · earn ₹${inr(j.youEarn)}`,
    })
    const onGone = (p) => { if (p?.bookingId) remove(String(p.bookingId)) }
    const onSvc = (p) => { if (['unassigned', 'cancelled'].includes(p?.status)) { remove(String(p.bookingId)); toast.info(`Job #${p.code || ''} was ${p.status === 'cancelled' ? 'cancelled' : 'moved to another labour'}`) } }
    const onAccount = async (p) => {
      if (p?.status === 'active') return toast.success('Your account is active again')
      stopRinging()
      toast.error(p?.status === 'removed'
        ? 'Your account has been removed by admin.'
        : `Your account has been blocked by admin${p?.reason ? `: ${p.reason}` : ''}`, { autoClose: 8000 })
      try { await axios.post('/api/auth/logout') } catch { /* cookie may already be invalid */ }
      disconnectSocket()
      dispatch(logout())
      router.replace('/auth/login')
    }
    s.on('new-booking', onLive)
    s.on('service-job-offer', onOffer)
    s.on('booking-cancelled', onGone)
    s.on('service-job-update', onSvc)
    s.on('account-status', onAccount)
    return () => {
      s.off('new-booking', onLive); s.off('service-job-offer', onOffer); s.off('booking-cancelled', onGone)
      s.off('service-job-update', onSvc); s.off('account-status', onAccount)
      stopRinging()
    }
  }, [dispatch, remove, router])

  const act = async (a, accept) => {
    setBusy(accept ? 'accept' : 'reject')
    try {
      if (a.kind === 'live') {
        await axios.post(`/api/partner/bookings/${a.id}/${accept ? 'accept' : 'reject'}`, accept ? {} : { reason: 'declined' })
        remove(a.id)
        if (accept) { toast.success('Job accepted. Head to the site!'); router.push('/partner/active-job') }
      } else {
        await axios.post(`/api/partner/service-jobs/${a.id}`, { action: accept ? 'accept' : 'decline' })
        remove(a.id)
        if (accept) { toast.success('Job accepted'); router.push('/partner/service-jobs') }
      }
      window.dispatchEvent(new Event('labour-jobs-changed'))
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not update the job')
      remove(a.id)
    } finally { setBusy('') }
  }

  const a = queue[0]
  return (
    <>
      {!soundOk && (
        <button type="button" onClick={() => { unlockAudio(); setTimeout(() => setSoundOk(audioReady()), 100) }}
          className="fixed bottom-4 left-4 z-[1500] flex items-center gap-2 bg-amber-400 text-black text-xs font-bold px-3 py-2 rounded-full shadow-lg">
          <Volume2 size={14} /> Tap to enable job alert sound
        </button>
      )}
      <AnimatePresence>
        {a && (
          <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
            <motion.div initial={{ y: 80, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className={`px-5 py-4 flex items-center justify-between ${a.kind === 'live' ? 'bg-emerald-600' : 'bg-indigo-600'} text-white`}>
                <div className="flex items-center gap-2 font-black">
                  <motion.span animate={{ rotate: [0, -18, 18, -12, 12, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}><BellRing size={20} /></motion.span>
                  {a.kind === 'live' ? 'New live job request' : 'Admin assigned you a job'}
                </div>
                {queue.length > 1 && <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">+{queue.length - 1} more</span>}
                <button type="button" onClick={stopRinging} aria-label="Mute" className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center"><X size={16} /></button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-14 h-14 rounded-2xl bg-zinc-900 text-2xl flex items-center justify-center">
                    {a.kind === 'live' ? CATEGORY_EMOJI[a.data.category] || '👷' : '🛠️'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-black truncate">{a.kind === 'live' ? CATEGORY_LABEL[a.data.category] : a.data.categoryName}</p>
                    <p className="text-xs text-zinc-500 truncate">{a.kind === 'live' ? `${a.data.pricingType === 'hourly' ? `${a.data.duration} hour(s)` : `${a.data.duration} day(s)`}` : `#${a.data.code} · ${a.data.serviceName || ''}`}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{a.kind === 'live' ? 'Job value' : 'You earn'}</p>
                    <p className="text-2xl font-black text-emerald-800 flex items-center"><IndianRupee size={18} />{inr(a.kind === 'live' ? a.data.fare : a.data.youEarn)}</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3">
                    {a.kind === 'live' ? (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1"><Clock size={11} /> Expires in</p>
                        <p className="text-2xl font-black text-zinc-900"><Countdown until={a.data.requestExpiresAt} onEnd={() => remove(a.id)} /></p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1"><CalendarClock size={11} /> Slot</p>
                        <p className="text-sm font-black text-zinc-900 leading-tight mt-1">{a.data.slotDate}<br />{a.data.slotTime}</p>
                      </>
                    )}
                  </div>
                </div>

                <p className="flex items-start gap-2 text-sm text-zinc-700">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-zinc-400" />
                  {a.kind === 'live'
                    ? <span>{a.data.workAddress}{a.data.distanceKm != null && <b className="ml-1">· {a.data.distanceKm} km</b>}</span>
                    : <span>{a.data.address?.city} {a.data.address?.pincode} <span className="text-zinc-400">(full address after you accept)</span></span>}
                </p>
                {a.kind === 'service' && a.data.paymentMethod === 'cash' && (
                  <p className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <Zap size={13} /> Cash job: collect ₹{inr(a.data.total)} · platform fee ₹{inr(a.data.commission)} goes to your dues
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button type="button" disabled={!!busy} onClick={() => act(a, false)}
                    className="h-13 py-3.5 rounded-2xl border-2 border-zinc-200 font-black text-zinc-600 disabled:opacity-50">
                    {busy === 'reject' ? <Loader2 className="animate-spin mx-auto" size={18} /> : a.kind === 'live' ? 'Reject' : 'Decline'}
                  </button>
                  <button type="button" disabled={!!busy} onClick={() => act(a, true)}
                    className="h-13 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black disabled:opacity-50 shadow-lg shadow-emerald-600/30">
                    {busy === 'accept' ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Accept job'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
