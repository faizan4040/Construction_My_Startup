'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Banknote, Briefcase, CalendarClock, Hourglass, IndianRupee, Loader2, MapPin, Navigation, Phone, RefreshCcw, Search, Star, UserPlus, Wallet, X,
} from 'lucide-react'
import useAdminLive from '@/hooks/useAdminLive'
import { connectSocket, joinJobRoom } from '@/lib/socket-client'
import { CATEGORY_LABEL } from '@/components/Application/Labour/categoryMeta'
import { card, Drawer, fmtDT, fmtSlot, inr, input, Kpi, Modal, Pill, Row, Steps } from './ui'
import AdminLabourMoney from './AdminLabourMoney'

const LiveLabourMap = dynamic(() => import('@/components/Application/Labour/LiveLabourMap'), { ssr: false })

const TABS = [
  ['live', 'Live now'], ['upcoming', 'Upcoming'], ['unassigned', 'Unassigned'], ['completed', 'Completed'],
  ['payment_due', 'Payment due'], ['cancelled', 'Cancelled'], ['all', 'All'],
]
const LIVE_STATUS = {
  requested: ['Waiting for labour', 'amber'], confirmed: ['On the way', 'blue'], arrived: ['At site', 'violet'],
  started: ['Working', 'green'], work_completed: ['Finished · OTP', 'violet'], completed: ['Completed', 'dark'],
  cancelled: ['Cancelled', 'red'], rejected: ['Rejected', 'red'], expired: ['Expired', 'zinc'],
}
const SVC_STATUS = {
  pending: ['New', 'amber'], confirmed: ['Confirmed', 'blue'], assigned: ['Assigned', 'blue'], in_progress: ['Working', 'green'],
  completed: ['Completed', 'dark'], cancelled: ['Cancelled', 'red'], pending_payment: ['Unpaid', 'zinc'],
}
const statusPill = (r) => {
  const [l, t] = (r.kind === 'live' ? LIVE_STATUS : SVC_STATUS)[r.status] || [r.status, 'zinc']
  if (r.kind === 'service' && r.status === 'assigned' && r.assignStatus === 'offered') return <Pill tone="amber">Waiting labour accept</Pill>
  return <Pill tone={t}>{l}</Pill>
}

