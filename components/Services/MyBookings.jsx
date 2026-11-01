// components/Services/MyBookings.jsx
'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Loader2, MapPin, Search, Star, UserCheck, X } from 'lucide-react'
import { Badge, Pagination } from './Badge'
import { STATUS_UI, PAY_UI, inr, fmtDate } from './ui'
import { payOnline } from './payment'

const TABS = [['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Completed'], ['cancelled', 'Cancelled']]

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-3">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50" />
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="relative bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">{children}</motion.div>
    </div>
  )
}

export default function MyBookings() {
  const router = useRouter()
  const [tab, setTab] = useState('all')
  const [qi, setQi] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ bookings: [], pages: 1, counts: {} })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // {type, b}
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [rate, setRate] = useState({ rating: 0, comment: '' })

  useEffect(() => { const t = setTimeout(() => { setQ(qi.trim()); setPage(1) }, 350); return () => clearTimeout(t) }, [qi])

  const load = useCallback(async (silent) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await axios.get('/api/services/bookings', { params: { tab, q, page } })
      setData(data)
    } catch (e) { if (e.response?.status === 401) router.push('/auth/login?callback=/services/my-bookings') }
    finally { setLoading(false) }
  }, [tab, q, page, router])
  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(() => document.visibilityState === 'visible' && load(true), 30000); return () => clearInterval(t) }, [load])

  const close = () => { setModal(null); setErr(''); setRate({ rating: 0, comment: '' }) }
  const run = async (fn) => { setBusy(true); setErr(''); try { await fn(); close(); await load(true) } catch (e) { setErr(e.response?.data?.message || e.message || 'Failed') } finally { setBusy(false) } }

  return (
    <div className="bg-[#f4f7f5] min-h-screen pt-28 pb-16 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black">My Bookings</h1>
        <p className="text-sm text-zinc-500">Track and manage your service bookings.</p>

        <div className="flex flex-wrap gap-2 mt-5">
          {TABS.map(([k, l]) => <button key={k} type="button" onClick={() => { setTab(k); setPage(1) }}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${tab === k ? 'bg-[#0f7a55] text-white border-[#0f7a55]' : 'bg-white border-zinc-200'}`}>{l} ({data.counts[k] ?? 0})</button>)}
        </div>
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 mt-3 focus-within:border-[#0f7a55]">
          <Search size={15} className="text-zinc-400" />
          <input value={qi} onChange={(e) => setQi(e.target.value)} placeholder="Search by booking ID or service" className="flex-1 bg-transparent py-3 text-sm outline-none" />
        </div>

        <div className="space-y-3 mt-4">
          {loading && data.bookings.length === 0 ? <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>
            : data.bookings.length === 0 ? <div className="bg-white border rounded-2xl py-14 text-center"><p className="font-bold">No bookings yet</p><Link href="/services" className="text-sm text-[#0f7a55] underline">Browse services</Link></div>
            : data.bookings.map((b) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 rounded-2xl p-4 flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {b.providerImage ? <img src={b.providerImage} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" /> : <div className="w-20 h-20 rounded-xl bg-zinc-100" />}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <b className="text-xs text-zinc-500">#{b.code}</b><Badge map={STATUS_UI} k={b.status} />
                  </div>
                  <p className="font-black truncate">{b.categoryName} · {b.providerName}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><Calendar size={12} />{fmtDate(b.slotDate)}, {b.slotTime}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 truncate"><MapPin size={12} className="shrink-0" />{b.address.full}, {b.address.city}</p>
                  {b.assignedName && <p className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-1"><UserCheck size={12} />Professional: {b.assignedName}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <b className="mr-auto">{inr(b.total)}</b>
                    <Badge map={PAY_UI} k={b.paymentStatus} />
                    <button type="button" onClick={() => setModal({ type: 'view', b })} className="text-xs font-bold border border-zinc-300 px-3 py-1.5 rounded-lg">View Details</button>
                    {b.status === 'pending_payment' && <button type="button" onClick={() => run(() => payOnline({ bookingId: b._id, method: 'upi', prefill: { name: b.contactName, contact: b.contactPhone } }).then(() => router.push(`/services/booking/${b._id}`)))} className="text-xs font-bold bg-[#0f7a55] text-white px-3 py-1.5 rounded-lg">Pay now</button>}
                    {b.status === 'completed' && !b.reviewed && <button type="button" onClick={() => setModal({ type: 'review', b })} className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg">Rate</button>}
                    {['pending_payment', 'pending', 'confirmed'].includes(b.status) && <button type="button" onClick={() => setModal({ type: 'cancel', b })} className="text-xs font-bold border border-red-200 text-red-600 px-3 py-1.5 rounded-lg">Cancel</button>}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
        <Pagination page={page} pages={data.pages} onChange={setPage} />
      </div>

      <AnimatePresence>
        {modal?.type === 'view' && <Modal onClose={close}><div className="flex justify-between mb-3"><b>Booking #{modal.b.code}</b><button onClick={close} aria-label="Close"><X size={18} /></button></div>
          {[['Service', `${modal.b.categoryName} · ${modal.b.providerName}`], ['Date & Time', `${fmtDate(modal.b.slotDate)}, ${modal.b.slotTime}`], ['Address', `${modal.b.address.full}, ${modal.b.address.city} - ${modal.b.address.pincode}`], ['Contact', modal.b.contactName], ['Service charge', inr(modal.b.price)], ['Platform fee', inr(modal.b.fee)], ['Total', inr(modal.b.total)], ['Payment', `${modal.b.paymentMethod || '—'}`]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 text-sm py-2 border-b last:border-0"><span className="text-zinc-500">{k}</span><b className="text-right capitalize-none">{v}</b></div>)}
          {modal.b.assignedName && <p className="text-sm text-blue-700 font-semibold mt-3">Professional on the way: {modal.b.assignedName}</p>}</Modal>}

        {modal?.type === 'cancel' && <Modal onClose={close}><h3 className="font-black text-lg">Cancel booking #{modal.b.code}?</h3>
          <p className="text-sm text-zinc-500 mt-1">{modal.b.paymentStatus === 'paid' ? 'Your online payment will be refunded.' : 'This cannot be undone.'}</p>
          {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
          <div className="flex gap-2 mt-5"><button onClick={close} className="flex-1 border py-3 rounded-xl font-bold text-sm">Keep</button>
            <button disabled={busy} onClick={() => run(() => axios.post(`/api/services/bookings/${modal.b._id}/cancel`, {}))} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">{busy ? '...' : 'Yes, cancel'}</button></div></Modal>}

        {modal?.type === 'review' && <Modal onClose={close}><h3 className="font-black text-lg text-center">How was the service?</h3>
          <div className="flex justify-center gap-1.5 my-4">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setRate({ ...rate, rating: n })} aria-label={`${n} stars`}><Star size={34} className={rate.rating >= n ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} /></button>)}</div>
          <textarea rows={3} maxLength={500} value={rate.comment} onChange={(e) => setRate({ ...rate, comment: e.target.value })} placeholder="Write a review (optional)" className="w-full border rounded-xl p-3 text-sm" />
          {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
          <button disabled={busy || !rate.rating} onClick={() => run(() => axios.post(`/api/services/bookings/${modal.b._id}/review`, rate))} className="w-full mt-4 bg-[#0f7a55] text-white py-3 rounded-xl font-bold disabled:opacity-40">{busy ? '...' : 'Submit review'}</button></Modal>}
      </AnimatePresence>
    </div>
  )
}