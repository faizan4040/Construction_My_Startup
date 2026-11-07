'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, CalendarCheck, CheckCircle2, Clock, Hourglass, IndianRupee, Loader2, Percent, RefreshCcw, RotateCcw, Search, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { ServiceDrawer } from '@/components/Application/LabourAdmin/AdminLabourJobs'
import { CommissionSettings, CompanyEarning } from '@/components/Application/LabourAdmin/AdminLabourMoney'
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

export default function AdminServicesDashboard() {
  const [stats, setStats] = useState(null)
  const [d, setD] = useState({ bookings: [], pages: 1, counts: {} })
  const [tab, setTab] = useState('all')
  const [filters, setFilters] = useState({ q: '', payment: '', from: '', to: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(null)
  const [settings, setSettings] = useState(null)
  const [tick, setTick] = useState(0)
  const timer = useRef(null)
  const req = useRef(0)

  const load = useCallback(async () => {
    const id = ++req.current
    try {
      const params = { page, status: tab, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const [a, b] = await Promise.all([axios.get('/api/admin/services/stats'), axios.get('/api/admin/services/bookings', { params })])
      if (id !== req.current) return
      setStats(a.data); setD(b.data); setTick((t) => t + 1)
    } catch (e) { console.log(e) } finally { if (id === req.current) setLoading(false) }
  }, [page, tab, filters])

  useEffect(() => { const t = setTimeout(load, filters.q ? 350 : 0); return () => clearTimeout(t) }, [load, filters.q])
  useEffect(() => { const t = setInterval(() => document.visibilityState === 'visible' && load(), 30000); return () => clearInterval(t) }, [load])
  const live = useAdminLive(() => { clearTimeout(timer.current); timer.current = setTimeout(load, 500) })
  const k = stats?.kpi
  const m = stats?.money
  useEffect(() => { axios.get('/api/admin/labour/settings').then((r) => setSettings(r.data.settings)).catch(() => {}) }, [])

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


      <section className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-4 min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div><h2 className="font-black">Payments &amp; Commission</h2>
            <p className="text-xs text-zinc-500">Company keeps the booking fee + {m?.percent ?? '—'}% of the service price. Labour gets the rest in their wallet.</p></div>
          <p className="text-xs text-zinc-500">This month commission <b className="text-emerald-700 text-base">{inr(m?.commissionMonth)}</b></p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-2">
          {[
            [Wallet, 'Online paid', m?.onlinePaid, `${m?.onlinePaidCount ?? 0} bookings · in Razorpay`, 'text-emerald-700 bg-emerald-50'],
            [Clock, 'Cash on service · pending', m?.cashPending, `${m?.cashPendingCount ?? 0} to collect at site`, 'text-orange-600 bg-orange-50'],
            [Banknote, 'Cash collected', m?.cashCollected, `${m?.cashCollectedCount ?? 0} jobs done`, 'text-sky-700 bg-sky-50'],
            [Hourglass, 'Awaiting payment', m?.awaiting, `${m?.awaitingCount ?? 0} unpaid checkouts`, 'text-zinc-600 bg-zinc-100'],
            [RotateCcw, 'Refunded', m?.refunded, m?.refundPending ? `${m.refundPending} refund pending` : 'cancelled online bookings', 'text-red-600 bg-red-50'],
            [Percent, 'Commission earned', m?.commission, 'all completed jobs', 'text-emerald-700 bg-emerald-50'],
          ].map(([I, l, v, sub, tone]) => (
            <div key={l} className="border border-zinc-100 rounded-xl p-3 min-w-0">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${tone}`}><I size={16} /></span>
              <p className="text-[11px] font-semibold text-zinc-500 truncate">{l}</p>
              <p className="text-lg font-black">{m ? inr(v) : '—'}</p>
              <p className="text-[10px] text-zinc-400 truncate">{sub}</p>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-x-6 text-sm">
          {[['Commission from online jobs', m?.commissionOnline], ['Commission from cash jobs (due from labour)', m?.commissionCash],
            ['Paid to app labours (wallet)', m?.labourShare], ['Payable to outside professionals', m?.outsideShare]].map(([l, v]) => (
            <div key={l} className="flex justify-between gap-3 py-2 border-b"><span className="text-zinc-500">{l}</span><b>{inr(v)}</b></div>
          ))}
        </div>
      </section>

      <div className="grid xl:grid-cols-[1fr_380px] gap-4 items-start">
        <CompanyEarning refreshKey={tick} onChanged={load} />
        {settings && <CommissionSettings settings={settings} only={['serviceCommissionPercent', 'settlementHoldHours', 'minPayout']} onChanged={load} />}
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
                    <td className="px-4 py-3 text-xs">{b.assignedName ? <><b className="block">{b.assignedName}</b><span className={b.assignedLabour ? (b.assignStatus === 'accepted' ? 'text-emerald-600' : 'text-amber-600') : 'text-zinc-400'}>{b.assignedLabour ? (b.assignStatus === 'accepted' ? 'Accepted' : 'Waiting accept') : 'Outside pro'}</span></> : <span className="text-zinc-300">Not sent</span>}</td>
                    <td className="px-4 py-3"><Badge map={STATUS_UI} k={b.status} /></td>
                    <td className="px-4 py-3 space-y-1"><b className="text-xs capitalize block">{b.paymentMethod || '—'}</b><Badge map={PAY_UI} k={b.paymentStatus} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><b className="block">{inr(b.total)}</b>{b.status === 'completed' && <span className="text-[10px] text-emerald-700 font-bold">+{inr(b.adminCommission)} comm.</span>}</td>
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

      {sel && <ServiceDrawer key={sel._id} id={sel._id} onClose={() => setSel(null)} onChanged={load} />}
    </div>
  )
}