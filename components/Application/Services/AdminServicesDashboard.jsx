'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, CheckCircle2, Clock, IndianRupee, Loader2, MapPin, Phone, RefreshCcw, Search, TrendingDown, TrendingUp, X } from 'lucide-react'
import useAdminLive from '@/hooks/useAdminLive'
import AdminBell from './AdminBell'
import { Badge, Pagination } from '@/components/Services/Badge'
import { STATUS_UI, PAY_UI, inr, fmtDate, fmtDT } from '@/components/Services/ui'

const COLORS = ['#0f7a55', '#3b82f6', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#9ca3af']
const TABS = [['all', 'All'], ['pending', 'Pending'], ['confirmed', 'Confirmed'], ['assigned', 'Sent'], ['in_progress', 'In Progress'], ['completed', 'Completed'], ['cancelled', 'Cancelled'], ['pending_payment', 'Unpaid']]

function Kpi({ icon: I, label, value, delta, tone }) {
  const up = delta == null ? null : delta >= 0
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center gap-4">
      <span className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tone}`}><I size={26} /></span>
      <div><p className="text-xs text-zinc-500 font-semibold">{label}</p>
        <p className="text-2xl font-black text-zinc-900 flex items-center gap-2">{value}
          {delta != null && <span className={`text-[11px] font-bold flex items-center gap-0.5 ${up ? 'text-emerald-600' : 'text-red-500'}`}>{up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(delta)}%</span>}</p>
        <p className="text-[11px] text-zinc-400">This month</p></div>
    </div>
  )
}

function Drawer({ b, onClose, onDone }) {
  const [f, setF] = useState({ assignedName: b.assignedName, assignedPhone: b.assignedPhone, adminNote: b.adminNote })
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => { axios.patch(`/api/admin/services/bookings/${b._id}`, { action: 'seen' }).catch(() => {}) }, [b._id])

  const act = async (action) => {
    if (action === 'cancel' && !window.confirm('Cancel this booking? Online payment will be refunded.')) return
    setBusy(action); setErr('')
    try { await axios.patch(`/api/admin/services/bookings/${b._id}`, { action, ...f }); onDone(); onClose() }
    catch (e) { setErr(e.response?.data?.message || 'Action failed') } finally { setBusy('') }
  }
  const can = {
    confirm: b.status === 'pending', assign: ['pending', 'confirmed', 'assigned'].includes(b.status),
    start: b.status === 'assigned', complete: ['assigned', 'in_progress'].includes(b.status) && ['paid', 'cod'].includes(b.paymentStatus),
    cancel: ['pending', 'confirmed', 'assigned'].includes(b.status),
  }
  const btn = (a, label, cls) => can[a] && <button type="button" disabled={!!busy} onClick={() => act(a)} className={`px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 ${cls}`}>{busy === a ? '...' : label}</button>
  const inp = 'w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-600'

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[60]" />
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10"><div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Booking</p><b>#{b.code}</b></div><button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center"><X size={18} /></button></div>
        <div className="p-6 space-y-5">
          <div className="flex gap-2 flex-wrap"><Badge map={STATUS_UI} k={b.status} /><Badge map={PAY_UI} k={b.paymentStatus} /></div>
          <div className="text-sm space-y-2">
            {[['Service', `${b.categoryName} · ${b.providerName}`], ['Slot', `${fmtDate(b.slotDate)}, ${b.slotTime}`], ['Customer', b.contactName], ['Payment', `${b.paymentMethod || '—'} · ${inr(b.total)} (fee ${inr(b.fee)})`], ['Created', fmtDT(b.createdAt)]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b pb-2"><span className="text-zinc-500">{k}</span><b className="text-right">{v}</b></div>)}
            <a href={`tel:${b.contactPhone}`} className="flex items-center gap-2 font-bold underline"><Phone size={14} />{b.contactPhone}</a>
            <p className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-zinc-400" />{b.address.full}{b.address.landmark && `, ${b.address.landmark}`}, {b.address.city} - {b.address.pincode}</p>
          </div>
          {can.assign && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-800">Send professional to site</p>
              <input className={inp} placeholder="Professional name" value={f.assignedName} maxLength={60} onChange={(e) => setF({ ...f, assignedName: e.target.value })} />
              <input className={inp} placeholder="Professional mobile (optional)" inputMode="numeric" value={f.assignedPhone} onChange={(e) => setF({ ...f, assignedPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
              <textarea className={inp} rows={2} maxLength={300} placeholder="Internal note" value={f.adminNote} onChange={(e) => setF({ ...f, adminNote: e.target.value })} />
              <button type="button" disabled={!!busy || f.assignedName.trim().length < 2} onClick={() => act('assign')} className="w-full bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-40">{busy === 'assign' ? '...' : b.status === 'assigned' ? 'Update professional' : 'Send professional'}</button>
            </div>
          )}
          {b.status === 'assigned' && b.assignedName && <p className="text-sm">Sent: <b>{b.assignedName}</b> {b.assignedPhone && `· ${b.assignedPhone}`}</p>}
          {err && <p className="text-red-600 text-sm font-semibold">{err}</p>}
          <div className="flex flex-wrap gap-2">
            {btn('confirm', 'Confirm booking', 'bg-zinc-900 text-white')}{btn('start', 'Start work', 'bg-sky-600 text-white')}
            {btn('complete', b.paymentStatus === 'cod' ? 'Complete · cash collected' : 'Complete', 'bg-emerald-600 text-white')}{btn('cancel', 'Cancel', 'border border-red-200 text-red-600')}
          </div>
          {b.status === 'assigned' && !can.complete && <p className="text-xs text-amber-600">Completion needs a paid or pay-on-service booking.</p>}
          <div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">History</p>
            {b.history.map((h, i) => <p key={i} className="text-xs flex justify-between py-1"><span className="font-semibold capitalize">{String(h.status).replace(/_/g, ' ')} <span className="text-zinc-400 font-normal">· {h.byRole}</span></span><span className="text-zinc-400">{fmtDT(h.at)}</span></p>)}</div>
        </div>
      </motion.aside>
    </>
  )
}

export default function AdminServicesDashboard() {
  const [stats, setStats] = useState(null)
  const [d, setD] = useState({ bookings: [], pages: 1, counts: {} })
  const [tab, setTab] = useState('all')
  const [filters, setFilters] = useState({ q: '', payment: '', from: '', to: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(null)
  const timer = useRef(null)
  const req = useRef(0)

  const load = useCallback(async () => {
    const id = ++req.current
    try {
      const params = { page, status: tab, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const [a, b] = await Promise.all([axios.get('/api/admin/services/stats'), axios.get('/api/admin/services/bookings', { params })])
      if (id !== req.current) return
      setStats(a.data); setD(b.data)
    } catch (e) { console.log(e) } finally { if (id === req.current) setLoading(false) }
  }, [page, tab, filters])

  useEffect(() => { const t = setTimeout(load, filters.q ? 350 : 0); return () => clearTimeout(t) }, [load, filters.q])
  useEffect(() => { const t = setInterval(() => document.visibilityState === 'visible' && load(), 30000); return () => clearInterval(t) }, [load])
  const live = useAdminLive(() => { clearTimeout(timer.current); timer.current = setTimeout(load, 500) })
  const k = stats?.kpi

  return (
    <div className="p-3 sm:p-6 space-y-5 bg-[#f4f7f5] min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black">Service Dashboard</h1>
          <p className="text-sm text-zinc-500 flex items-center gap-2">Manage service bookings and customers <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${live ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{live ? 'LIVE' : 'Reconnecting'}</span></p></div>
        <div className="flex items-center gap-2">
          <Link href="/admin/services/labours" className="text-sm font-bold border bg-white px-4 py-2.5 rounded-xl">Service Labour</Link>
          <Link href="/admin/services/categories" className="text-sm font-bold border bg-white px-4 py-2.5 rounded-xl">Categories</Link>
          <AdminBell />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Kpi icon={CalendarCheck} label="Total Bookings" value={k?.total ?? '—'} delta={k?.totalDelta} tone="bg-emerald-50 text-emerald-700" />
        <Kpi icon={CheckCircle2} label="Completed Bookings" value={k?.completed ?? '—'} delta={k?.completedDelta} tone="bg-emerald-50 text-emerald-700" />
        <Kpi icon={Clock} label="Pending Bookings" value={k?.pending ?? '—'} delta={k?.pendingDelta} tone="bg-orange-50 text-orange-600" />
        <Kpi icon={IndianRupee} label="Total Revenue" value={k ? inr(k.revenue) : '—'} delta={k?.revenueDelta} tone="bg-emerald-50 text-emerald-700" />
      </div>

      <div className="grid xl:grid-cols-[1fr_1fr_320px] gap-4">
        <section className="bg-white border border-zinc-200 rounded-2xl p-4 min-w-0">
          <h2 className="font-black mb-2">Bookings Overview <span className="text-xs font-normal text-zinc-400">last 30 days</span></h2>
          <div className="h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats?.chart || []} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" /><XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={26} />
            <Tooltip /><Bar dataKey="completed" stackId="a" fill="#0f7a55" name="Completed" /><Bar dataKey="pending" stackId="a" fill="#d1d5db" name="Other" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </section>
        <section className="bg-white border border-zinc-200 rounded-2xl p-4 min-w-0">
          <h2 className="font-black mb-2">Bookings by Service Type</h2>
          <div className="grid grid-cols-2 items-center h-60">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats?.byCategory?.length ? stats.byCategory : [{ name: 'No data', value: 1 }]} dataKey="value" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
              {(stats?.byCategory?.length ? stats.byCategory : [{}]).map((_, i) => <Cell key={i} fill={stats?.byCategory?.length ? COLORS[i % COLORS.length] : '#e5e7eb'} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            <ul className="space-y-1.5 text-xs">{(stats?.byCategory || []).map((c, i) => <li key={c.name} className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="flex-1 truncate">{c.name}</span><b>{c.value}</b></li>)}</ul>
          </div>
        </section>
        <section className="bg-white border border-zinc-200 rounded-2xl p-4">
          <h2 className="font-black mb-3">Today's Schedule</h2>
          {(stats?.today || []).length === 0 ? <p className="text-sm text-zinc-400 py-6 text-center">Nothing scheduled today</p> : stats.today.map((b) => (
            <button key={b._id} type="button" onClick={() => setSel(b)} className="w-full text-left flex gap-3 py-2.5 border-b last:border-0 hover:bg-zinc-50 rounded-lg px-1">
              <span className="text-xs font-bold text-zinc-500 w-16 shrink-0">{b.slotTime}</span>
              <span className="flex-1 min-w-0"><b className="text-sm block truncate">{b.categoryName}</b><span className="text-xs text-zinc-500 block truncate">{b.contactName}, {b.address.city}</span></span>
              <Badge map={STATUS_UI} k={b.status} />
            </button>
          ))}
        </section>
      </div>

      <section className="bg-white border border-zinc-200 rounded-2xl p-4 min-w-0">
        <div className="flex gap-1 overflow-x-auto border-b mb-4">
          {TABS.map(([key, l]) => <button key={key} type="button" onClick={() => { setTab(key); setPage(1) }} className={`px-3 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 -mb-px ${tab === key ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-zinc-500'}`}>{l} ({d.counts[key] ?? 0})</button>)}
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-2 mb-4 [&>*]:min-w-0">
          <div className="xl:col-span-2 flex items-center gap-2 bg-zinc-50 border rounded-xl px-3"><Search size={14} className="text-zinc-400" /><input value={filters.q} onChange={(e) => { setFilters({ ...filters, q: e.target.value }); setPage(1) }} placeholder="Search booking ID, customer, phone, address" className="flex-1 min-w-0 bg-transparent py-2.5 text-sm outline-none" /></div>
          <select value={filters.payment} onChange={(e) => { setFilters({ ...filters, payment: e.target.value }); setPage(1) }} className="bg-zinc-50 border rounded-xl px-3 py-2.5 text-sm"><option value="">All payments</option><option value="online">Online</option><option value="cash">Cash on service</option></select>
          <input type="date" value={filters.from} onChange={(e) => { setFilters({ ...filters, from: e.target.value }); setPage(1) }} className="bg-zinc-50 border rounded-xl px-3 py-2 text-sm" aria-label="From" />
          <input type="date" value={filters.to} onChange={(e) => { setFilters({ ...filters, to: e.target.value }); setPage(1) }} className="bg-zinc-50 border rounded-xl px-3 py-2 text-sm" aria-label="To" />
        </div>
        <div className="w-0 min-w-full overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400"><tr>{['Booking ID', 'Customer', 'Service', 'Address', 'Date & Time', 'Sent professional', 'Status', 'Payment', 'Amount', ''].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={10} className="py-14 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                : d.bookings.length === 0 ? <tr><td colSpan={10} className="py-14 text-center text-zinc-400">No bookings found.</td></tr>
                : d.bookings.map((b) => (
                  <tr key={b._id} onClick={() => setSel(b)} className={`border-t hover:bg-zinc-50 cursor-pointer align-top ${!b.adminSeen && b.status === 'pending' ? 'bg-amber-50/60' : ''}`}>
                    <td className="px-4 py-3 font-bold">#{b.code}{!b.adminSeen && b.status === 'pending' && <span className="ml-2 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-full animate-pulse">NEW</span>}</td>
                    <td className="px-4 py-3"><b className="block">{b.contactName}</b><span className="text-xs text-zinc-500">{b.contactPhone}</span></td>
                    <td className="px-4 py-3"><b className="block">{b.categoryName}</b><span className="text-xs text-zinc-500">{b.providerName}</span></td>
                    <td className="px-4 py-3 max-w-[220px]"><span className="text-xs line-clamp-2">{b.address.full}, {b.address.city}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs"><b className="block">{fmtDate(b.slotDate)}</b>{b.slotTime}</td>
                    <td className="px-4 py-3 text-xs">{b.assignedName || <span className="text-zinc-300">Not sent</span>}</td>
                    <td className="px-4 py-3"><Badge map={STATUS_UI} k={b.status} /></td>
                    <td className="px-4 py-3 space-y-1"><b className="text-xs capitalize block">{b.paymentMethod || '—'}</b><Badge map={PAY_UI} k={b.paymentStatus} /></td>
                    <td className="px-4 py-3 font-black whitespace-nowrap">{inr(b.total)}</td>
                    <td className="px-4 py-3"><button type="button" className="text-xs font-bold border px-3 py-1.5 rounded-lg">View</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3"><button type="button" onClick={load} className="text-xs font-bold flex items-center gap-1.5 text-zinc-500"><RefreshCcw size={12} /> Refresh</button>
          <button type="button" onClick={() => { setFilters({ q: '', payment: '', from: '', to: '' }); setTab('all'); setPage(1) }} className="text-xs font-bold text-emerald-700">Reset</button></div>
        <Pagination page={page} pages={d.pages} onChange={setPage} />
      </section>

      <AnimatePresence>{sel && <Drawer key={sel._id} b={sel} onClose={() => setSel(null)} onDone={load} />}</AnimatePresence>
    </div>
  )
}