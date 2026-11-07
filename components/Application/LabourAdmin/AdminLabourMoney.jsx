'use client'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Building2, IndianRupee, Landmark, Loader2, Percent, Save, Settings2,
} from 'lucide-react'
import PayoutAccountForm from '@/components/Application/Labour/PayoutAccountForm'
import { CATEGORY_LABEL } from '@/components/Application/Labour/categoryMeta'
import { card, fmtDT, inr, input, Modal, Pill } from './ui'

const PST = { requested: 'amber', approved: 'blue', processing: 'blue', paid: 'green', rejected: 'red', failed: 'red' }

/* ───── Labour commission & wallets ───── */
function Wallets({ refreshKey, onChanged }) {
  const [rows, setRows] = useState(null)
  const [only, setOnly] = useState('all')
  const [settle, setSettle] = useState(null)
  const [amt, setAmt] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try { const { data } = await axios.get('/api/admin/labour/wallets', { params: { only } }); setRows(data.rows) } catch (e) { console.log(e) }
  }, [only])
  useEffect(() => { load() }, [load, refreshKey])

  const doSettle = async () => {
    setBusy(true)
    try {
      await axios.patch(`/api/admin/labour/partners/${settle.labourId}`, { action: 'settle_dues', amount: Number(amt), reason: note })
      toast.success('Dues settled'); setSettle(null); load(); onChanged?.()
    } catch (e) { toast.error(e.response?.data?.message || 'Could not settle') } finally { setBusy(false) }
  }

  return (
    <section className={`${card} p-4 sm:p-5 min-w-0`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div><h2 className="font-black">Labour commission & wallets</h2>
          <p className="text-xs text-zinc-500">Online kamai se due auto adjust hota hai</p></div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 text-xs font-bold">
          {[['all', 'All'], ['dues', 'Owe commission'], ['payable', 'Have balance']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setOnly(k)} className={`px-3 py-1.5 rounded-lg ${only === k ? 'bg-white dark:bg-zinc-950 shadow' : 'text-zinc-500'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="w-0 min-w-full overflow-x-auto rounded-xl border dark:border-zinc-800">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950 text-[10px] uppercase tracking-widest text-zinc-400">
            <tr>{['Labour', 'Commission due', 'Wallet', 'On hold', 'Earned online', 'Cash fee · adjusted · paid', 'Withdrawn', ''].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {!rows ? <tr><td colSpan={8} className="py-10 text-center"><Loader2 className="animate-spin inline" /></td></tr>
              : rows.length === 0 ? <tr><td colSpan={8} className="py-10 text-center text-zinc-400">Abhi koi labour wallet nahi.</td></tr>
              : rows.map((r) => (
                <tr key={r.labourId} className="border-t dark:border-zinc-800">
                  <td className="px-4 py-3"><p className="font-bold flex items-center gap-1.5">{r.name}{r.blocked && <Pill tone="red">{r.removed ? 'removed' : 'blocked'}</Pill>}</p>
                    <p className="text-[11px] text-zinc-500">{CATEGORY_LABEL[r.category] || r.category} · {r.phone}</p></td>
                  <td className="px-4 py-3 font-black">{r.dues ? <span className="text-red-600">{inr(r.dues)}</span> : <span className="text-zinc-300">₹0</span>}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">{inr(r.wallet)}{r.withdrawPending > 0 && <p className="text-[10px] font-bold text-amber-600">{inr(r.withdrawPending)} withdraw pending</p>}</td>
                  <td className="px-4 py-3 text-zinc-500">{inr(r.onHold)}</td>
                  <td className="px-4 py-3">{inr(r.earnedOnline)}</td>
                  <td className="px-4 py-3 text-xs">{inr(r.cashCommission)} · <span className="text-emerald-700">{inr(r.adjustedFromOnline)}</span> · {inr(r.duesPaidOnline + r.duesSettled)}</td>
                  <td className="px-4 py-3">{inr(r.withdrawn)}</td>
                  <td className="px-4 py-3">{r.dues > 0 && <button type="button" onClick={() => { setSettle(r); setAmt(String(r.dues)); setNote('') }} className="text-xs font-bold border dark:border-zinc-700 px-3 py-1.5 rounded-lg whitespace-nowrap">Mark received</button>}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!settle} onClose={() => setSettle(null)} title={`Settle dues · ${settle?.name || ''}`}>
        <div className="p-5 space-y-3">
          <p className="text-sm text-zinc-500">Use this when the labour paid the commission to you directly (cash / bank transfer). Owes <b className="text-red-600">{inr(settle?.dues)}</b>.</p>
          <div className="flex items-center border dark:border-zinc-700 rounded-xl px-3"><IndianRupee size={14} className="text-zinc-400" />
            <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ''))} inputMode="numeric" className="flex-1 py-3 px-2 outline-none text-sm bg-transparent" /></div>
          <input className={input} placeholder="Note (e.g. cash received at office, UPI ref…)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
          <button type="button" onClick={doSettle} disabled={busy || !amt} className="w-full h-11 rounded-xl bg-zinc-900 text-white font-bold disabled:opacity-40">{busy ? <Loader2 size={16} className="animate-spin mx-auto" /> : `Record ${inr(amt)} received`}</button>
        </div>
      </Modal>
    </section>
  )
}

/* ───── Company earning + withdraw to bank ───── */
function CompanyEarning({ platform, refreshKey, onChanged }) {
  const [fin, setFin] = useState(null)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    try { const { data } = await axios.get('/api/admin/labour/finance'); setFin(data) } catch (e) { console.log(e) }
  }, [])
  useEffect(() => { load() }, [load, refreshKey])
  const p = fin?.platform || platform

  const withdraw = async () => {
    setBusy('w')
    try {
      const { data } = await axios.post('/api/admin/labour/withdraw', { amount: Number(amount) })
      toast.success(data.manual ? 'Withdrawal recorded. Transfer from Razorpay to your bank, then mark it paid below.' : 'Withdrawal sent via RazorpayX')
      setAmount(''); setOpen(false); load(); onChanged?.()
    } catch (e) { toast.error(e.response?.data?.message || 'Could not withdraw') } finally { setBusy('') }
  }
  const payoutAct = async (id, action, extra = {}) => {
    setBusy(id + action)
    try { await axios.post(`/api/admin/labour/payouts/${id}`, { action, ...extra }); toast.success('Updated'); load(); onChanged?.() }
    catch (e) { toast.error(e.response?.data?.message || 'Action failed') } finally { setBusy('') }
  }

  const lines = p ? [
    ['Online jobs commission (auto cut)', p.online],
    ['Cash commission — adjusted from online', p.adjustedFromOnline],
    ['Cash commission — labour paid online', p.duesPaidOnline],
    ['Cash commission — settled manually', p.duesSettledManual, 'not in Razorpay'],
    ['Cash commission — still due from labour', p.cashDuesOutstanding, 'pending'],
    ['Withdrawn to bank', -p.withdrawn],
  ] : []

  return (
    <section className={`${card} p-4 sm:p-5 space-y-4 min-w-0`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="font-black flex items-center gap-2"><Building2 size={18} /> Company earning</h2>
          <p className="text-xs text-zinc-500">{fin?.razorpayX ? 'RazorpayX payouts ON' : 'Manual mode: withdraw records it, you transfer & mark paid'}</p></div>
        <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Available to withdraw</p>
          <p className="text-3xl font-black">{inr(p?.available)}</p></div>
      </div>
      <div className="divide-y dark:divide-zinc-800 text-sm">
        {lines.map(([l, v, tag]) => (
          <div key={l} className="flex justify-between py-2 gap-3"><span className="text-zinc-500">{l}{tag && <span className="ml-1.5 text-[10px] text-zinc-400">({tag})</span>}</span><b className={v < 0 ? 'text-red-600' : ''}>{v < 0 ? '−' : ''}{inr(Math.abs(v))}</b></div>
        ))}
        <div className="flex justify-between py-2 font-black"><span>Total commission earned</span><span>{inr(p?.totalEarned)}</span></div>
      </div>
      <button type="button" onClick={() => setOpen(true)} className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-black flex items-center justify-center gap-2"><Landmark size={16} /> Withdraw to bank</button>

      {fin?.payouts?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Withdrawal requests</p>
          <div className="w-0 min-w-full overflow-x-auto rounded-xl border dark:border-zinc-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <tbody>
                {fin.payouts.slice(0, 15).map((r) => (
                  <tr key={r._id} className="border-t first:border-0 dark:border-zinc-800 align-top">
                    <td className="px-3 py-2.5 text-xs text-zinc-500 whitespace-nowrap">{fmtDT(r.createdAt)}</td>
                    <td className="px-3 py-2.5"><p className="font-semibold">{r.ownerName}</p><p className="text-[10px] text-zinc-400 capitalize">{r.ownerType} · ••••{r.account?.last4} {r.account?.ifsc}</p></td>
                    <td className="px-3 py-2.5 font-black">{inr(r.amount)}</td>
                    <td className="px-3 py-2.5"><Pill tone={PST[r.status]}>{r.status}</Pill>{r.utr && <p className="text-[10px] text-zinc-400 mt-0.5">UTR {r.utr}</p>}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap space-x-1.5">
                      {r.status === 'requested' && <>
                        <button disabled={!!busy} onClick={() => payoutAct(r._id, 'approve')} className="text-xs font-bold bg-zinc-900 text-white px-2.5 py-1.5 rounded-lg disabled:opacity-40">Approve</button>
                        <button disabled={!!busy} onClick={() => payoutAct(r._id, 'reject')} className="text-xs font-bold border px-2.5 py-1.5 rounded-lg disabled:opacity-40">Reject</button></>}
                      {r.status === 'approved' && r.method === 'manual' && <button disabled={!!busy} onClick={() => { const utr = window.prompt('Bank UTR / reference after you transferred the money'); if (utr) payoutAct(r._id, 'mark_paid', { utr }) }} className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg disabled:opacity-40">Mark paid</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Withdraw company earning">
        <div className="p-5 space-y-4">
          <div><p className="text-xs font-bold mb-2">Your bank account</p>
            <PayoutAccountForm account={fin?.account} onSaved={(a) => setFin((x) => ({ ...x, account: a }))} /></div>
          <div><p className="text-xs font-bold mb-2">Amount <span className="text-zinc-400 font-normal">· available {inr(p?.available)}</span></p>
            <div className="flex gap-2">
              <div className="flex items-center flex-1 border dark:border-zinc-700 rounded-xl px-3"><IndianRupee size={14} className="text-zinc-400" />
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Amount" className="flex-1 py-3 px-2 outline-none text-sm bg-transparent min-w-0" /></div>
              <button type="button" onClick={() => setAmount(String(Math.max(0, p?.available || 0)))} className="px-4 rounded-xl border text-xs font-bold">Max</button>
            </div></div>
          <button type="button" onClick={withdraw} disabled={busy === 'w' || !fin?.account || !amount} className="w-full h-12 rounded-xl bg-zinc-900 text-white font-black disabled:opacity-40">
            {busy === 'w' ? <Loader2 size={16} className="animate-spin mx-auto" /> : `Withdraw ${amount ? inr(amount) : ''}`}</button>
        </div>
      </Modal>
    </section>
  )
}

/* ───── Commission settings ───── */
function CommissionSettings({ settings, onChanged }) {
  const [f, setF] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (settings && !f) setF({ ...settings }) }, [settings]) // eslint-disable-line
  if (!f) return null
  const fields = [
    ['labourCommissionPercent', 'Live labour jobs commission', '%', 'Cut from every instant (live map) job'],
    ['serviceCommissionPercent', 'Scheduled service commission', '%', 'Cut from the service price, on top of the booking fee'],
    ['settlementHoldHours', 'Online earning hold', 'hours', 'Safety period before labour can withdraw'],
    ['maxCashDues', 'Max cash dues', '₹', 'Labour stops getting live jobs above this'],
    ['minPayout', 'Minimum withdrawal', '₹', 'For labour and company withdrawals'],
  ]
  const save = async () => {
    setBusy(true)
    try { const { data } = await axios.put('/api/admin/labour/settings', f); setF({ ...data.settings }); toast.success('Commission settings saved. Applies to jobs completed from now.'); onChanged?.() }
    catch (e) { toast.error(e.response?.data?.message || 'Could not save') } finally { setBusy(false) }
  }
  return (
    <section className={`${card} p-4 sm:p-5 space-y-3`}>
      <h2 className="font-black flex items-center gap-2"><Settings2 size={18} /> Commission settings</h2>
      {fields.map(([k, l, unit, hint]) => (
        <label key={k} className="block">
          <span className="text-xs font-bold">{l}</span>
          <div className="flex items-center border dark:border-zinc-700 rounded-xl px-3 mt-1 focus-within:border-zinc-900">
            {unit === '₹' && <IndianRupee size={13} className="text-zinc-400" />}
            <input value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value.replace(/[^\d.]/g, '') })} inputMode="decimal" className="flex-1 py-2.5 px-2 outline-none text-sm bg-transparent min-w-0" />
            {unit === '%' ? <Percent size={13} className="text-zinc-400" /> : unit === 'hours' ? <span className="text-xs text-zinc-400">hrs</span> : null}
          </div>
          <span className="text-[10px] text-zinc-400">{hint}</span>
        </label>
      ))}
      <button type="button" onClick={save} disabled={busy} className="w-full h-11 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <><Save size={15} /> Save settings</>}</button>
      <p className="text-[10px] text-zinc-400">Finished jobs keep the rate they were completed with.</p>
    </section>
  )
}

export default function AdminLabourMoney({ refreshKey, platform, settings, onChanged }) {
  return (
    <div className="grid xl:grid-cols-[1fr_380px] gap-5 items-start">
      <div className="space-y-5 min-w-0">
        <Wallets refreshKey={refreshKey} onChanged={onChanged} />
        <CompanyEarning platform={platform} refreshKey={refreshKey} onChanged={onChanged} />
      </div>
      <CommissionSettings settings={settings} onChanged={onChanged} />
    </div>
  )
}
