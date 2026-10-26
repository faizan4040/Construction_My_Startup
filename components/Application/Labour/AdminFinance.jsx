'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { IndianRupee, Loader2 } from 'lucide-react'
import PayoutAccountForm from './PayoutAccountForm'
import useAdminLive from './useAdminLive'

const inr = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`
const ST = { requested: 'bg-amber-100 text-amber-700', approved: 'bg-blue-100 text-blue-700', processing: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', failed: 'bg-red-100 text-red-700' }

function Card({ label, value, sub, dark }) {
  return (
    <div className={`rounded-2xl p-4 border ${dark ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 border-zinc-100'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-zinc-400' : 'text-zinc-400'}`}>{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${dark ? 'text-zinc-400' : 'text-zinc-400'}`}>{sub}</p>}
    </div>
  )
}

export default function AdminFinance() {
  const [d, setD] = useState(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const timer = useRef(null)

  const load = useCallback(async () => {
    try { const { data } = await axios.get('/api/admin/labour/finance'); setD(data) } catch (e) { console.log(e) }
  }, [])
  useEffect(() => { load() }, [load])
  useAdminLive(() => { clearTimeout(timer.current); timer.current = setTimeout(load, 600) })

  const act = async (id, action, extra = {}) => {
    setBusy(id + action); setMsg('')
    try { await axios.post(`/api/admin/labour/payouts/${id}`, { action, ...extra }); await load() }
    catch (e) { setMsg(e.response?.data?.message || 'Action failed') } finally { setBusy('') }
  }
  const markPaid = (id) => { const utr = window.prompt('Enter the bank UTR / reference after you transferred the money'); if (utr) act(id, 'mark_paid', { utr }) }

  const withdraw = async () => {
    setBusy('withdraw'); setMsg('')
    try { const { data } = await axios.post('/api/admin/labour/withdraw', { amount: Number(amount) }); setAmount(''); setMsg(data.manual ? 'Withdrawal recorded. Transfer manually and mark paid.' : 'Withdrawal sent to RazorpayX.'); await load() }
    catch (e) { setMsg(e.response?.data?.message || 'Could not withdraw') } finally { setBusy('') }
  }

  if (!d) return <section className="bg-white rounded-3xl border shadow-lg p-10 flex justify-center"><Loader2 className="animate-spin" /></section>
  const p = d.platform

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-black text-zinc-900">Finance & Payouts</h2>
        <p className="text-xs text-zinc-400 mt-1">{d.razorpayX ? 'RazorpayX payouts are ON' : 'RazorpayX is OFF: approve a payout, transfer from your bank, then mark it paid with the UTR'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card dark label="Available to withdraw" value={inr(p.available)} sub="Online commission collected" />
        <Card label="Online commission" value={inr(p.online)} sub={`Withdrawn ${inr(p.withdrawn)}`} />
        <Card label="Cash commission due" value={inr(p.cashReceivable)} sub={`Labour owes ${inr(d.labour.dues)}`} />
        <Card label="Labour payable" value={inr(d.labour.payable)} sub="Earned, not yet withdrawn" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-sm font-black">Your bank account (for withdrawals)</p>
          <PayoutAccountForm account={d.account} onSaved={(a) => setD((x) => ({ ...x, account: a }))} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-black">Withdraw platform earnings</p>
          <div className="flex gap-2">
            <div className="flex items-center flex-1 border border-zinc-200 rounded-xl px-3 focus-within:border-zinc-900">
              <IndianRupee size={14} className="text-zinc-400" />
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="Amount" inputMode="numeric" className="flex-1 py-3 px-2 outline-none text-sm" />
            </div>
            <button type="button" onClick={() => setAmount(String(Math.max(0, p.available)))} className="px-4 rounded-xl border text-xs font-bold">Max</button>
            <button type="button" onClick={withdraw} disabled={busy === 'withdraw' || !d.account || !amount} className="px-6 rounded-xl bg-zinc-900 text-white font-bold text-sm disabled:opacity-40">
              {busy === 'withdraw' ? <Loader2 size={16} className="animate-spin" /> : 'Withdraw'}
            </button>
          </div>
          <p className="text-[11px] text-zinc-400">Commission already settles to your Razorpay-linked bank automatically. This records and sends the withdrawal.</p>
        </div>
      </div>
      {msg && <p className="text-sm font-semibold text-zinc-700 bg-zinc-50 border rounded-xl px-4 py-3">{msg}</p>}

      <div className="overflow-x-auto rounded-2xl border border-zinc-100">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400">
            <tr>{['Date', 'Who', 'Bank', 'Amount', 'Status', 'Action'].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {d.payouts.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-zinc-400">No payout requests.</td></tr>}
            {d.payouts.map((r) => (
              <tr key={r._id} className="border-t border-zinc-100 text-sm align-top">
                <td className="px-4 py-3 text-xs text-zinc-500">{new Date(r.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-3"><p className="font-semibold">{r.ownerName}</p><p className="text-[11px] text-zinc-400 capitalize">{r.ownerType}</p></td>
                <td className="px-4 py-3 text-xs">{r.account?.holderName}<br />••••{r.account?.last4} · {r.account?.ifsc}</td>
                <td className="px-4 py-3 font-black">{inr(r.amount)}</td>
                <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${ST[r.status]}`}>{r.status}</span>
                  {r.utr && <p className="text-[10px] text-zinc-400 mt-1">UTR {r.utr}</p>}{r.failureReason && <p className="text-[10px] text-red-500 mt-1">{r.failureReason}</p>}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {r.status === 'requested' && <>
                    <button disabled={!!busy} onClick={() => act(r._id, 'approve')} className="text-xs font-bold bg-zinc-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-40">Approve</button>
                    <button disabled={!!busy} onClick={() => act(r._id, 'reject')} className="text-xs font-bold border px-3 py-1.5 rounded-lg disabled:opacity-40">Reject</button></>}
                  {r.status === 'approved' && r.method === 'manual' && <button disabled={!!busy} onClick={() => markPaid(r._id)} className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-40">Mark paid</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}