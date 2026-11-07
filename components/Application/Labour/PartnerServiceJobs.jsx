'use client'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Banknote, CalendarClock, CheckCircle2, Clock, IndianRupee, Loader2, MapPin, Navigation, Phone, Play, StickyNote, Wallet,
} from 'lucide-react'
import { connectSocket } from '@/lib/socket-client'
import BackButton from './BackButton'

const inr = (n) => Math.round(n || 0).toLocaleString('en-IN')
const fmtDur = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}h ${m}m ${x}s` : `${m}m ${String(x).padStart(2, '0')}s` }

function Timer({ from }) {
  const [, t] = useState(0)
  useEffect(() => { const i = setInterval(() => t((n) => n + 1), 1000); return () => clearInterval(i) }, [])
  return <>{fmtDur(Math.max(0, Math.round((Date.now() - new Date(from)) / 1000)))}</>
}

function JobCard({ j, onAction, busy }) {
  const [cashOk, setCashOk] = useState(false)
  const offered = j.assignStatus === 'offered'
  const working = j.status === 'in_progress'
  const done = j.status === 'completed'
  const addr = [j.address?.full, j.address?.landmark, j.address?.city, j.address?.pincode].filter(Boolean).join(', ')
  const maps = addr ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}` : null

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl border p-5 space-y-4 ${offered ? 'border-amber-300 shadow-lg shadow-amber-200/40' : working ? 'border-emerald-400' : 'border-zinc-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">#{j.code}</p>
          <h3 className="text-lg font-black text-zinc-900 truncate">{j.categoryName}</h3>
          <p className="text-xs text-zinc-500 truncate">{j.serviceName}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${offered ? 'bg-amber-100 text-amber-700' : working ? 'bg-emerald-100 text-emerald-700' : done ? 'bg-zinc-900 text-white' : j.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
          {offered ? 'NEW · accept?' : working ? 'WORKING' : done ? 'COMPLETED' : j.status === 'cancelled' ? 'CANCELLED' : 'ACCEPTED'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-50 rounded-2xl p-3"><p className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1"><CalendarClock size={11} /> Slot</p>
          <p className="text-sm font-black">{j.slotDate}</p><p className="text-xs text-zinc-500">{j.slotTime}</p></div>
        <div className="bg-emerald-50 rounded-2xl p-3"><p className="text-[10px] font-bold uppercase text-emerald-700">You earn</p>
          <p className="text-xl font-black text-emerald-800 flex items-center"><IndianRupee size={15} />{inr(j.youEarn)}</p></div>
      </div>

      <div className="flex items-start gap-2 text-sm">
        <MapPin size={16} className="mt-0.5 shrink-0 text-zinc-400" />
        <span>{offered ? <>{j.address?.city} {j.address?.pincode} <span className="text-zinc-400">· full address after accepting</span></> : addr}</span>
      </div>

      {!offered && j.customerPhone && !done && (
        <div className="flex gap-2">
          <a href={`tel:${j.customerPhone}`} className="flex-1 h-11 rounded-xl bg-zinc-900 text-white text-sm font-bold flex items-center justify-center gap-2"><Phone size={15} /> Call {j.customerName}</a>
          {maps && <a href={maps} target="_blank" rel="noreferrer" className="flex-1 h-11 rounded-xl border border-zinc-300 text-sm font-bold flex items-center justify-center gap-2"><Navigation size={15} /> Directions</a>}
        </div>
      )}
      {j.adminNote && <p className="text-xs bg-blue-50 border border-blue-100 text-blue-800 rounded-xl px-3 py-2 flex gap-2"><StickyNote size={14} className="shrink-0" />{j.adminNote}</p>}

      <div className="flex items-center gap-2 text-sm font-semibold border-t pt-3">
        {j.paymentMethod === 'cash' ? <Banknote size={16} /> : <Wallet size={16} />}
        {j.paymentMethod === 'cash'
          ? <span>Cash job · collect <b>₹{inr(j.total)}</b> · fee ₹{inr(j.commission)} added to your dues</span>
          : <span>Paid online ✓ · ₹{inr(j.youEarn)} goes to your wallet</span>}
      </div>

      {working && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
          <Clock className="text-emerald-600" />
          <div><p className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold">Work time</p>
            <p className="text-xl font-black text-emerald-700 tabular-nums"><Timer from={j.startedAt} /></p></div>
        </div>
      )}

      {offered && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={!!busy} onClick={() => onAction(j, 'decline')} className="h-12 rounded-2xl border-2 border-zinc-200 font-black text-zinc-600 disabled:opacity-50">
            {busy === `${j._id}decline` ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Decline'}</button>
          <button type="button" disabled={!!busy} onClick={() => onAction(j, 'accept')} className="h-12 rounded-2xl bg-emerald-600 text-white font-black disabled:opacity-50">
            {busy === `${j._id}accept` ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Accept job'}</button>
        </div>
      )}
      {!offered && j.status === 'assigned' && (
        <button type="button" disabled={!!busy} onClick={() => onAction(j, 'start', 'Have you reached the site? The work timer will start.')}
          className="w-full h-14 rounded-2xl bg-black text-white font-black flex items-center justify-center gap-2 disabled:opacity-50">
          {busy === `${j._id}start` ? <Loader2 className="animate-spin" size={18} /> : <><Play size={16} /> Start work</>}
        </button>
      )}
      {working && (
        <div className="space-y-2">
          {j.paymentMethod === 'cash' && (
            <label className="flex items-start gap-2 text-sm font-semibold cursor-pointer bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <input type="checkbox" checked={cashOk} onChange={(e) => setCashOk(e.target.checked)} className="mt-0.5 w-4 h-4" />
              I have collected ₹{inr(j.total)} cash from the customer
            </label>
          )}
          <button type="button" disabled={!!busy || (j.paymentMethod === 'cash' && !cashOk)} onClick={() => onAction(j, 'complete', 'Is the work finished?', { cashReceived: cashOk })}
            className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center gap-2 disabled:opacity-40">
            {busy === `${j._id}complete` ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={16} /> Complete work</>}
          </button>
        </div>
      )}
      {!offered && j.status === 'assigned' && (
        <button type="button" onClick={() => onAction(j, 'decline', 'Give this job back to the admin?')} className="w-full text-xs font-bold text-zinc-400 hover:text-red-600">Can't do it? Return job to admin</button>
      )}
    </motion.div>
  )
}

export default function PartnerServiceJobs() {
  const [d, setD] = useState(null)
  const [tab, setTab] = useState('open')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    try { const { data } = await axios.get('/api/partner/service-jobs'); setD(data) } catch (e) { console.log(e) }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const s = connectSocket()
    const r = () => load()
    s.on('service-job-offer', r); s.on('service-job-update', r)
    window.addEventListener('labour-jobs-changed', r)
    return () => { s.off('service-job-offer', r); s.off('service-job-update', r); window.removeEventListener('labour-jobs-changed', r) }
  }, [load])

  const onAction = async (j, action, confirmMsg, extra = {}) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(j._id + action)
    try {
      await axios.post(`/api/partner/service-jobs/${j._id}`, { action, ...extra })
      toast.success({ accept: 'Job accepted', decline: 'Job returned to admin', start: 'Work started. Timer is running.', complete: 'Job completed!' }[action])
      window.dispatchEvent(new Event('labour-jobs-changed'))
      await load()
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); load() } finally { setBusy('') }
  }

  const open = d ? [...d.offers, ...d.active] : []
  const list = tab === 'open' ? open : d?.history || []

  return (
    <div className="min-h-screen bg-[#f4f5f7] pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3"><BackButton href="/partner/dashboard" /><div>
          <h1 className="text-2xl font-black">Assigned jobs</h1>
          <p className="text-xs text-zinc-500">Scheduled jobs the admin sent to you</p></div></div>

        <div className="bg-white rounded-2xl p-1.5 flex gap-1 border">
          {[['open', `Open (${open.length})`], ['history', 'History']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${tab === k ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>{l}</button>
          ))}
        </div>

        {!d ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
          : list.length === 0 ? (
            <div className="bg-white rounded-3xl border p-10 text-center">
              <CalendarClock className="mx-auto text-zinc-300" size={40} />
              <p className="font-black mt-3">{tab === 'open' ? 'No assigned jobs right now' : 'No past jobs yet'}</p>
              <p className="text-sm text-zinc-500 mt-1">When the admin assigns you a job, your phone will ring here.</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">{list.map((j) => <JobCard key={j._id} j={j} onAction={onAction} busy={busy} />)}</div>
            </AnimatePresence>
          )}
      </div>
    </div>
  )
}
