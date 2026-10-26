'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle, Banknote, CheckCircle2, Clock, IndianRupee, KeyRound, Loader2, MapPin, MessageCircle,
  Navigation, Phone, Play, User, Wallet, XCircle,
} from 'lucide-react'
import { connectSocket, joinJobRoom, sendLabourLocationUpdate } from '@/lib/socket-client'
import BackButton from './BackButton'
import LabourChat from './LabourChat'
import { CATEGORY_LABEL } from './categoryMeta'

const LiveLabourMap = dynamic(() => import('./LiveLabourMap'), { ssr: false })

const inr = (n) => Number(n || 0).toLocaleString('en-IN')
const fmtDur = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}h ${m}m ${x}s` : `${m}m ${String(x).padStart(2, '0')}s` }
const LABEL = { confirmed: 'Head to the work site', arrived: 'You have arrived', started: 'Work in progress', work_completed: 'Enter the customer OTP' }
const REASONS = ['Customer not reachable', 'Wrong address', 'Vehicle / health problem', 'Other']

function Timer({ startedAt }) {
  const [, t] = useState(0)
  useEffect(() => { const i = setInterval(() => t((n) => n + 1), 1000); return () => clearInterval(i) }, [])
  return <>{fmtDur(Math.max(0, Math.round((Date.now() - new Date(startedAt)) / 1000)))}</>
}

export default function PartnerActiveJob() {
  const router = useRouter()
  const [b, setB] = useState(null)
  const [state, setState] = useState('loading')
  const [myPos, setMyPos] = useState(null)
  const [stats, setStats] = useState(null)
  const [chat, setChat] = useState(false)
  const [acting, setActing] = useState('')
  const [err, setErr] = useState('')
  const [otp, setOtp] = useState('')
  const [cashOk, setCashOk] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0])
  const [done, setDone] = useState(null)
  const posRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/partner/bookings/active')
      setB(data.booking); setState('ready')
    } catch (e) {
      if (e.response?.status === 401) router.push('/auth/login')
      else setState((s) => (s === 'ready' ? s : 'error'))
    }
  }, [router])

  useEffect(() => { load() }, [load])

  const bid = b?._id
  useEffect(() => {
    if (!bid) return
    const s = connectSocket()
    const join = () => joinJobRoom(bid)
    const refresh = () => load()
    s.on('connect', join); s.on('booking-update', refresh); s.on('booking-cancelled', refresh)
    if (s.connected) join()
    const poll = setInterval(() => document.visibilityState === 'visible' && load(), 15000)
    return () => { s.off('connect', join); s.off('booking-update', refresh); s.off('booking-cancelled', refresh); clearInterval(poll) }
  }, [bid, load])

  // own GPS -> map + customer; re-sent every 4s even when standing still
  const live = b && ['confirmed', 'arrived', 'started'].includes(b.bookingStatus)
  useEffect(() => {
    if (!bid || !live || !navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => {
        posRef.current = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }
        setMyPos([coords.latitude, coords.longitude])
      },
      (e) => console.warn('gps', e.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )
    const t = setInterval(() => { if (posRef.current) sendLabourLocationUpdate({ bookingId: bid, ...posRef.current }) }, 4000)
    return () => { navigator.geolocation.clearWatch(id); clearInterval(t) }
  }, [bid, live])

  const act = async (action, body, confirmMsg) => {
    if (acting) return
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setActing(action); setErr('')
    try {
      const { data } = await axios.post(`/api/partner/bookings/${bid}/${action}`, body || {})
      if (action === 'finish') { setDone(data); setB(null); return }
      if (action === 'cancel') { router.push('/partner/dashboard'); return }
      setOtp(''); await load()
    } catch (e) {
      setErr(e.response?.data?.message || 'Action failed. Try again.')
      load()
    } finally { setActing('') }
  }

  if (state === 'loading') return <div className="h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-white" /></div>

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4 pt-24">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border shadow-xl p-8 max-w-sm w-full text-center">
        <CheckCircle2 size={52} className="mx-auto text-emerald-600 mb-3" />
        <h2 className="text-2xl font-black">Job completed!</h2>
        <p className="text-sm text-zinc-500 mt-1">You earned</p>
        <p className="text-4xl font-black flex items-center justify-center"><IndianRupee size={28} />{inr(done.youEarn)}</p>
        <p className="text-xs text-zinc-400 mt-2">
          {done.method === 'cash' ? `₹${inr(done.commission)} platform fee is added to your wallet dues.` : 'It will be available in your wallet after the settlement period.'}
        </p>
        <button onClick={() => router.push('/partner/wallet')} className="w-full h-12 mt-6 rounded-xl bg-zinc-900 text-white font-bold">Open wallet</button>
        <button onClick={() => router.push('/partner/dashboard')} className="w-full mt-2 text-sm font-semibold text-zinc-500 py-2">Back to dashboard</button>
      </motion.div>
    </div>
  )

  if (!b) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4 pt-24">
      <div className="text-center"><p className="font-black text-xl">No active job</p>
        <p className="text-sm text-zinc-500 mt-1">Accept a request to see it here.</p>
        <button onClick={() => router.push('/partner/pending-requests')} className="mt-5 px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold">Job requests</button></div>
    </div>
  )

  const st = b.bookingStatus
  const site = b.workCoordinates ? [b.workCoordinates[1], b.workCoordinates[0]] : null
  const nav = b.workCoordinates ? `https://www.google.com/maps/dir/?api=1&destination=${b.workCoordinates[1]},${b.workCoordinates[0]}` : null

  return (
    <div className="pt-24 h-screen bg-zinc-100 overflow-hidden">
      <div className="h-full flex flex-col lg:flex-row">
        <div className="relative h-[42vh] lg:h-full lg:flex-1">
          <LiveLabourMap sitePos={site} labourPos={myPos} category={b.category} status={st} onStats={setStats} />
          <div className="absolute top-4 left-4 z-[500]"><BackButton href="/partner/dashboard" /></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-zinc-100">
            <span className="text-xs font-bold text-zinc-900 whitespace-nowrap">{LABEL[st]}</span>
          </div>
        </div>

        <aside className="lg:w-[440px] bg-white lg:border-l border-zinc-100 overflow-y-auto flex-1 lg:flex-none">
          <div className="p-5 space-y-4">
            {err && <p className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-3 py-2"><AlertCircle size={14} />{err}</p>}

            {st === 'confirmed' && stats && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4"><p className="text-[10px] text-zinc-400 uppercase font-bold">Reach in</p>
                  <p className="text-2xl font-black">{Math.max(1, Math.round(stats.timeS / 60))}<span className="text-xs text-zinc-400 ml-1">min</span></p></div>
                <div className="bg-zinc-900 rounded-2xl p-4"><p className="text-[10px] text-zinc-500 uppercase font-bold">Distance</p>
                  <p className="text-2xl font-black text-white">{(stats.distanceM / 1000).toFixed(1)}<span className="text-xs text-zinc-500 ml-1">km</span></p></div>
              </div>
            )}

            {st === 'started' && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                <Clock className="text-emerald-600" />
                <div><p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Work time</p>
                  <p className="text-2xl font-black text-emerald-700 tabular-nums"><Timer startedAt={b.startedAt} /></p></div>
              </div>
            )}

            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1 mb-2"><User size={11} /> Customer</p>
              <p className="font-black text-zinc-900">{b.customerName}</p>
              <div className="flex gap-2 mt-3">
                <a href={`tel:${b.customerPhone}`} className="flex-1 h-11 rounded-xl bg-zinc-900 text-white text-sm font-bold flex items-center justify-center gap-2"><Phone size={15} /> Call</a>
                <button type="button" onClick={() => setChat((c) => !c)} className="flex-1 h-11 rounded-xl border border-zinc-300 text-sm font-bold flex items-center justify-center gap-2"><MessageCircle size={15} /> {chat ? 'Close' : 'Message'}</button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">{b.customerPhone}</p>
            </div>
            <AnimatePresence>{chat && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <LabourChat bookingId={bid} role="labour" title={b.customerName} /></motion.div>}</AnimatePresence>

            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1 mb-1"><MapPin size={11} /> Work site · {CATEGORY_LABEL[b.category]}</p>
              <p className="text-sm font-semibold leading-snug">{b.siteDetails ? `${b.siteDetails}, ` : ''}{b.workAddress}</p>
              {nav && <a href={nav} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold underline"><Navigation size={13} /> Open in Google Maps</a>}
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 grid grid-cols-2 gap-3">
              <div><p className="text-[10px] text-zinc-400 uppercase font-bold">Booking value</p><p className="text-xl font-black flex items-center"><IndianRupee size={15} />{inr(b.fare)}</p></div>
              <div><p className="text-[10px] text-zinc-400 uppercase font-bold">You earn</p><p className="text-xl font-black flex items-center text-emerald-700"><IndianRupee size={15} />{inr(b.youEarn)}</p></div>
              <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-zinc-100">
                {b.paymentMethod === 'cash' ? <Banknote size={16} /> : <Wallet size={16} />}
                <span className="text-sm font-bold">
                  {!b.paymentMethod ? 'Customer is choosing payment…'
                    : b.paymentMethod === 'cash' ? `Cash: collect ₹${inr(b.fare)} from the customer`
                    : b.paymentStatus === 'paid' ? 'Paid online ✓' : 'Online payment pending…'}
                </span>
              </div>
            </div>

            {/* actions */}
            {st === 'confirmed' && (
              <button type="button" disabled={!!acting} onClick={() => act('arrived')} className="w-full h-12 rounded-xl border-2 border-zinc-900 font-bold text-sm disabled:opacity-50 flex items-center justify-center">
                {acting === 'arrived' ? <Loader2 className="animate-spin" size={16} /> : "I've reached the site"}
              </button>
            )}
            {(st === 'confirmed' || st === 'arrived') && (
              <button type="button" disabled={!!acting || st !== 'arrived' || !b.paymentReady} onClick={() => act('start')}
                className="w-full h-14 rounded-2xl bg-black text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40">
                {acting === 'start' ? <Loader2 className="animate-spin" size={18} /> : <><Play size={16} /> Start Work</>}
              </button>
            )}
            {st === 'arrived' && !b.paymentReady && <p className="text-xs text-amber-600 text-center -mt-2">Waiting for the customer to choose / complete payment</p>}

            {st === 'started' && (
              <button type="button" disabled={!!acting} onClick={() => act('complete', {}, 'Is the work finished? This stops the timer and sends an OTP to the customer.')}
                className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {acting === 'complete' ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={16} /> Complete Work</>}
              </button>
            )}

            {st === 'work_completed' && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-700 flex items-center gap-1.5"><KeyRound size={13} /> Ask the customer for the OTP</p>
                <p className="text-xs text-violet-700">Work time: {b.workDurationMinutes != null ? fmtDur(Math.round(b.workDurationMinutes * 60)) : '—'}</p>
                <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="· · · ·"
                  className="w-full border-2 border-violet-200 focus:border-violet-600 rounded-xl py-3 text-center text-3xl tracking-[0.5em] font-black outline-none bg-white" />
                {b.paymentMethod === 'cash' && (
                  <label className="flex items-start gap-2 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" checked={cashOk} onChange={(e) => setCashOk(e.target.checked)} className="mt-1 w-4 h-4" />
                    I have received ₹{inr(b.fare)} cash from the customer
                  </label>
                )}
                <button type="button" onClick={() => act('finish', { otp, cashReceived: cashOk })}
                  disabled={!!acting || otp.length !== 4 || (b.paymentMethod === 'cash' && !cashOk)}
                  className="w-full h-12 rounded-xl bg-violet-700 text-white font-bold disabled:opacity-40 flex items-center justify-center">
                  {acting === 'finish' ? <Loader2 className="animate-spin" size={16} /> : 'Verify & finish job'}
                </button>
                <button type="button" onClick={() => act('complete')} className="w-full text-xs font-semibold text-violet-700 underline">Resend OTP</button>
              </div>
            )}

            {['confirmed', 'arrived'].includes(st) && (
              <button type="button" onClick={() => setCancelOpen(true)} className="w-full h-11 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-500 hover:text-red-600 hover:border-red-300">Cancel this job</button>
            )}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {cancelOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/50 flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="bg-white rounded-3xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-black flex items-center gap-2"><XCircle className="text-red-500" size={20} /> Cancel this job?</h3>
              <p className="text-xs text-zinc-500 mt-1">The customer will be notified. Frequent cancellations can affect your account.</p>
              <div className="mt-4 space-y-2">
                {REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm font-semibold cursor-pointer"><input type="radio" checked={reason === r} onChange={() => setReason(r)} /> {r}</label>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setCancelOpen(false)} className="flex-1 h-11 rounded-xl border border-zinc-200 font-bold text-sm">Keep job</button>
                <button onClick={() => act('cancel', { reason })} disabled={!!acting} className="flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center">
                  {acting === 'cancel' ? <Loader2 size={16} className="animate-spin" /> : 'Yes, cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}