/* ───────────── live job: admin watches the map ───────────── */
function TrackModal({ id, onClose }) {
  const [b, setB] = useState(null)
  const [pos, setPos] = useState(null)
  const [fix, setFix] = useState({ heading: null, at: 0 })
  const [stats, setStats] = useState(null)
  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/admin/labour/track/${id}`)
      setB(data.booking)
      const p = data.booking.labourPosition
      if (p) setFix((f) => { if (p.at > f.at) { setPos([p.lat, p.lon]); return { ...f, at: p.at } } return f })
    } catch { toast.error('Could not load the job') }
  }, [id])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const s = connectSocket()
    const join = () => joinJobRoom(id)
    const onLoc = (p) => { setPos([p.latitude, p.longitude]); setFix({ heading: p.heading ?? null, at: p.at || Date.now() }) }
    s.on('connect', join); s.on('labour-location', onLoc)
    if (s.connected) join()
    const t = setInterval(load, 20000)
    return () => { s.off('connect', join); s.off('labour-location', onLoc); clearInterval(t) }
  }, [id, load])
  const site = b?.workCoordinates ? [b.workCoordinates[1], b.workCoordinates[0]] : null
  return (
    <Modal open onClose={onClose} title={b ? `Live tracking · ${CATEGORY_LABEL[b.category] || b.category}` : 'Live tracking'} wide>
      <div className="grid lg:grid-cols-[1fr_280px]">
        <div className="h-[55vh] lg:h-[70vh]">
          {b ? <LiveLabourMap sitePos={site} labourPos={pos} heading={fix.heading} lastAt={fix.at} status={b.bookingStatus} category={b.category} onStats={setStats} labourLabel={b.labour.name} />
            : <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
        </div>
        {b && (
          <div className="p-4 space-y-3 text-sm">
            <Pill tone={LIVE_STATUS[b.bookingStatus]?.[1]}>{LIVE_STATUS[b.bookingStatus]?.[0]}</Pill>
            {stats && b.bookingStatus === 'confirmed' && <p className="text-2xl font-black">{Math.max(1, Math.round(stats.timeS / 60))} min <span className="text-sm text-zinc-400 font-semibold">· {(stats.distanceM / 1000).toFixed(1)} km</span></p>}
            <Row k="Labour" v={<span className="flex items-center gap-1 justify-end">{b.labour.name}<span className={`w-2 h-2 rounded-full ${b.labour.online ? 'bg-emerald-500' : 'bg-zinc-300'}`} /></span>} />
            {b.labour.phone && <a href={`tel:${b.labour.phone}`} className="flex items-center gap-2 font-bold underline"><Phone size={14} />{b.labour.phone}</a>}
            <Row k="Accepted" v={fmtDT(b.acceptedAt)} /><Row k="Arrived" v={fmtDT(b.arrivedAt)} /><Row k="Started" v={fmtDT(b.startedAt)} />
            <Row k="Amount" v={`${inr(b.fare)} · ${b.paymentMethod || 'not chosen'}`} />
            <p className="text-xs text-zinc-500 flex gap-1.5"><MapPin size={13} className="shrink-0 mt-0.5" />{b.site}</p>
            {!pos && <p className="text-xs text-amber-600 font-semibold">No live GPS from the labour yet.</p>}
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ───────────── service job drawer: assign / reject / complete ───────────── */
function ServiceDrawer({ id, onClose, onChanged }) {
  const [d, setD] = useState(null)
  const [q, setQ] = useState('')
  const [pick, setPick] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState('')
  const [manual, setManual] = useState(false)
  const [m, setM] = useState({ assignedName: '', assignedPhone: '' })

  const load = useCallback(async (search = '') => {
    try { const { data } = await axios.get(`/api/admin/services/bookings/${id}`, { params: { q: search } }); setD(data) } catch { toast.error('Could not load booking') }
  }, [id])
  useEffect(() => { load(); axios.patch(`/api/admin/services/bookings/${id}`, { action: 'seen' }).catch(() => {}) }, [id, load])
  useEffect(() => { const t = setTimeout(() => d && load(q), 300); return () => clearTimeout(t) }, [q]) // eslint-disable-line

  const act = async (action, extra = {}, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(action)
    try {
      await axios.patch(`/api/admin/services/bookings/${id}`, { action, ...extra })
      toast.success({ assign_labour: 'Job sent to labour. Their phone is ringing.', assign: 'Professional saved', confirm: 'Booking confirmed', start: 'Marked started', complete: 'Completed & settled', cancel: 'Booking rejected' }[action] || 'Done')
      onChanged(); await load(q)
      if (action === 'cancel') onClose()
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed') } finally { setBusy('') }
  }

  const b = d?.booking
  const canAssign = b && ['pending', 'confirmed', 'assigned'].includes(b.status)
  return (
    <Drawer open onClose={onClose} subtitle="Service booking" title={b ? `#${b.code} · ${b.categoryName}` : '…'} width="max-w-2xl">
      {!b ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : (
        <div className="p-5 space-y-5">
          <div className="flex flex-wrap gap-2">{statusPill({ kind: 'service', status: b.status, assignStatus: b.assignStatus })}
            <Pill tone={b.paymentStatus === 'paid' ? 'green' : b.paymentStatus === 'cod' ? 'amber' : 'zinc'}>{b.paymentMethod === 'cash' ? 'Cash on service' : 'Online'} · {b.paymentStatus}</Pill></div>

          <div className="grid sm:grid-cols-2 gap-x-6">
            <div>
              <Row k="Service" v={b.providerName} /><Row k="Slot" v={fmtSlot(b.slotDate, b.slotTime)} />
              <Row k="Customer" v={b.contactName} /><Row k="Phone" v={<a className="underline" href={`tel:${b.contactPhone}`}>{b.contactPhone}</a>} />
            </div>
            <div>
              <Row k="Price" v={inr(b.price)} /><Row k="Platform fee" v={inr(b.fee)} /><Row k="Total" v={<b>{inr(b.total)}</b>} />
              <Row k={`Labour gets (${d.split.percent}% cut)`} v={<span className="text-emerald-700">{inr(b.labourAmount || d.split.labourAmount)}</span>} />
              <Row k="Company earns" v={inr(b.adminCommission || d.split.commission)} />
            </div>
          </div>
          <p className="text-sm flex gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-zinc-400" />{b.address.full}{b.address.landmark && `, ${b.address.landmark}`}, {b.address.city} - {b.address.pincode}</p>

          {b.assignedName && (
            <div className="flex items-center justify-between gap-3 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-2xl px-4 py-3 text-sm">
              <div><p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Assigned to</p>
                <p className="font-black">{b.assignedName} {b.assignedPhone && <span className="font-normal text-zinc-500">· {b.assignedPhone}</span>}</p></div>
              {b.assignedLabour ? <Pill tone={b.assignStatus === 'accepted' ? 'green' : 'amber'}>{b.assignStatus === 'accepted' ? 'Accepted' : 'Waiting accept'}</Pill> : <Pill>Outside pro</Pill>}
            </div>
          )}

          {canAssign && b.status !== 'in_progress' && (
            <section className="border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5"><UserPlus size={14} /> {b.assignedName ? 'Re-assign' : 'Assign'} labour</p>
                <button type="button" onClick={() => setManual((x) => !x)} className="text-[11px] font-bold underline text-zinc-500">{manual ? 'Pick registered labour' : 'Outside professional'}</button>
              </div>
              {manual ? (
                <div className="space-y-2">
                  <input className={input} placeholder="Professional name" value={m.assignedName} onChange={(e) => setM({ ...m, assignedName: e.target.value })} />
                  <input className={input} placeholder="Mobile (optional)" inputMode="numeric" value={m.assignedPhone} onChange={(e) => setM({ ...m, assignedPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                  <button type="button" disabled={!!busy || m.assignedName.trim().length < 2} onClick={() => act('assign', { ...m, adminNote: note })} className="w-full h-11 rounded-xl bg-zinc-900 text-white text-sm font-bold disabled:opacity-40">{busy === 'assign' ? '…' : 'Save professional'}</button>
                  <p className="text-[11px] text-zinc-400">Outside professionals get no app alert and no wallet entry.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3"><Search size={14} className="text-zinc-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search labour by name / phone" className="flex-1 py-2.5 text-sm outline-none bg-transparent" /></div>
                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                    {d.labours.length === 0 && <p className="text-sm text-zinc-400 text-center py-6">No approved labour found.</p>}
                    {d.labours.map((l) => (
                      <label key={l.userId} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${pick === l.userId ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                        <input type="radio" name="lab" className="sr-only" checked={pick === l.userId} onChange={() => setPick(l.userId)} />
                        <span className="relative shrink-0">
                          {l.photo ? <img src={l.photo} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <span className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-xs font-black">{l.name?.[0]}</span>}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${l.online ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-sm font-bold flex items-center gap-1.5 truncate">{l.name}{String(l.userId) === String(b.assignedLabour) && <Pill tone="blue">current</Pill>}{l.declined && <Pill tone="red">declined</Pill>}</span>
                          <span className="text-[11px] text-zinc-500 flex flex-wrap gap-x-2">{CATEGORY_LABEL[l.category] || l.category} · <span className="flex items-center gap-0.5"><Star size={10} />{l.rating ? l.rating.toFixed(1) : 'new'}</span> · {l.completedJobs} jobs{l.area && ` · ${l.area.slice(0, 28)}`}</span>
                        </span>
                        <span className="text-[10px] font-bold text-right shrink-0">{l.busy ? <span className="text-amber-600">Busy</span> : l.online ? <span className="text-emerald-600">Online</span> : <span className="text-zinc-400">Offline</span>}</span>
                      </label>
                    ))}
                  </div>
                  <textarea className={input} rows={2} maxLength={300} placeholder="Note for the labour (optional): gate code, tools to bring…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button type="button" disabled={!!busy || !pick} onClick={() => act('assign_labour', { labourId: pick, adminNote: note })}
                    className="w-full h-12 rounded-xl bg-emerald-700 text-white text-sm font-black disabled:opacity-40 flex items-center justify-center gap-2">
                    {busy === 'assign_labour' ? <Loader2 size={16} className="animate-spin" /> : <><Briefcase size={15} /> Send job to labour</>}
                  </button>
                </>
              )}
            </section>
          )}

          <div className="flex flex-wrap gap-2">
            {b.status === 'pending' && <button type="button" disabled={!!busy} onClick={() => act('confirm')} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-900 text-white disabled:opacity-50">Confirm booking</button>}
            {b.status === 'assigned' && <button type="button" disabled={!!busy} onClick={() => act('start', {}, 'Mark work as started on behalf of the labour?')} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-sky-600 text-white disabled:opacity-50">Mark started</button>}
            {['assigned', 'in_progress'].includes(b.status) && ['paid', 'cod'].includes(b.paymentStatus) && (
              <button type="button" disabled={!!busy} onClick={() => act('complete', {}, b.paymentMethod === 'cash' ? `Complete and record ₹${b.total} cash as collected?` : 'Mark this job completed?')} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white disabled:opacity-50">
                {b.paymentMethod === 'cash' ? 'Complete · cash collected' : 'Complete'}</button>
            )}
            {['pending', 'confirmed', 'assigned'].includes(b.status) && (
              <button type="button" disabled={!!busy} onClick={() => { const r = window.prompt('Reason for rejecting (customer is refunded if paid online):', 'Service not available'); if (r !== null) act('cancel', { reason: r }) }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-600 disabled:opacity-50">Reject booking</button>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Timeline</p>
            <ol className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-1.5 space-y-2.5">
              {b.history.map((h, i) => (
                <li key={i} className="pl-4 relative text-xs">
                  <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold capitalize">{String(h.status).replace(/_/g, ' ')}</span> <span className="text-zinc-400">· {h.byRole}{h.note ? ` · ${h.note}` : ''}</span>
                  <span className="block text-zinc-400">{fmtDT(h.at)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Drawer>
  )
}

/* ───────────── page ───────────── */
export default function AdminLabourJobs() {
  const [tab, setTab] = useState('live')
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const [d, setD] = useState(null)
  const [loading, setLoading] = useState(true)
  const [svc, setSvc] = useState(null)
  const [track, setTrack] = useState(null)
  const [moneyTick, setMoneyTick] = useState(0)
  const req = useRef(0)
  const timer = useRef(null)

  const load = useCallback(async () => {
    const id = ++req.current
    try {
      const { data } = await axios.get('/api/admin/labour/jobs', { params: { tab, kind, q } })
      if (id === req.current) setD(data)
    } catch (e) { console.log(e) } finally { if (id === req.current) setLoading(false) }
  }, [tab, kind, q])

  useEffect(() => { setLoading(true); const t = setTimeout(load, q ? 350 : 0); return () => clearTimeout(t) }, [load, q])
  useEffect(() => { const t = setInterval(() => document.visibilityState === 'visible' && load(), 30000); return () => clearInterval(t) }, [load])
  const live = useAdminLive(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { load(); setMoneyTick((n) => n + 1) }, 500)
  })

  const k = d?.kpi
  return (
    <div className="py-6 space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">Labour Jobs
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${live ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />{live ? 'LIVE' : 'Reconnecting'}</span></h1>
          <p className="text-sm text-zinc-500">Kaam assign se lekar finish aur payment settle hone tak — sab ek jagah.</p>
        </div>
        <button type="button" onClick={() => { load(); setMoneyTick((n) => n + 1) }} className="text-sm font-bold border bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-xl flex items-center gap-2"><RefreshCcw size={14} /> Refresh</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
        <Kpi icon={Hourglass} label="Work in progress" value={k?.inProgress ?? '—'} sub={k ? `${k.enRoute} on the way` : ''} tone="bg-emerald-50 text-emerald-700" />
        <Kpi icon={CalendarClock} label="Upcoming (not started)" value={k?.upcoming ?? '—'} tone="bg-blue-50 text-blue-700" />
        <Kpi icon={UserPlus} label="Unassigned" value={k?.unassigned ?? '—'} sub={k?.unassigned ? 'Labour assign karo' : 'All assigned'} tone="bg-amber-50 text-amber-700" highlight={k?.unassigned > 0} />
        <Kpi icon={Banknote} label="Commission due (cash)" value={k ? inr(k.cashDues) : '—'} sub={k ? `${k.laboursOwing} labour owe` : ''} tone="bg-red-50 text-red-600" />
        <Kpi icon={Wallet} label="Labour wallets (payable)" value={k ? inr(k.labourPayable) : '—'} sub={k ? (k.pendingWithdrawals ? `${k.pendingWithdrawals} withdraw pending` : 'No pending withdraw') : ''} tone="bg-violet-50 text-violet-700" />
        <Kpi icon={IndianRupee} label="Company earning available" value={k ? inr(k.companyAvailable) : '—'} sub={k ? `Total ${inr(k.companyTotal)}` : ''} tone="bg-zinc-900 text-white" />
      </div>

      <section className={`${card} p-4 min-w-0`}>
        <div className="flex gap-1 overflow-x-auto border-b dark:border-zinc-800 mb-4">
          {TABS.map(([key, l]) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              className={`px-3 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 -mb-px flex items-center gap-1.5 ${tab === key ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-zinc-500'}`}>
              {l}{d?.counts?.[key] != null && <span className={`text-[10px] px-1.5 rounded-full ${tab === key ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}>{d.counts[key]}</span>}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-3">
            <Search size={14} className="text-zinc-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Booking id, service, labour, phone" className="flex-1 min-w-0 bg-transparent py-2.5 text-sm outline-none" />
            {q && <button type="button" onClick={() => setQ('')} aria-label="Clear"><X size={14} /></button>}
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 text-xs font-bold">
            {[['all', 'All'], ['live', 'Live (instant)'], ['service', 'Scheduled']].map(([kk, l]) => (
              <button key={kk} type="button" onClick={() => setKind(kk)} className={`px-3 py-1.5 rounded-lg ${kind === kk ? 'bg-white dark:bg-zinc-950 shadow' : 'text-zinc-500'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="w-0 min-w-full overflow-x-auto rounded-xl border dark:border-zinc-800">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-[10px] uppercase tracking-widest text-zinc-400">
              <tr>{['Booking', 'Customer / Site', 'Labour', 'Progress', 'Money', 'Action'].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading && !d ? <tr><td colSpan={6} className="py-14 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                : !d?.rows.length ? <tr><td colSpan={6} className="py-14 text-center text-zinc-400">No jobs in this tab.</td></tr>
                : d.rows.map((r) => (
                  <tr key={r.kind + r._id} className={`border-t dark:border-zinc-800 align-top hover:bg-zinc-50/60 dark:hover:bg-zinc-900 ${r.kind === 'service' && !r.adminSeen && r.status === 'pending' ? 'bg-amber-50/60 dark:bg-amber-950/30' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-black">#{r.code}</p>
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-xs text-zinc-500">{r.kind === 'service' ? fmtSlot(r.slotDate, r.slotTime) : fmtDT(r.when)}</p>
                      <div className="mt-1 flex flex-wrap gap-1"><Pill tone={r.kind === 'live' ? 'green' : 'blue'}>{r.kind === 'live' ? 'LIVE' : 'SCHEDULED'}</Pill>{statusPill(r)}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="font-bold">{r.customer.name}</p>
                      <a href={`tel:${r.customer.phone}`} className="text-xs text-zinc-500 hover:underline">{r.customer.phone}</a>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{r.site}</p>
                    </td>
                    <td className="px-4 py-3">
                      {r.labour ? (
                        <>
                          <p className="font-bold flex items-center gap-1.5">{r.labour.name}{r.kind === 'live' && <span className={`w-2 h-2 rounded-full ${r.labour.online ? 'bg-emerald-500' : 'bg-zinc-300'}`} />}</p>
                          {r.labour.phone && <a href={`tel:${r.labour.phone}`} className="text-xs text-zinc-500 hover:underline">{r.labour.phone}</a>}
                          {r.kind === 'service' && r.labour.registered === false && <p className="text-[10px] text-zinc-400">outside professional</p>}
                        </>
                      ) : <span className="text-xs font-bold text-amber-600">Not assigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Steps steps={r.steps} step={r.step} dead={r.dead} paid={r.kind === 'service' ? r.paid : r.money.paymentStatus === 'paid'} />
                      {r.workMinutes != null && <p className="text-[10px] text-zinc-400 mt-1">Work time {Math.round(r.workMinutes)} min</p>}
                      {r.cancelReason && <p className="text-[10px] text-red-500 mt-1">{r.cancelReason}</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-black">{inr(r.money.total)} <span className="text-xs font-semibold text-zinc-500">· {r.money.method || '—'}</span></p>
                      <p className="text-[11px] text-zinc-500">Labour {inr(r.money.labour)} · Company {inr(r.money.company)}</p>
                      <p className={`text-[10px] font-bold ${r.money.paymentStatus === 'paid' || r.money.paymentStatus === 'cash' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {r.step === r.steps.length - 1 ? 'Payment complete' : r.money.paymentStatus === 'paid' ? 'Paid online' : r.money.method === 'cash' ? 'Cash on completion' : r.dead ? r.money.paymentStatus : 'Payment pending'}
                        {r.money.projected && !r.dead ? ' · est.' : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {r.kind === 'service' ? (
                        <button type="button" onClick={() => setSvc(r._id)}
                          className={`text-xs font-bold px-3 py-2 rounded-lg ${!r.labour && ['pending', 'confirmed'].includes(r.status) ? 'bg-emerald-700 text-white' : 'border dark:border-zinc-700'}`}>
                          {!r.labour && ['pending', 'confirmed'].includes(r.status) ? 'Assign labour' : 'Manage'}
                        </button>
                      ) : r.trackable ? (
                        <button type="button" onClick={() => setTrack(r._id)} className="text-xs font-bold px-3 py-2 rounded-lg bg-zinc-900 text-white flex items-center gap-1.5"><Navigation size={12} /> Track live</button>
                      ) : <span className="text-xs text-zinc-300">—</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdminLabourMoney refreshKey={moneyTick} platform={d?.platform} settings={d?.settings} onChanged={load} />

      {svc && <ServiceDrawer id={svc} onClose={() => setSvc(null)} onChanged={load} />}
      {track && <TrackModal id={track} onClose={() => setTrack(null)} />}
    </div>
  )
}
