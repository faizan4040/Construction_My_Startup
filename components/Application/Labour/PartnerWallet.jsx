'use client'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  AlertTriangle, ArrowDownLeft, ArrowUpRight, Banknote, CheckCircle2, Clock, IndianRupee, Info, Landmark, Loader2, Repeat, ShieldCheck,
} from 'lucide-react'
import { connectSocket } from '@/lib/socket-client'
import BackButton from './BackButton'
import PayoutAccountForm from './PayoutAccountForm'
import { CATEGORY_LABEL } from './categoryMeta'

const inr = (n) => Math.round(n || 0).toLocaleString('en-IN')
const LABEL = {
  labour_credit: 'Job earning (online)',
  cash_commission_due: 'Platform fee · cash job',
  dues_payment: 'Dues paid online',
  dues_settlement: 'Dues settled by admin',
  payout_debit: 'Withdrawal to bank',
  payout_reversal: 'Withdrawal returned',
}
const PST = {
  requested: ['Requested', 'bg-amber-100 text-amber-700'], approved: ['Approved', 'bg-blue-100 text-blue-700'],
  processing: ['Processing', 'bg-blue-100 text-blue-700'], paid: ['Sent to bank', 'bg-emerald-100 text-emerald-700'],
  rejected: ['Rejected', 'bg-red-100 text-red-700'], failed: ['Failed', 'bg-red-100 text-red-700'],
}
const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true)
  const s = document.createElement('script')
  s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = () => resolve(true); s.onerror = () => resolve(false)
  document.body.appendChild(s)
})

