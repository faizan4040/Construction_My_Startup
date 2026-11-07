'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  AlertTriangle, ArrowRight, Bell, Briefcase, CalendarClock, CheckCircle2, ChevronRight, Clock, History, IndianRupee, Loader2, MapPin, Navigation, Power, Star, Wallet, Wifi, WifiOff,
} from 'lucide-react'
import { connectSocket } from '@/lib/socket-client'
import { askNotificationPermission, unlockAudio } from '@/lib/alertSound'
import PartnerEarning from './PartnerEarning'
import { CATEGORY_EMOJI, CATEGORY_LABEL } from './categoryMeta'

const inr = (n) => Math.round(n || 0).toLocaleString('en-IN')
const LIVE_LABEL = {
  confirmed: 'Go to the site', arrived: 'You reached the site', started: 'Work in progress', work_completed: 'Collect OTP & finish',
}

function Stat({ icon: I, label, value, tone = 'bg-white' }) {
  return (
    <div className={`${tone} border border-zinc-200/70 rounded-2xl p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5"><I size={12} />{label}</p>
      <p className="text-2xl font-black text-zinc-900 mt-1">{value}</p>
    </div>
  )
}

export default function PartnerHome({ onNotLive }) {
  const [d, setD] = useState(null)
  const [toggling, setToggling] = useState(false)
  const [socketUp, setSocketUp] = useState(true)
  const [geo, setGeo] = useState('unknown')
  const timer = useRef(null)
  const notLive = useRef(onNotLive)
  notLive.current = onNotLive

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/partner/home')
      if (!data.live) return notLive.current?.()
      setD(data)
    } catch (e) { console.log(e) }
  }, [])

  useEffect(() => { load() }, [load])

  // refresh on any job / wallet event
  useEffect(() => {
    const s = connectSocket()
    setSocketUp(s.connected)
    const soon = () => { clearTimeout(timer.current); timer.current = setTimeout(load, 400) }
    const up = () => { setSocketUp(true); soon() }
    const down = () => setSocketUp(false)
    const evts = ['new-booking', 'booking-update', 'booking-cancelled', 'service-job-offer', 'service-job-update', 'wallet-update']
    evts.forEach((e) => s.on(e, soon))
    s.on('connect', up); s.on('disconnect', down)
    window.addEventListener('labour-jobs-changed', soon)
    const poll = setInterval(() => document.visibilityState === 'visible' && load(), 30000)
    return () => {
      evts.forEach((e) => s.off(e, soon)); s.off('connect', up); s.off('disconnect', down)
      window.removeEventListener('labour-jobs-changed', soon); clearInterval(poll); clearTimeout(timer.current)
    }
  }, [load])

  useEffect(() => {
    let st
    navigator.permissions?.query({ name: 'geolocation' }).then((p) => { st = p; setGeo(p.state); p.onchange = () => setGeo(p.state) }).catch(() => {})
    return () => { if (st) st.onchange = null }
  }, [])

  const toggle = async () => {
    if (toggling || !d) return
    const next = !d.online
    if (next) {
      unlockAudio(); askNotificationPermission()
      // ask for GPS right away (the browser prompt must come from a tap)
      navigator.geolocation?.getCurrentPosition(() => setGeo('granted'), (e) => e.code === 1 && setGeo('denied'), { enableHighAccuracy: true, timeout: 15000 })
    }
    setToggling(true)
    try {
      await axios.post('/api/partner/availability', { online: next })
      setD((x) => ({ ...x, online: next }))
      window.dispatchEvent(new CustomEvent('labour-availability', { detail: { online: next, live: true } }))
      toast[next ? 'success' : 'info'](next ? "You're ON duty. New jobs will ring here." : "You're OFF duty. You won't get new jobs.")
    } catch (e) { toast.error(e.response?.data?.message || 'Could not change status') } finally { setToggling(false) }
  }

  if (!d) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-zinc-400" /></div>

  const w = d.wallet
  const duesBlocked = w.dues > d.rules.maxCashDues
  const job = d.activeJob
  const offers = d.serviceJobs.filter((j) => j.assignStatus === 'offered')
  const svcActive = d.serviceJobs.filter((j) => j.assignStatus === 'accepted')

  return (
    <div className="min-h-screen bg-[#f4f5f7] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Duty card ── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-5 sm:p-7 text-white shadow-xl transition-colors duration-500 ${d.online ? 'bg-linear-to-br from-emerald-600 to-emerald-800' : 'bg-linear-to-br from-zinc-800 to-zinc-950'}`}>
          <div className="flex items-center gap-4">
            {d.user.photo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={d.user.photo} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30" />
              : <span className="w-14 h-14 rounded-2xl bg-white/15 text-2xl flex items-center justify-center">{CATEGORY_EMOJI[d.profile?.category] || '👷'}</span>}
            <div className="min-w-0 flex-1">
              <p className="text-white/70 text-xs font-semibold">Namaste,</p>
              <h1 className="text-xl sm:text-2xl font-black truncate">{d.user.name}</h1>
              <p className="text-xs text-white/70 flex items-center gap-2 mt-0.5">
                {CATEGORY_LABEL[d.profile?.category] || 'Labour'}
                <span className="flex items-center gap-0.5"><Star size={11} className="fill-amber-300 text-amber-300" />{d.profile?.rating ? d.profile.rating.toFixed(1) : 'New'}</span>
                · {d.totalJobs} jobs
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 bg-black/15 rounded-2xl p-4">
            <div className="min-w-0">
              <p className="text-lg font-black">{d.online ? "You're ON duty" : "You're OFF duty"}</p>
              <p className="text-xs text-white/70">{d.online ? 'Customers near you can book you now' : 'Turn ON to start getting jobs'}</p>
            </div>
            <button type="button" role="switch" aria-checked={d.online} onClick={toggle} disabled={toggling}
              className={`relative shrink-0 w-23 h-12 rounded-full transition-colors duration-300 ${d.online ? 'bg-white' : 'bg-white/20'} disabled:opacity-60`}>
              <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={`absolute top-1 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${d.online ? 'right-1 bg-emerald-600 text-white' : 'left-1 bg-white text-zinc-900'}`}>
                {toggling ? <Loader2 size={16} className="animate-spin" /> : <Power size={18} />}
              </motion.span>
              <span className={`absolute inset-y-0 flex items-center text-[11px] font-black ${d.online ? 'left-3 text-emerald-700' : 'right-3 text-white/80'}`}>{d.online ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {d.online && (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${socketUp ? 'bg-white/15' : 'bg-red-500'}`}>{socketUp ? <Wifi size={12} /> : <WifiOff size={12} />}{socketUp ? 'Connected' : 'Reconnecting…'}</span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${geo === 'denied' ? 'bg-red-500' : 'bg-white/15'}`}><MapPin size={12} />{geo === 'denied' ? 'Location blocked: allow it in browser settings' : 'Location sharing ON'}</span>
            </div>
          )}
        </motion.section>

        {duesBlocked && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div className="text-sm"><b>You owe ₹{inr(w.dues)} platform fee.</b> Above ₹{inr(d.rules.maxCashDues)} you stop getting live jobs. <Link href="/partner/wallet" className="underline font-bold">Pay dues now</Link></div>
          </div>
        )}

        {/* ── Running live job ── */}
        {job && (
          <Link href="/partner/active-job" className="block">
            <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="bg-white border-2 border-emerald-500 rounded-3xl p-5 flex items-center gap-4 shadow-lg shadow-emerald-500/10">
              <span className="relative w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center"><Navigation size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Live job · {CATEGORY_LABEL[job.category]}</p>
                <p className="font-black text-zinc-900">{LIVE_LABEL[job.bookingStatus]}</p>
                <p className="text-xs text-zinc-500 truncate">{job.workAddress}</p>
              </div>
              <span className="text-sm font-black flex items-center gap-1 text-emerald-700">Open map <ArrowRight size={16} /></span>
            </motion.div>
          </Link>
        )}

        {/* ── Service jobs from admin ── */}
        {(offers.length > 0 || svcActive.length > 0) && (
          <section className="bg-white border border-zinc-200/70 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black flex items-center gap-2"><CalendarClock size={18} /> Assigned jobs</h2>
              <Link href="/partner/service-jobs" className="text-xs font-bold text-zinc-500 flex items-center">View all <ChevronRight size={14} /></Link>
            </div>
            <div className="space-y-2">
              {[...offers, ...svcActive].slice(0, 4).map((j) => (
                <Link key={j._id} href="/partner/service-jobs" className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 hover:bg-zinc-50">
                  <span className={`w-2.5 h-2.5 rounded-full ${j.assignStatus === 'offered' ? 'bg-amber-500 animate-pulse' : j.status === 'in_progress' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black truncate">{j.categoryName} <span className="text-zinc-400 font-semibold">#{j.code}</span></p>
                    <p className="text-xs text-zinc-500">{j.slotDate} · {j.slotTime} · {j.address?.city}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${j.assignStatus === 'offered' ? 'bg-amber-100 text-amber-700' : j.status === 'in_progress' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {j.assignStatus === 'offered' ? 'Accept?' : j.status === 'in_progress' ? 'Working' : 'Upcoming'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Today ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={IndianRupee} label="Today's earning" value={`₹${inr(d.today.earned)}`} tone="bg-emerald-50" />
          <Stat icon={CheckCircle2} label="Jobs today" value={d.today.jobs} />
          <Stat icon={Clock} label="Work time today" value={`${Math.floor(d.today.minutes / 60)}h ${d.today.minutes % 60}m`} />
          <Link href="/partner/pending-requests" className="block">
            <Stat icon={Bell} label="Live requests" value={d.pendingRequests} tone={d.pendingRequests ? 'bg-amber-50' : 'bg-white'} />
          </Link>
        </section>

        {/* ── Wallet ── */}
        <section className="bg-white border border-zinc-200/70 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black flex items-center gap-2"><Wallet size={18} /> Wallet</h2>
            <Link href="/partner/wallet" className="text-xs font-bold bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center gap-1">Open <ArrowRight size={13} /></Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Withdrawable</p><p className="text-xl sm:text-2xl font-black">₹{inr(w.withdrawable)}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">On hold</p><p className="text-xl sm:text-2xl font-black text-zinc-500">₹{inr(w.pending)}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Dues to pay</p><p className={`text-xl sm:text-2xl font-black ${w.dues ? 'text-red-600' : 'text-zinc-300'}`}>₹{inr(w.dues)}</p></div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-3">Platform fee: {d.rules.commissionPercent}% on live jobs. On cash jobs the fee becomes dues; your next online earnings clear it automatically.</p>
        </section>

        {/* ── Quick links ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['/partner/pending-requests', Bell, 'Live requests'],
            ['/partner/service-jobs', Briefcase, 'Assigned jobs'],
            ['/partner/bookings', History, 'Job history'],
            ['/partner/wallet', Wallet, 'Wallet & bank'],
          ].map(([href, I, label]) => (
            <Link key={href} href={href} className="bg-white border border-zinc-200/70 rounded-2xl p-4 flex items-center gap-3 hover:border-zinc-900 transition-colors">
              <I size={18} /><span className="text-sm font-bold">{label}</span>
            </Link>
          ))}
        </section>

        <PartnerEarning />
      </div>
    </div>
  )
}
