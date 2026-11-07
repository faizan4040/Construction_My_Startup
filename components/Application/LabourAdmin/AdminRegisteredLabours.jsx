'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Ban, BadgeCheck, Briefcase, ChevronLeft, ChevronRight, ExternalLink, FileText, IdCard, IndianRupee, Landmark, Loader2, Lock, MapPin, Phone, Plus, RefreshCcw, Search, ShieldCheck, Star, Trash2, Undo2, Unlock, UserRound, Wallet,
} from 'lucide-react'
import useAdminLive from '@/hooks/useAdminLive'
import { CATEGORY_LABEL } from '@/components/Application/Labour/categoryMeta'
import { card, Drawer, fmtD, fmtDT, inr, input, Modal, Pill, Row } from './ui'

const STATUS_TABS = [['all', 'All'], ['approved', 'Approved'], ['pending', 'Pending'], ['online', 'Online now'], ['blocked', 'Blocked'], ['rejected', 'Rejected'], ['removed', 'Removed']]
const REVIEW = { approved: 'green', pending: 'amber', rejected: 'red', not_created: 'zinc' }
const LIVE_ST = { requested: 'amber', confirmed: 'blue', arrived: 'violet', started: 'green', work_completed: 'violet', completed: 'dark', cancelled: 'red', rejected: 'red', expired: 'zinc' }
const LEDGER = { labour_credit: 'Online job earning', cash_commission_due: 'Cash job fee due', dues_payment: 'Dues paid online', dues_settlement: 'Dues settled by admin', payout_debit: 'Withdrawal', payout_reversal: 'Withdrawal returned' }