export default function PartnerWallet() {
  const [w, setW] = useState(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState('')
  const [tab, setTab] = useState('all')

  const load = useCallback(async () => {
    try { const { data } = await axios.get('/api/partner/wallet'); setW(data) } catch (e) { console.log(e) }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const s = connectSocket()
    const r = () => load()
    s.on('wallet-update', r); s.on('booking-update', r); s.on('service-job-update', r)
    return () => { s.off('wallet-update', r); s.off('booking-update', r); s.off('service-job-update', r) }
  }, [load])

  const withdraw = async () => {
    setBusy('withdraw')
    try {
      await axios.post('/api/partner/payout', { amount: Number(amount) })
      setAmount(''); toast.success('Withdrawal requested. Money reaches your bank after admin approval.'); await load()
    } catch (e) { toast.error(e.response?.data?.message || 'Could not withdraw') } finally { setBusy('') }
  }

  const payDues = async () => {
    setBusy('dues')
    try {
      if (!(await loadRazorpay())) throw new Error('Payment window could not load. Check your internet.')
      const { data } = await axios.post('/api/partner/dues/pay', {})
      const rz = new window.Razorpay({
        key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.orderId,
        name: 'Constructezy', description: 'Platform fee dues', theme: { color: '#09090b' },
        handler: async (res) => {
          try { await axios.post('/api/partner/dues/verify', res); toast.success('Dues paid. Thank you!') }
          catch { toast.info('Payment received. It will reflect in a moment.') }
          setBusy(''); load()
        },
        modal: { ondismiss: () => setBusy('') },
      })
      rz.on('payment.failed', (r) => { toast.error(r?.error?.description || 'Payment failed'); setBusy('') })
      rz.open()
    } catch (e) { toast.error(e.response?.data?.message || e.message || 'Could not start payment'); setBusy('') }
  }

  if (!w) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-zinc-400" /></div>

  const canWithdraw = w.account && w.dues === 0 && w.withdrawable >= w.minPayout
  const entries = w.entries.filter((e) => tab === 'all' || (tab === 'in' ? e.amount > 0 : e.amount < 0))

  return (
    <div className="min-h-screen bg-[#f4f5f7] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3"><BackButton href="/partner/dashboard" /><h1 className="text-2xl sm:text-3xl font-black">My Wallet</h1></div>

        {/* balance hero */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Available to withdraw</p>
          <p className="text-5xl font-black mt-1 flex items-center"><IndianRupee size={36} />{inr(w.withdrawable)}</p>
          <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
            <div className="bg-white/5 rounded-2xl p-3"><p className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1"><Clock size={11} />On hold</p><p className="font-black text-lg">₹{inr(w.pending)}</p><p className="text-[10px] text-zinc-500">{w.holdHours}h safety period</p></div>
            <div className="bg-white/5 rounded-2xl p-3"><p className="text-[10px] text-zinc-400 uppercase font-bold">Earned online</p><p className="font-black text-lg">₹{inr(w.earnedOnline)}</p></div>
            <div className="bg-white/5 rounded-2xl p-3"><p className="text-[10px] text-zinc-400 uppercase font-bold">Withdrawn</p><p className="font-black text-lg">₹{inr(w.withdrawn)}</p></div>
          </div>
        </motion.section>

        {/* dues */}
        {w.dues > 0 ? (
          <section className="bg-white border-2 border-red-200 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0"><AlertTriangle size={20} /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-600">Platform fee due</p>
                  <p className="text-3xl font-black text-zinc-900">₹{inr(w.dues)}</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-md">From cash jobs ({w.commissionPercent}% fee). Your next online earnings will clear it automatically, or pay now.
                    {w.dues > w.maxDues && <b className="text-red-600"> Above ₹{inr(w.maxDues)} you stop getting live jobs.</b>}</p>
                </div>
              </div>
              <button type="button" onClick={payDues} disabled={busy === 'dues'} className="h-12 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black flex items-center gap-2 disabled:opacity-50">
                {busy === 'dues' ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Pay ₹{inr(w.dues)} online
              </button>
            </div>
          </section>
        ) : (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3 text-sm font-semibold"><CheckCircle2 size={18} /> No dues. You're all clear.</div>
        )}

        {/* how the cash fee was covered */}
        {w.cashCommission > 0 && (
          <section className="bg-white border border-zinc-200/70 rounded-3xl p-5">
            <h2 className="font-black text-sm flex items-center gap-2 mb-3"><Repeat size={16} /> Cash job fees</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><p className="text-[10px] uppercase font-bold text-zinc-400">Total fee (cash jobs)</p><p className="font-black text-lg">₹{inr(w.cashCommission)}</p></div>
              <div><p className="text-[10px] uppercase font-bold text-zinc-400">Auto-adjusted from online</p><p className="font-black text-lg text-emerald-700">₹{inr(w.adjustedFromOnline)}</p></div>
              <div><p className="text-[10px] uppercase font-bold text-zinc-400">Paid by you</p><p className="font-black text-lg">₹{inr(w.duesPaid)}</p></div>
              <div><p className="text-[10px] uppercase font-bold text-zinc-400">Still due</p><p className={`font-black text-lg ${w.dues ? 'text-red-600' : ''}`}>₹{inr(w.dues)}</p></div>
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-2 gap-5">
          {/* bank */}
          <section className="bg-white border border-zinc-200/70 rounded-3xl p-5 space-y-3">
            <h2 className="font-black flex items-center gap-2"><Landmark size={18} /> Bank account</h2>
            <PayoutAccountForm account={w.account} onSaved={(a) => { setW((x) => ({ ...x, account: a })); toast.success('Bank account saved') }} />
          </section>

          {/* withdraw */}
          <section className="bg-white border border-zinc-200/70 rounded-3xl p-5 space-y-3">
            <h2 className="font-black flex items-center gap-2"><ArrowUpRight size={18} /> Withdraw to bank</h2>
            <div className="flex gap-2">
              <div className="flex items-center flex-1 border border-zinc-200 rounded-xl px-3 focus-within:border-zinc-900">
                <IndianRupee size={14} className="text-zinc-400" />
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} placeholder={`Min ₹${w.minPayout}`} inputMode="numeric" className="flex-1 py-3 px-2 outline-none text-sm min-w-0" />
              </div>
              <button type="button" onClick={() => setAmount(String(w.withdrawable))} className="px-4 rounded-xl border text-xs font-bold">Max</button>
            </div>
            <button type="button" onClick={withdraw} disabled={!canWithdraw || !amount || Number(amount) < w.minPayout || busy === 'withdraw'}
              className="w-full h-12 rounded-xl bg-zinc-900 text-white font-black disabled:opacity-40 flex items-center justify-center">
              {busy === 'withdraw' ? <Loader2 size={16} className="animate-spin" /> : 'Request withdrawal'}
            </button>
            <p className="text-[11px] text-zinc-500 flex gap-1.5"><Info size={12} className="shrink-0 mt-0.5" />
              {!w.account ? 'Add your bank account first.' : w.dues > 0 ? 'Clear your dues before withdrawing.' : w.withdrawable < w.minPayout ? `You need at least ₹${w.minPayout} to withdraw.` : 'Admin approves and transfers to your bank (IMPS/UPI).'}
            </p>

            {w.payouts.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Recent withdrawals</p>
                {w.payouts.map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm border-b border-zinc-100 pb-2 last:border-0">
                    <div><p className="font-black">₹{inr(p.amount)}</p><p className="text-[11px] text-zinc-400">{fmt(p.createdAt)}{p.utr && ` · UTR ${p.utr}`}</p>
                      {p.failureReason && <p className="text-[11px] text-red-500">{p.failureReason}</p>}</div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${PST[p.status]?.[1]}`}>{PST[p.status]?.[0] || p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* transactions */}
        <section className="bg-white border border-zinc-200/70 rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h2 className="font-black">Transactions</h2>
            <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-bold">
              {[['all', 'All'], ['in', 'Money in'], ['out', 'Money out']].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-lg ${tab === k ? 'bg-white shadow' : 'text-zinc-500'}`}>{l}</button>
              ))}
            </div>
          </div>
          {entries.length === 0 ? <p className="text-sm text-zinc-400 py-8 text-center">No transactions yet.</p> : (
            <div className="divide-y divide-zinc-100">
              {entries.map((e) => (
                <div key={e._id} className="flex items-center gap-3 py-3">
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${e.amount >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {e.type === 'cash_commission_due' ? <Banknote size={17} /> : e.amount >= 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{LABEL[e.type] || e.type}</p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {e.job ? `${e.job.kind === 'live' ? CATEGORY_LABEL[e.job.label] || e.job.label : e.job.label} · job ₹${inr(e.job.fare)} · ` : ''}{fmt(e.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${e.amount >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{e.amount >= 0 ? '+' : '−'}₹{inr(Math.abs(e.amount))}</p>
                    {e.onHold && <p className="text-[10px] font-bold text-amber-600">on hold till {new Date(e.availableAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
