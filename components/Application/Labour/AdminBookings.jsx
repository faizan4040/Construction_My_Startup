'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeCheck, Briefcase, ChevronLeft, ChevronRight, ExternalLink, IndianRupee,
  Loader2, MapPin, Phone, RefreshCcw, Search, Star, Trash2, User, X,
} from 'lucide-react'
import useAdminLive from '@/hooks/useAdminLive'

const STATUS = {
  requested:      { label: 'Requested',      cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed:      { label: 'Accepted',       cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  arrived:        { label: 'Arrived',        cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  started:        { label: 'Working',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  work_completed: { label: 'Work done · OTP', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  completed:      { label: 'Completed',      cls: 'bg-zinc-900 text-white border-zinc-900' },
  rejected:       { label: 'Rejected',       cls: 'bg-red-50 text-red-600 border-red-200' },
  cancelled:      { label: 'Cancelled',      cls: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
  expired:        { label: 'Expired',        cls: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
}
const PAY_STATUS = {
  pending:        { label: 'Pending',        cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:           { label: 'Paid',           cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cash:           { label: 'Cash received',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  failed:         { label: 'Failed',         cls: 'bg-red-50 text-red-600 border-red-200' },
  refund_pending: { label: 'Refund pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  refunded:       { label: 'Refunded',       cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
}
const CANCELLER = {
  customer: 'bg-red-50 text-red-600 border-red-200',
  labour:   'bg-orange-50 text-orange-700 border-orange-200',
  system:   'bg-zinc-100 text-zinc-600 border-zinc-200',
  admin:    'bg-violet-50 text-violet-700 border-violet-200',
}
const CATEGORIES = [
  'helpers', 'masons', 'electricians', 'plumbers', 'carpenters', 'painters',
  'tile-experts', 'welders', 'jcb-operators', 'contractors', 'engineers',
]
const FILTER_CHIPS = ['', 'requested', 'confirmed', 'arrived', 'started', 'completed', 'rejected', 'expired', 'cancelled']
// must match DELETABLE_STATUSES in the DELETE API
const DELETABLE = ['completed', 'rejected', 'cancelled', 'expired']

const inr = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`
const fmtDT = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'
const fmtDur = (sec) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, '0')}s`
}
const osmLink = (c) =>
  c ? `https://www.openstreetmap.org/?mlat=${c[1]}&mlon=${c[0]}#map=17/${c[1]}/${c[0]}` : null

function Badge({ map, k, fallback = '—' }) {
  const m = map[k]
  if (!m) return <span className="text-zinc-300">{fallback}</span>
  return (
    <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${m.cls}`}>
      {m.label}
    </span>
  )
}

function CancelledBy({ by, reason }) {
  if (!by) return <span className="text-zinc-300">—</span>
  return (
    <div>
      <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize whitespace-nowrap ${CANCELLER[by] || CANCELLER.system}`}>
        {by}
      </span>
      {reason && <p className="text-[10px] text-zinc-400 mt-1 max-w-[130px] break-words">{String(reason).replace(/_/g, ' ')}</p>}
    </div>
  )
}

function Avatar({ src, name, size = 40 }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name || ''} className="rounded-full object-cover shrink-0 border border-zinc-200"
      style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full bg-zinc-200 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}>
      <User size={size * 0.45} className="text-zinc-500" />
    </div>
  )
}

function Rating({ rating, total }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
      <Star size={11} className={rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} />
      {rating ? rating.toFixed(1) : 'New'}
      {total > 0 && <span className="text-zinc-400">({total})</span>}
    </span>
  )
}

// ticks every second only while the job is running
function WorkTime({ startedAt, completedAt, seconds }) {
  const [, tick] = useState(0)
  const running = !!startedAt && !completedAt
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  if (!startedAt) return <span className="text-zinc-300">—</span>
  const sec = completedAt
    ? seconds ?? Math.round((new Date(completedAt) - new Date(startedAt)) / 1000)
    : Math.max(0, Math.round((Date.now() - new Date(startedAt)) / 1000))
  return (
    <span className={running ? 'font-bold text-emerald-600' : 'font-semibold text-zinc-900'}>
      {fmtDur(sec)}{running && ' ●'}
    </span>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-zinc-100 last:border-0 text-sm">
      <span className="text-zinc-400 shrink-0">{label}</span>
      <span className="text-zinc-900 font-medium text-right min-w-0 break-words">{children}</span>
    </div>
  )
}

function Drawer({ booking: b, onClose }) {
  const [detail, setDetail] = useState(null)
  useEffect(() => {
    let alive = true
    axios.get(`/api/admin/labour/bookings/${b._id}`)
      .then(({ data }) => alive && setDetail(data.booking))
      .catch(console.log)
    return () => { alive = false }
  }, [b._id])

  const d = detail || b
  const map = osmLink(d.coordinates)

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 z-[60]" />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl overflow-y-auto overflow-x-hidden"
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-zinc-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Booking</p>
            <p className="text-xs font-mono text-zinc-600 break-all">{d._id}</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 shrink-0 rounded-full hover:bg-zinc-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar src={d.labour.photo} name={d.labour.name} size={64} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-black text-lg text-zinc-900 truncate">{d.labour.name}</p>
                {d.labour.isVerified && <BadgeCheck size={16} className="text-blue-500 shrink-0" />}
              </div>
              <p className="text-xs text-zinc-400 capitalize">{d.category.replace(/-/g, ' ')}</p>
              <Rating rating={d.labour.rating} total={d.labour.totalReviews} />
            </div>
            <div className="ml-auto shrink-0"><Badge map={STATUS} k={d.bookingStatus} /></div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Experience', `${d.labour.experienceYears} yrs`],
              ['Jobs done', d.labour.completedJobs],
              ['Reviews', d.labour.totalReviews],
            ].map(([k, v]) => (
              <div key={k} className="bg-zinc-50 rounded-xl py-3 min-w-0">
                <p className="text-lg font-black text-zinc-900">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{k}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Contact (admin only)</p>
            <Row label="Labour">
              {d.labour.phone ? <a href={`tel:${d.labour.phone}`} className="underline">{d.labour.phone}</a> : '—'}
            </Row>
            <Row label="Customer">{d.customer.name}</Row>
            <Row label="Customer phone">
              {d.customer.phone ? <a href={`tel:${d.customer.phone}`} className="underline">{d.customer.phone}</a> : '—'}
            </Row>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Work site</p>
            <p className="text-sm text-zinc-900 font-medium leading-snug break-words">
              {d.siteDetails ? `${d.siteDetails}, ` : ''}{d.workAddress}
            </p>
            {map && (
              <a href={map} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-zinc-900 underline">
                <MapPin size={12} /> Open on map <ExternalLink size={11} />
              </a>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Timeline</p>
            <Row label="Requested">{fmtDT(d.createdAt)}</Row>
            <Row label="Accepted">{fmtDT(d.acceptedAt)}</Row>
            <Row label="Arrived">{fmtDT(d.arrivedAt)}</Row>
            <Row label="Work started">{fmtDT(d.startedAt)}</Row>
            <Row label="Work completed">{fmtDT(d.completedAt)}</Row>
            <Row label="Time taken">
              <WorkTime startedAt={d.startedAt} completedAt={d.completedAt} seconds={d.workSeconds} />
            </Row>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Payment & earnings</p>
            <Row label="Booking value">{inr(d.money.fare)}</Row>
            <Row label="Payment method">
              {d.paymentMethod ? <span className="capitalize">{d.paymentMethod}</span> : <span className="text-zinc-300">Not selected</span>}
            </Row>
            <Row label="Payment status"><Badge map={PAY_STATUS} k={d.paymentStatus} /></Row>
            <Row label={`Platform commission (${d.money.commissionPercent}%)`}>{inr(d.money.adminCommission)}</Row>
            <Row label="Labour share">{inr(d.money.labourAmount)}</Row>
            {d.money.projected && (
              <p className="text-[11px] text-amber-600 mt-2">Expected amounts. Final earning counts after the work is closed with OTP.</p>
            )}
          </div>

          {(d.cancellationReason || d.cancelledBy) && (
            <Row label="Cancelled by">
              <span className="capitalize">{d.cancelledBy}</span>{d.cancellationReason && ` (${String(d.cancellationReason).replace(/_/g, ' ')})`}
            </Row>
          )}

          {d.review && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Customer review</p>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={16} className={n <= d.review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} />
                  ))}
                  <span className="ml-2 text-sm font-black text-zinc-900">{d.review.rating}/5</span>
                </div>
                {d.review.comment
                  ? <p className="text-sm text-zinc-700 mt-2 break-words">{d.review.comment}</p>
                  : <p className="text-xs text-zinc-400 mt-2">No written comment.</p>}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">History</p>
            {!detail ? (
              <Loader2 size={16} className="animate-spin text-zinc-400" />
            ) : detail.history.length === 0 ? (
              <p className="text-xs text-zinc-400">No events recorded.</p>
            ) : (
              <ol className="space-y-2">
                {detail.history.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-zinc-900 shrink-0" />
                    <span className="font-semibold text-zinc-900">{STATUS[h.status]?.label || String(h.status).replace(/_/g, ' ')}</span>
                    <span className="text-zinc-400">{h.byRole}</span>
                    <span className="ml-auto text-zinc-400 whitespace-nowrap">{fmtDT(h.at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

function DeleteModal({ booking: b, deleting, onCancel, onConfirm }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={deleting ? undefined : onCancel} className="fixed inset-0 bg-black/50 z-[80]" />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
          className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
        >
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <h3 className="text-lg font-black text-zinc-900">Delete this booking?</h3>
          <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
            Booking <b className="font-mono text-zinc-900">#{b._id.slice(-6).toUpperCase()}</b> ({b.labour.name}) will be
            removed from this table. Earnings and analytics numbers will not change.
          </p>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onCancel} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

const EMPTY_FILTERS = { status: '', category: '', paymentMethod: '', from: '', to: '' }
const HEADERS = ['Booking', 'Labour', 'Customer', 'Work site', 'Status', 'Cancelled by', 'Timing', 'Work time', 'Payment', 'Amount', 'Action']

export default function AdminBookings() {
  const [rows, setRows] = useState([])
  const [counts, setCounts] = useState({})
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const reqRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => { setQ(qInput.trim()); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [qInput])

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++reqRef.current
    if (!silent) setLoading(true)
    try {
      const params = { page, limit: 15 }
      Object.entries({ ...filters, q }).forEach(([k, v]) => { if (v) params[k] = v })
      const { data } = await axios.get('/api/admin/labour/bookings', { params })
      if (id !== reqRef.current) return
      setRows(data.bookings)
      setCounts(data.counts || {})
      setTotal(data.total)
      setPages(data.pages)
      // if the last row of a page was deleted, step back one page
      if (data.bookings.length === 0 && page > 1) setPage((p) => p - 1)
      setError('')
      setUpdatedAt(new Date())
    } catch (e) {
      if (id !== reqRef.current) return
      if (!silent) setError(e.response?.data?.message || 'Could not load bookings')
    } finally {
      if (!silent && id === reqRef.current) setLoading(false)
    }
  }, [page, filters, q])

  useEffect(() => { load() }, [load])

  // fallback if a socket ping is missed
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') load({ silent: true })
    }, 30000)
    return () => clearInterval(t)
  }, [load])

  const live = useAdminLive(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => load({ silent: true }), 500)
  })

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(t)
  }, [notice])

  const handleDelete = async () => {
    if (!toDelete || deleting) return
    try {
      setDeleting(true)
      setError('')
      await axios.delete(`/api/admin/labour/bookings/${toDelete._id}`)
      setToDelete(null)
      setNotice('Booking deleted')
      await load({ silent: true })
    } catch (e) {
      setToDelete(null)
      setError(e.response?.data?.message || 'Could not delete this booking')
      load({ silent: true })
    } finally {
      setDeleting(false)
    }
  }

  const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1) }
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0)
  const hasFilters = Object.values(filters).some(Boolean) || q

  return (
    <section className="w-full min-w-0 max-w-full bg-white rounded-3xl border border-gray-100 shadow-lg p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-zinc-900">Live Bookings</h2>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${
              live ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-zinc-100 border-zinc-200 text-zinc-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
              {live ? 'LIVE' : 'Reconnecting'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {total} booking{total === 1 ? '' : 's'}
            {updatedAt && ` · updated ${updatedAt.toLocaleTimeString('en-IN')}`}
          </p>
        </div>
        <button type="button" onClick={() => load()}
          className="flex items-center gap-2 text-xs font-bold border border-zinc-200 hover:border-zinc-400 px-4 py-2.5 rounded-xl">
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* status chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_CHIPS.map((s) => {
          const active = filters.status === s
          const n = s === '' ? allCount : counts[s] || 0
          return (
            <button key={s || 'all'} type="button" onClick={() => setFilter('status', s)}
              className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-colors ${
                active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}>
              {s === '' ? 'All' : STATUS[s].label} <span className="text-zinc-400">{n}</span>
            </button>
          )
        })}
      </div>

      {/* filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-5 [&>*]:min-w-0">
        <div className="sm:col-span-2 xl:col-span-2 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 focus-within:border-zinc-900">
          <Search size={14} className="text-zinc-400 shrink-0" />
          <input value={qInput} onChange={(e) => setQInput(e.target.value)}
            placeholder="Search labour name, address or booking id"
            className="flex-1 min-w-0 bg-transparent py-2.5 text-sm outline-none" />
        </div>
        <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}
          className="w-full min-w-0 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm capitalize">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
        </select>
        <select value={filters.paymentMethod} onChange={(e) => setFilter('paymentMethod', e.target.value)}
          className="w-full min-w-0 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm">
          <option value="">All payments</option>
          <option value="online">Online</option>
          <option value="cash">Cash</option>
        </select>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-1">
          <input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)}
            className="w-full min-w-0 bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-2.5 text-xs" aria-label="From date" />
          <input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)}
            className="w-full min-w-0 bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-2.5 text-xs" aria-label="To date" />
        </div>
      </div>
      {hasFilters && (
        <button type="button" className="text-xs font-bold underline text-zinc-500 mb-4"
          onClick={() => { setFilters(EMPTY_FILTERS); setQInput(''); setQ(''); setPage(1) }}>
          Clear filters
        </button>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</p>}
      {notice && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">{notice}</p>}

      {/* w-0 + min-w-full: the wide table scrolls inside this box and never stretches the page */}
      <div className="w-0 min-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-zinc-100">
        <table className="w-full min-w-[1400px] text-left">
          <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} className="px-4 py-3 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td colSpan={HEADERS.length} className="py-16 text-center"><Loader2 className="animate-spin inline text-zinc-500" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={HEADERS.length} className="py-16 text-center text-sm text-zinc-400">No bookings found.</td></tr>
            ) : rows.map((b) => {
              const canDelete = DELETABLE.includes(b.bookingStatus)
              return (
                <tr key={b._id} onClick={() => setSelected(b)}
                  className="border-t border-zinc-100 hover:bg-zinc-50 cursor-pointer align-top">
                  <td className="px-4 py-4">
                    <p className="text-xs font-mono font-bold text-zinc-900">#{b._id.slice(-6).toUpperCase()}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{fmtDT(b.createdAt)}</p>
                    <p className="text-[11px] text-zinc-500 capitalize mt-1">{b.category.replace(/-/g, ' ')}</p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={b.labour.photo} name={b.labour.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 flex items-center gap-1">
                          <span className="truncate max-w-[140px]">{b.labour.name}</span>
                          {b.labour.isVerified && <BadgeCheck size={13} className="text-blue-500 shrink-0" />}
                        </p>
                        <div className="flex items-center gap-2">
                          <Rating rating={b.labour.rating} total={b.labour.totalReviews} />
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                            <Briefcase size={10} />{b.labour.experienceYears}y
                          </span>
                        </div>
                        {b.labour.phone && (
                          <a href={`tel:${b.labour.phone}`} onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900">
                            <Phone size={10} />{b.labour.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-zinc-900">{b.customer.name}</p>
                    {b.customer.phone && (
                      <a href={`tel:${b.customer.phone}`} onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900">
                        <Phone size={10} />{b.customer.phone}
                      </a>
                    )}
                  </td>

                  <td className="px-4 py-4 max-w-[240px]">
                    <p className="text-xs text-zinc-700 leading-snug line-clamp-2">
                      {b.siteDetails ? `${b.siteDetails}, ` : ''}{b.workAddress}
                    </p>
                    {osmLink(b.coordinates) && (
                      <a href={osmLink(b.coordinates)} target="_blank" rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-900 underline mt-1">
                        <MapPin size={10} /> Map
                      </a>
                    )}
                  </td>

                  <td className="px-4 py-4"><Badge map={STATUS} k={b.bookingStatus} /></td>

                  <td className="px-4 py-4">
                    <CancelledBy by={b.cancelledBy} reason={b.cancellationReason} />
                  </td>

                  <td className="px-4 py-4 text-[11px] text-zinc-500 space-y-0.5 whitespace-nowrap">
                    <p>Accepted: <b className="text-zinc-800">{fmtTime(b.acceptedAt)}</b></p>
                    <p>Started: <b className="text-zinc-800">{fmtTime(b.startedAt)}</b></p>
                    <p>Done: <b className="text-zinc-800">{fmtTime(b.completedAt)}</b></p>
                  </td>

                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <WorkTime startedAt={b.startedAt} completedAt={b.completedAt} seconds={b.workSeconds} />
                  </td>

                  <td className="px-4 py-4 space-y-1">
                    <p className="text-xs font-semibold text-zinc-900 capitalize">{b.paymentMethod || <span className="text-zinc-300">—</span>}</p>
                    <Badge map={PAY_STATUS} k={b.paymentStatus} />
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-sm font-black text-zinc-900 flex items-center">
                      <IndianRupee size={12} />{Math.round(b.money.fare).toLocaleString('en-IN')}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${b.money.projected ? 'text-zinc-400' : 'text-zinc-700'}`}>
                      Platform {inr(b.money.adminCommission)}
                    </p>
                    <p className={`text-[11px] ${b.money.projected ? 'text-zinc-400' : 'text-zinc-700'}`}>
                      Labour {inr(b.money.labourAmount)}
                    </p>
                    {b.money.projected && <p className="text-[10px] text-amber-600">expected</p>}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={!canDelete}
                      title={canDelete ? 'Delete booking' : 'Active bookings cannot be deleted'}
                      onClick={(e) => { e.stopPropagation(); setToDelete(b) }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-zinc-400">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center disabled:opacity-30 hover:border-zinc-400">
              <ChevronLeft size={16} />
            </button>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}
              className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center disabled:opacity-30 hover:border-zinc-400">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && <Drawer key={selected._id} booking={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {toDelete && (
          <DeleteModal
            key={toDelete._id}
            booking={toDelete}
            deleting={deleting}
            onCancel={() => setToDelete(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </section>
  )
}