function Img({ src, label, onOpen }) {
  if (!src) return (
    <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-300 text-[11px] font-semibold">
      <FileText size={18} />{label}<span className="text-[10px]">not uploaded</span></div>
  )
  const pdf = /\.pdf($|\?)/i.test(src)
  return (
    <button type="button" onClick={() => (pdf ? window.open(src, '_blank') : onOpen(src))} className="group text-left">
      <div className="aspect-[4/3] rounded-xl overflow-hidden border dark:border-zinc-800 bg-zinc-50 relative">
        {pdf ? <div className="w-full h-full flex items-center justify-center"><FileText size={28} className="text-zinc-400" /></div>
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={src} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
      </div>
      <p className="text-[11px] font-bold mt-1 flex items-center gap-1">{label}<ExternalLink size={10} className="text-zinc-400" /></p>
    </button>
  )
}

function LabourDrawer({ id, onClose, onChanged }) {
  const [d, setD] = useState(null)
  const [tab, setTab] = useState('overview')
  const [busy, setBusy] = useState('')
  const [zoom, setZoom] = useState(null)
  const [dialog, setDialog] = useState(null) // { action, title, needsReason, amount? }
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState('')

  const load = useCallback(async () => {
    try { const { data } = await axios.get(`/api/admin/labour/partners/${id}`); setD(data) } catch { toast.error('Could not load labour') }
  }, [id])
  useEffect(() => { load() }, [load])

  const run = async (action, extra = {}) => {
    setBusy(action)
    try {
      await axios.patch(`/api/admin/labour/partners/${id}`, { action, ...extra })
      toast.success({ block: 'Account blocked. Labour was logged out.', unblock: 'Account unblocked', kick: 'Labour removed from platform', restore: 'Labour restored', settle_dues: 'Dues recorded as received' }[action])
      setDialog(null); setReason(''); setAmount(''); await load(); onChanged()
    } catch (e) {
      if (e.response?.data?.needsForce) {
        if (window.confirm(`${e.response.data.message}`)) return run(action, { ...extra, force: true })
      } else toast.error(e.response?.data?.message || 'Action failed')
    } finally { setBusy('') }
  }

  const u = d?.user, p = d?.profile, k = d?.kyc, w = d?.wallet
  const name = p?.fullName || u?.name
  return (
    <Drawer open onClose={onClose} subtitle="Registered labour" title={name || '…'} width="max-w-3xl"
      footer={u && (
        <div className="flex flex-wrap gap-2">
          {u.deletedAt ? (
            <button type="button" disabled={!!busy} onClick={() => run('restore')} className="flex-1 h-11 rounded-xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center gap-2"><Undo2 size={15} /> Restore labour</button>
          ) : (
            <>
              {u.isBlocked
                ? <button type="button" disabled={!!busy} onClick={() => run('unblock')} className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2">{busy === 'unblock' ? <Loader2 size={15} className="animate-spin" /> : <Unlock size={15} />} Unblock account</button>
                : <button type="button" disabled={!!busy} onClick={() => setDialog({ action: 'block', title: 'Block this account', needsReason: true })} className="flex-1 h-11 rounded-xl bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2"><Lock size={15} /> Block account</button>}
              <button type="button" disabled={!!busy} onClick={() => setDialog({ action: 'kick', title: 'Remove (kick) from platform' })} className="flex-1 h-11 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm flex items-center justify-center gap-2"><Trash2 size={15} /> Kick labour</button>
              {w?.dues > 0 && <button type="button" disabled={!!busy} onClick={() => { setAmount(String(w.dues)); setDialog({ action: 'settle_dues', title: 'Record dues received', amount: true }) }} className="flex-1 h-11 rounded-xl border dark:border-zinc-700 font-bold text-sm flex items-center justify-center gap-2"><IndianRupee size={15} /> Settle dues</button>}
            </>
          )}
        </div>
      )}>
      {!d ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : (
        <div>
          {/* header */}
          <div className="p-5 flex items-start gap-4 border-b dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p?.profileImage || k?.selfieImage ? <img src={p?.profileImage || k?.selfieImage} alt="" className="w-20 h-20 rounded-2xl object-cover" />
              : <span className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center"><UserRound className="text-zinc-400" /></span>}
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-xl font-black flex items-center gap-1.5">{name}{p?.isVerified && <BadgeCheck size={18} className="text-blue-500" />}</p>
              <p className="text-sm text-zinc-500">{CATEGORY_LABEL[p?.category] || 'No profile yet'} · joined {fmtD(u.createdAt)}</p>
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={REVIEW[u.partnerStatus]}>Partner: {u.partnerStatus}</Pill>
                <Pill tone={u.videoKycStatus === 'approved' ? 'green' : u.videoKycStatus === 'rejected' ? 'red' : 'amber'}>Video KYC: {u.videoKycStatus}</Pill>
                {p && <Pill tone={REVIEW[p.status]}>Profile: {p.status}</Pill>}
                {u.deletedAt ? <Pill tone="red">Removed</Pill> : u.isBlocked ? <Pill tone="red">Blocked</Pill> : <Pill tone={u.isOnline && p?.availability !== 'offline' ? 'green' : 'zinc'}>{u.isOnline && p?.availability !== 'offline' ? 'Online' : 'Offline'}</Pill>}
              </div>
              {u.isBlocked && u.blockReason && <p className="text-xs text-red-600">Reason: {u.blockReason} · {fmtDT(u.blockedAt)}</p>}
              {u.partnerStatus === 'pending' && u.partnerOnBoardingSteps >= 3 && (
                <Link href={`/admin/labour-dashboard/reviews/partner/${u._id}`} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 underline">Open approval review <ExternalLink size={11} /></Link>
              )}
            </div>
          </div>

          <div className="px-5 pt-3 flex gap-1 overflow-x-auto border-b dark:border-zinc-800">
            {[['overview', 'Overview'], ['kyc', 'KYC documents'], ['bank', 'Bank'], ['money', 'Wallet'], ['jobs', 'Jobs']].map(([t, l]) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`px-3 py-2 text-sm font-bold border-b-2 -mb-px whitespace-nowrap ${tab === t ? 'border-zinc-900 dark:border-white' : 'border-transparent text-zinc-400'}`}>{l}</button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'overview' && (
              <div className="grid sm:grid-cols-2 gap-x-8">
                <div>
                  <Row k="Phone" v={p?.phone || u.phone ? <a className="underline" href={`tel:${p?.phone || u.phone}`}>{p?.phone || u.phone}</a> : '—'} />
                  <Row k="Email" v={u.email} />
                  <Row k="Experience" v={p ? `${p.experienceYears} years` : '—'} />
                  <Row k="Pricing" v={p ? [p.pricePerDay && `₹${p.pricePerDay}/day`, p.pricePerHour && `₹${p.pricePerHour}/hr`].filter(Boolean).join(' · ') || '—' : '—'} />
                  <Row k="Service radius" v={p ? `${p.serviceRadius} km` : '—'} />
                  <Row k="Skills" v={p?.skills?.length ? p.skills.join(', ') : '—'} />
                </div>
                <div>
                  <Row k="Rating" v={<span className="flex items-center gap-1 justify-end"><Star size={12} className="fill-amber-400 text-amber-400" />{p?.rating ? p.rating.toFixed(1) : 'New'} ({p?.totalReviews || 0})</span>} />
                  <Row k="Live jobs done" v={d.stats.liveCompleted} />
                  <Row k="Service jobs done" v={d.stats.serviceCompleted} />
                  <Row k="Cancelled / rejected" v={d.stats.liveCancelled} />
                  <Row k="Last GPS" v={u.location ? fmtDT(u.location.at) : 'never'} />
                  <Row k="Area" v={p?.location?.address || '—'} />
                </div>
                {p?.about && <p className="sm:col-span-2 text-sm text-zinc-600 dark:text-zinc-300 mt-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3">{p.about}</p>}
                {u.location && <a href={`https://www.google.com/maps?q=${u.location.lat},${u.location.lon}`} target="_blank" rel="noreferrer" className="sm:col-span-2 mt-3 inline-flex items-center gap-1.5 text-sm font-bold underline"><MapPin size={14} /> Open last known location</a>}
              </div>
            )}

            {tab === 'kyc' && (!k ? <p className="text-sm text-zinc-400 py-10 text-center">Documents not submitted yet.</p> : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 justify-between bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1"><IdCard size={12} /> Aadhaar number</p>
                    <p className="font-mono font-black tracking-wider">{String(k.aadhaarNumber || '').replace(/(\d{4})(?=\d)/g, '$1 ')}</p></div>
                  <div className="text-right"><Pill tone={REVIEW[k.status]}>Documents: {k.status}</Pill><p className="text-[10px] text-zinc-400 mt-1">Submitted {fmtD(k.submittedAt)}{k.verifiedAt && ` · verified ${fmtD(k.verifiedAt)}`}</p></div>
                </div>
                {k.rejectionReason && <p className="text-xs text-red-600">Rejection reason: {k.rejectionReason}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Img src={k.aadhaarFront} label="Aadhaar front" onOpen={setZoom} />
                  <Img src={k.aadhaarBack} label="Aadhaar back" onOpen={setZoom} />
                  <Img src={k.selfieImage} label="Selfie" onOpen={setZoom} />
                  <Img src={k.addressProof} label="Address proof" onOpen={setZoom} />
                  <Img src={k.experienceCertificate} label="Experience certificate" onOpen={setZoom} />
                  <Img src={k.policeVerification} label="Police verification" onOpen={setZoom} />
                </div>
                {u.videoKycRejectionReason && <p className="text-xs text-red-600">Video KYC rejection: {u.videoKycRejectionReason}</p>}
              </div>
            ))}

            {tab === 'bank' && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div><p className="text-xs font-black mb-2 flex items-center gap-1.5"><Landmark size={14} /> Bank (from registration)</p>
                  {d.bank ? <>
                    <Row k="Holder" v={d.bank.accountHolder} /><Row k="Bank" v={`${d.bank.bankName}${d.bank.branchName ? `, ${d.bank.branchName}` : ''}`} />
                    <Row k="Account" v={d.bank.accountNumber} /><Row k="IFSC" v={d.bank.ifsc} /><Row k="UPI" v={d.bank.upi || '—'} />
                    <Row k="Status" v={<Pill tone={d.bank.isVerified ? 'green' : 'amber'}>{d.bank.status}</Pill>} />
                  </> : <p className="text-sm text-zinc-400">Not added</p>}</div>
                <div><p className="text-xs font-black mb-2 flex items-center gap-1.5"><Wallet size={14} /> Payout account (withdrawals go here)</p>
                  {d.payoutAccount ? <>
                    <Row k="Holder" v={d.payoutAccount.holderName} /><Row k="Account" v={`••••${d.payoutAccount.last4}`} />
                    <Row k="IFSC" v={d.payoutAccount.ifsc} /><Row k="UPI" v={d.payoutAccount.upiId || '—'} />
                    <Row k="Status" v={<Pill tone={d.payoutAccount.status === 'verified' ? 'green' : 'amber'}>{d.payoutAccount.status}</Pill>} />
                  </> : <p className="text-sm text-zinc-400">Not added yet</p>}</div>
              </div>
            )}

            {tab === 'money' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[['Withdrawable', w.withdrawable, 'text-emerald-700'], ['On hold', w.pending], ['Dues', w.dues, w.dues ? 'text-red-600' : ''], ['Withdrawn', w.withdrawn]].map(([l, v, c]) => (
                    <div key={l} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3"><p className="text-[10px] uppercase font-bold text-zinc-400">{l}</p><p className={`text-lg font-black ${c || ''}`}>{inr(v)}</p></div>
                  ))}
                </div>
                <p className="text-xs text-zinc-500">Cash job fees {inr(w.cashCommission)} · auto-adjusted from online {inr(w.adjustedFromOnline)} · paid/settled {inr(w.duesPaid)}</p>
                <div className="divide-y dark:divide-zinc-800">
                  {d.ledger.length === 0 && <p className="text-sm text-zinc-400 py-6 text-center">No transactions.</p>}
                  {d.ledger.map((e) => (
                    <div key={e._id} className="flex justify-between py-2 text-sm"><span><b>{LEDGER[e.type] || e.type}</b><span className="block text-[11px] text-zinc-400">{fmtDT(e.createdAt)}{e.note ? ` · ${e.note}` : ''}</span></span>
                      <b className={e.amount >= 0 ? 'text-emerald-700' : 'text-red-600'}>{e.amount >= 0 ? '+' : '−'}{inr(Math.abs(e.amount))}</b></div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'jobs' && (
              <div className="space-y-5">
                <div><p className="text-xs font-black mb-2">Live jobs</p>
                  {d.liveJobs.length === 0 ? <p className="text-sm text-zinc-400">None</p> : d.liveJobs.map((j) => (
                    <div key={j._id} className="flex items-center justify-between gap-3 py-2 border-b dark:border-zinc-800 text-sm">
                      <div className="min-w-0"><p className="font-bold">{CATEGORY_LABEL[j.category]} · {inr(j.fare)} <span className="text-zinc-400 font-normal">{j.paymentMethod}</span></p><p className="text-[11px] text-zinc-400 truncate">{fmtDT(j.createdAt)} · {j.workAddress}</p></div>
                      <Pill tone={LIVE_ST[j.bookingStatus]}>{j.bookingStatus}</Pill></div>
                  ))}</div>
                <div><p className="text-xs font-black mb-2">Scheduled service jobs</p>
                  {d.serviceJobs.length === 0 ? <p className="text-sm text-zinc-400">None</p> : d.serviceJobs.map((j) => (
                    <div key={j._id} className="flex items-center justify-between gap-3 py-2 border-b dark:border-zinc-800 text-sm">
                      <div className="min-w-0"><p className="font-bold">#{j.code} {j.categoryName} · {inr(j.total)}</p><p className="text-[11px] text-zinc-400">{j.slotDate} {j.slotTime} · {j.address?.city}</p></div>
                      <Pill tone={j.status === 'completed' ? 'dark' : j.status === 'cancelled' ? 'red' : 'blue'}>{j.status}</Pill></div>
                  ))}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={!!zoom} onClose={() => setZoom(null)} title="Document" wide>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {zoom && <img src={zoom} alt="document" className="w-full max-h-[80vh] object-contain bg-zinc-950" />}
      </Modal>

      <Modal open={!!dialog} onClose={() => setDialog(null)} title={dialog?.title}>
        <div className="p-5 space-y-3">
          {dialog?.action === 'block' && <p className="text-sm text-zinc-500">The labour is logged out at once, cannot log in, and disappears from customer search. Waiting requests are released.</p>}
          {dialog?.action === 'kick' && <p className="text-sm text-zinc-500">Removes this labour from the platform (can be restored later). Their wallet and history are kept for accounting.</p>}
          {dialog?.amount && (
            <div className="flex items-center border dark:border-zinc-700 rounded-xl px-3"><IndianRupee size={14} className="text-zinc-400" />
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} inputMode="numeric" className="flex-1 py-3 px-2 outline-none text-sm bg-transparent" /></div>
          )}
          <textarea className={input} rows={3} maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder={dialog?.action === 'settle_dues' ? 'Note (cash at office, UPI ref…)' : dialog?.needsReason ? 'Reason (shown to the labour)' : 'Reason (optional)'} />
          <button type="button" disabled={!!busy || (dialog?.needsReason && reason.trim().length < 3) || (dialog?.amount && !amount)}
            onClick={() => run(dialog.action, { reason, amount: Number(amount) })}
            className={`w-full h-11 rounded-xl font-bold text-white disabled:opacity-40 ${dialog?.action === 'kick' ? 'bg-red-600' : dialog?.action === 'block' ? 'bg-amber-500' : 'bg-zinc-900'}`}>
            {busy ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirm'}
          </button>
        </div>
      </Modal>
    </Drawer>
  )
}

export default function AdminRegisteredLabours() {
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [d, setD] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(null)
  const req = useRef(0)
  const timer = useRef(null)

  const load = useCallback(async () => {
    const id = ++req.current
    try {
      const { data } = await axios.get('/api/admin/labour/partners', { params: { status, category, q, page } })
      if (id === req.current) setD(data)
    } catch (e) { console.log(e) } finally { if (id === req.current) setLoading(false) }
  }, [status, category, q, page])
  useEffect(() => { setLoading(true); const t = setTimeout(load, q ? 350 : 0); return () => clearTimeout(t) }, [load, q])
  const live = useAdminLive((p) => { if (p?.kind === 'labour' || p?.kind === 'wallet') { clearTimeout(timer.current); timer.current = setTimeout(load, 500) } })

  return (
    <div className="py-6 space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black flex items-center gap-2">Registered Labours
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${live ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{live ? 'LIVE' : '…'}</span></h1>
          <p className="text-sm text-zinc-500">Self-registered partners: KYC, status, wallet and account control</p></div>
        <div className="flex gap-2">
          <Link href="/admin/services/labours" className="text-sm font-bold bg-zinc-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2"><Plus size={15} /> Add labour manually</Link>
          <button type="button" onClick={load} className="text-sm font-bold border bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-xl flex items-center gap-2"><RefreshCcw size={14} /></button>
        </div>
      </div>

      <section className={`${card} p-4 min-w-0`}>
        <div className="flex gap-1 overflow-x-auto border-b dark:border-zinc-800 mb-4">
          {STATUS_TABS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => { setStatus(k); setPage(1) }}
              className={`px-3 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 -mb-px flex items-center gap-1.5 ${status === k ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-zinc-500'}`}>
              {l}<span className="text-[10px] px-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{d?.counts?.[k] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-3">
            <Search size={14} className="text-zinc-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Name, phone or email" className="flex-1 min-w-0 bg-transparent py-2.5 text-sm outline-none" />
          </div>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm">
            <option value="">All categories</option>
            {Object.keys(CATEGORY_LABEL).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        </div>

        <div className="w-0 min-w-full overflow-x-auto rounded-xl border dark:border-zinc-800">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-[10px] uppercase tracking-widest text-zinc-400">
              <tr>{['Labour', 'Category', 'Verification', 'Live status', 'Jobs / rating', 'Wallet / dues', ''].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading && !d ? <tr><td colSpan={7} className="py-14 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                : !d?.labours.length ? <tr><td colSpan={7} className="py-14 text-center text-zinc-400">No labour found.</td></tr>
                : d.labours.map((l) => (
                  <tr key={l._id} onClick={() => setSel(l._id)} className="border-t dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {l.photo ? <img src={l.photo} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <span className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500">{l.name?.[0]}</span>}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${l.online ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                        </span>
                        <div className="min-w-0"><p className="font-bold flex items-center gap-1 truncate">{l.name}{l.isVerified && <BadgeCheck size={14} className="text-blue-500" />}</p>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1"><Phone size={10} />{l.phone || l.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{CATEGORY_LABEL[l.category] || <span className="text-zinc-300">—</span>}<p className="text-[11px] text-zinc-400">{l.experienceYears} yrs</p></td>
                    <td className="px-4 py-3 space-y-1"><Pill tone={REVIEW[l.partnerStatus]}>{l.partnerStatus}</Pill><p className="text-[10px] text-zinc-400">Step {l.step}/8 · KYC {l.videoKycStatus}</p></td>
                    <td className="px-4 py-3">
                      {l.removed ? <Pill tone="red"><Trash2 size={10} />Removed</Pill> : l.isBlocked ? <Pill tone="red"><Ban size={10} />Blocked</Pill>
                        : l.busy ? <Pill tone="violet"><Briefcase size={10} />On a job</Pill> : l.online ? <Pill tone="green">Online</Pill> : <Pill>Offline</Pill>}
                      {l.lastSeen && <p className="text-[10px] text-zinc-400 mt-1">GPS {fmtDT(l.lastSeen)}</p>}
                    </td>
                    <td className="px-4 py-3"><b>{l.completedJobs}</b> jobs<p className="text-[11px] text-zinc-500 flex items-center gap-0.5"><Star size={10} className="fill-amber-400 text-amber-400" />{l.rating ? l.rating.toFixed(1) : 'new'} ({l.totalReviews})</p></td>
                    <td className="px-4 py-3"><b className="text-emerald-700">{inr(l.wallet)}</b>{l.dues > 0 && <p className="text-[11px] font-bold text-red-600">owes {inr(l.dues)}</p>}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold border dark:border-zinc-700 px-3 py-1.5 rounded-lg flex items-center gap-1 w-max"><ShieldCheck size={12} /> Details</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {d && d.pages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-3 text-sm">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="w-9 h-9 rounded-lg border flex items-center justify-center disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="font-bold">{page} / {d.pages}</span>
            <button type="button" disabled={page >= d.pages} onClick={() => setPage((p) => p + 1)} className="w-9 h-9 rounded-lg border flex items-center justify-center disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        )}
      </section>

      {sel && <LabourDrawer key={sel} id={sel} onClose={() => setSel(null)} onChanged={load} />}
    </div>
  )
}
