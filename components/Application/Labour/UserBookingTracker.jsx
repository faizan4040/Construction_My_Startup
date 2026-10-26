'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle, BadgeCheck, Banknote, Briefcase, CheckCircle2, Clock, IndianRupee, KeyRound,
  Loader2, MapPin, MessageCircle, Star, Wallet, XCircle,
} from 'lucide-react'
import { connectSocket, getSocket, joinJobRoom } from '@/lib/socket-client'
import BackButton from './BackButton'
import LabourChat from './LabourChat'
import { CATEGORY_EMOJI, CATEGORY_LABEL } from './categoryMeta'

const LiveLabourMap = dynamic(() => import('./LiveLabourMap'), { ssr: false })

const STATUS = {
  confirmed: { label: 'Labour is on the way', dot: 'bg-amber-400' },
  arrived: { label: 'Labour has arrived', dot: 'bg-indigo-500' },
  started: { label: 'Work in progress', dot: 'bg-emerald-500' },
  work_completed: { label: 'Work finished · share the OTP', dot: 'bg-violet-500' },
  completed: { label: 'Completed', dot: 'bg-zinc-400' },
}
const inr = (n) => Number(n || 0).toLocaleString('en-IN')
const fmtDur = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}h ${m}m` : `${m}m ${String(x).padStart(2, '0')}s` }

function WorkTimer({ startedAt }) {
  const [, t] = useState(0)
  useEffect(() => { const i = setInterval(() => t((n) => n + 1), 1000); return () => clearInterval(i) }, [])
  return <>{fmtDur(Math.max(0, Math.round((Date.now() - new Date(startedAt)) / 1000)))}</>
}

function ReviewCard({ bookingId, onDone }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const submit = async () => {
    if (!rating) return setErr('Please select a star rating')
    setBusy(true)
    try { await axios.post(`/api/booking/${bookingId}/review`, { rating, comment }); onDone() }
    catch (e) { setErr(e.response?.data?.message || 'Could not submit'); setBusy(false) }
  }
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-lg">
      <div className="text-center mb-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
          <CheckCircle2 size={34} className="text-emerald-600" />
        </motion.div>
        <h3 className="text-xl font-black text-zinc-900">Work completed!</h3>
        <p className="text-sm text-zinc-400">How was the labour's work?</p>
      </div>
      <div className="flex justify-center gap-1.5 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star size={34} className={`transition-all ${(hover || rating) >= n ? 'fill-amber-400 text-amber-400 scale-110' : 'text-zinc-300'}`} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={3} placeholder="Write a review (optional)"
        className="w-full border border-zinc-200 rounded-xl p-3 text-sm outline-none focus:border-zinc-900" />
      {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      <button type="button" onClick={submit} disabled={busy}
        className="w-full h-12 mt-4 rounded-xl bg-zinc-900 text-white font-bold disabled:opacity-40 flex items-center justify-center">
        {busy ? <Loader2 className="animate-spin" size={16} /> : 'Submit review'}
      </button>
      <button type="button" onClick={onDone} className="w-full mt-2 text-xs font-semibold text-zinc-400 hover:text-zinc-700 py-2">Skip</button>
    </motion.div>
  )
}

export default function UserBookingTracker({ bookingId }) {
  const router = useRouter()
  const [b, setB] = useState(null)
  const [state, setState] = useState('loading')
  const [pos, setPos] = useState(null)
  const [stats, setStats] = useState(null)
  const [chat, setChat] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const posAt = useRef(0)

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/booking/${bookingId}`)
      const x = data.booking
      setB(x); setState('ready')
      if (x.labourPosition && x.labourPosition.at > posAt.current) { posAt.current = x.labourPosition.at; setPos([x.labourPosition.lat, x.labourPosition.lon]) }
      // payment not decided yet -> back to the payment screen
      if (['confirmed', 'arrived'].includes(x.bookingStatus) && !(x.paymentMethod === 'cash' || x.paymentStatus === 'paid')) router.replace('/user/checkout')
    } catch (e) {
      if (e.response?.status === 401) router.push('/auth/login')
      else setState((s) => (s === 'ready' ? s : 'error'))
    }
  }, [bookingId, router])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const s = connectSocket()
    const join = () => joinJobRoom(bookingId)
    const onUpdate = () => load()
    const onLoc = (p) => { posAt.current = p.at || Date.now(); setPos([p.latitude, p.longitude]) }
    s.on('connect', join); s.on('booking-update', onUpdate); s.on('labour-location', onLoc)
    if (s.connected) join()
    const poll = setInterval(() => document.visibilityState === 'visible' && load(), 15000)
    return () => { s.off('connect', join); s.off('booking-update', onUpdate); s.off('labour-location', onLoc); clearInterval(poll) }
  }, [bookingId, load])

  const cancel = async () => {
    setBusy(true); setErr('')
    try { await axios.post(`/api/booking/${bookingId}/cancel`, { reason: 'customer_cancelled' }); router.push('/') }
    catch (e) { setErr(e.response?.data?.message || 'Could not cancel'); setBusy(false) }
  }

  if (state === 'loading') return <div className="h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-white" /></div>
  if (state === 'error' || !b) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-zinc-100">
      <AlertCircle className="text-red-500" /><p className="font-bold">Booking not found</p>
      <button onClick={() => router.push('/')} className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold">Go home</button>
    </div>
  )

  const st = b.bookingStatus
  const dead = ['cancelled', 'rejected', 'expired'].includes(st)
  const lab = b.labour
  const site = b.workCoordinates ? [b.workCoordinates[1], b.workCoordinates[0]] : null
  const canCancel = ['confirmed', 'arrived'].includes(st)
  const canChat = ['confirmed', 'arrived', 'started', 'work_completed'].includes(st)
  const cfg = STATUS[st]

  if (dead) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border shadow-xl p-8 max-w-sm w-full text-center">
        <XCircle size={44} className="mx-auto text-red-500 mb-3" />
        <h2 className="text-xl font-black">{b.cancelledBy === 'labour' ? 'Labour cancelled the booking' : b.cancelledBy === 'customer' ? 'Booking cancelled' : 'Booking closed'}</h2>
        {b.paymentStatus === 'refund_pending' && <p className="text-sm text-zinc-500 mt-2">Your refund is being processed.</p>}
        {b.paymentStatus === 'refunded' && <p className="text-sm text-emerald-600 mt-2 font-semibold">Your payment has been refunded.</p>}
        <button onClick={() => router.push('/')} className="w-full h-12 mt-6 rounded-xl bg-zinc-900 text-white font-bold">Back to home</button>
      </motion.div>
    </div>
  )

  return (
    <div className="pt-24 h-screen bg-zinc-100 overflow-hidden">
      <div className="h-full flex flex-col lg:flex-row">
        <div className="relative h-[42vh] lg:h-full lg:flex-1">
          <LiveLabourMap sitePos={site} labourPos={pos} category={b.category} status={st} onStats={setStats} />
          <div className="absolute top-4 left-4 z-[500]"><BackButton /></div>
          {cfg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-zinc-100">
              <span className={`w-2 h-2 rounded-full animate-pulse ${cfg.dot}`} />
              <span className="text-xs font-bold text-zinc-900 whitespace-nowrap">{cfg.label}</span>
            </div>
          )}
        </div>

        <aside className="lg:w-[440px] bg-white lg:border-l border-zinc-100 overflow-y-auto flex-1 lg:flex-none">
          <div className="p-5 space-y-4">
            {st === 'completed' ? (
              b.reviewed
                ? <div className="text-center py-10"><CheckCircle2 className="mx-auto text-emerald-600 mb-2" size={40} /><p className="font-black text-lg">Thanks for your review!</p>
                    <button onClick={() => router.push('/')} className="mt-5 px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold">Back to home</button></div>
                : <ReviewCard bookingId={bookingId} onDone={() => router.push('/')} />
            ) : (
              <>
                {st === 'confirmed' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1"><Clock size={11} /> Arrives in</p>
                      <p className="text-2xl font-black text-zinc-900">{stats ? `${Math.max(1, Math.round(stats.timeS / 60))}` : '—'}<span className="text-xs font-semibold text-zinc-400 ml-1">min</span></p>
                    </div>
                    <div className="bg-zinc-900 rounded-2xl p-4">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Distance</p>
                      <p className="text-2xl font-black text-white">{stats ? (stats.distanceM / 1000).toFixed(1) : '—'}<span className="text-xs font-semibold text-zinc-500 ml-1">km</span></p>
                    </div>
                  </div>
                )}

                {st === 'started' && (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                    <Clock className="text-emerald-600" />
                    <div><p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Work time</p>
                      <p className="text-2xl font-black text-emerald-700 tabular-nums"><WorkTimer startedAt={b.startedAt} /></p></div>
                  </div>
                )}

                {st === 'work_completed' && b.completeOtp && (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-violet-50 border border-violet-200 rounded-2xl p-5 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-700 flex items-center justify-center gap-1.5"><KeyRound size={13} /> Completion OTP</p>
                    <div className="flex justify-center gap-2 my-3">
                      {String(b.completeOtp).split('').map((d, i) => (
                        <span key={i} className="w-12 h-14 rounded-xl bg-white border-2 border-violet-300 flex items-center justify-center text-3xl font-black text-violet-800">{d}</span>
                      ))}
                    </div>
                    <p className="text-xs text-violet-700">Give this OTP to the labour <b>only after you are happy with the work</b>.</p>
                  </motion.div>
                )}

                {lab && (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center gap-4">
                    {lab.photo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={lab.photo} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                      : <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-3xl">{CATEGORY_EMOJI[b.category]}</div>}
                    <div className="min-w-0">
                      <p className="font-black text-lg text-zinc-900 flex items-center gap-1.5">
                        {CATEGORY_LABEL[b.category] || 'Labour'} {lab.isVerified && <BadgeCheck size={16} className="text-blue-500" />}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-zinc-500 mt-0.5">
                        <span className="flex items-center gap-1"><Star size={12} className={lab.rating ? 'fill-amber-400 text-amber-400' : ''} />{lab.rating ? Number(lab.rating).toFixed(1) : 'New'}{lab.totalReviews > 0 && ` (${lab.totalReviews})`}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} />{lab.experienceYears} yrs</span>
                        <span>{lab.completedJobs} jobs</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex gap-3">
                  <MapPin size={16} className="text-zinc-400 mt-0.5 shrink-0" />
                  <div><p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Work site</p>
                    <p className="text-sm font-semibold text-zinc-900 leading-snug">{b.siteDetails ? `${b.siteDetails}, ` : ''}{b.workAddress}</p></div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {b.paymentMethod === 'cash' ? <Banknote size={18} className="text-zinc-500" /> : <Wallet size={18} className="text-zinc-500" />}
                    <div><p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Payment</p>
                      <p className="text-sm font-bold text-zinc-900 capitalize">{b.paymentMethod || '—'}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black flex items-center justify-end"><IndianRupee size={14} />{inr(b.fare)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : b.paymentStatus === 'cash' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {b.paymentStatus === 'paid' ? 'Paid online' : b.paymentStatus === 'cash' ? 'Cash received' : b.paymentMethod === 'cash' ? 'Pay cash after work' : 'Pending'}
                    </span>
                  </div>
                </div>

                {canChat && (
                  <>
                    <button type="button" onClick={() => setChat((c) => !c)}
                      className="w-full h-12 rounded-xl bg-zinc-900 text-white font-bold flex items-center justify-center gap-2">
                      <MessageCircle size={16} /> {chat ? 'Close chat' : 'Message labour'}
                    </button>
                    <AnimatePresence>{chat && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <LabourChat bookingId={bookingId} role="customer" title={CATEGORY_LABEL[b.category] || 'Labour'} /></motion.div>}</AnimatePresence>
                  </>
                )}

                {canCancel && (
                  <button type="button" onClick={() => setCancelOpen(true)} className="w-full h-11 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-500 hover:text-red-600 hover:border-red-300">
                    Cancel booking
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {cancelOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/50 flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="bg-white rounded-3xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-black">Cancel this booking?</h3>
              <p className="text-sm text-zinc-500 mt-1">{b.paymentStatus === 'paid' ? 'Your online payment will be refunded.' : 'The labour will be notified.'}</p>
              {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
              <div className="flex gap-2 mt-5">
                <button onClick={() => setCancelOpen(false)} className="flex-1 h-11 rounded-xl border border-zinc-200 font-bold text-sm">Keep booking</button>
                <button onClick={cancel} disabled={busy} className="flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : 'Yes, cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}