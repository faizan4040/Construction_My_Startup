// components/Application/Labour/PartnerWallet.jsx
'use client'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownLeft, ArrowUpRight, IndianRupee, Loader2 } from 'lucide-react'
import BackButton from './BackButton'
import PayoutAccountForm from './PayoutAccountForm'

const inr = (n) => Math.round(n || 0).toLocaleString('en-IN')
const LABEL = {
  labour_credit: 'Job earning (online)', cash_commission_due: 'Platform fee (cash job)',
  payout_debit: 'Withdrawal', payout_reversal: 'Withdrawal returned',
}
const PST = { requested: 'bg-amber-100 text-amber-700', approved: 'bg-blue-100 text-blue-700', processing: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', failed: 'bg-red-100 text-red-700' }

export default function PartnerWallet() {
  const [w, setW] = useState(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const load = useCallback(async () => {
    try { const { data } = await axios.get('/api/partner/wallet'); setW(data) } catch (e) { console.log(e) }
  }, [])
  useEffect(() => { load() }, [load])

  const withdraw = async () => {
    setBusy(true); setMsg({ type: '', text: '' })
    try {
      await axios.post('/api/partner/payout', { amount: Number(amount) })
      setAmount(''); setMsg({ type: 'ok', text: 'Withdrawal requested. You will be paid after approval.' }); load()
    } catch (e) { setMsg({ type: 'err', text: e.response?.data?.message || 'Could not request withdrawal' }) } finally { setBusy(false) }
  }

  if (!w) return <div className="min-h-screen flex items-center justify-center bg-zinc-100"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#f4f5f7] pt-28 sm:pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4"><BackButton href="/partner/dashboard" /><h1 className="text-3xl font-black">My Wallet</h1></div>

        <div className="grid sm:grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 text-white rounded-3xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Available</p>
            <p className="text-3xl font-black flex items-center"><IndianRupee size={22} />{inr(Math.max(0, w.available))}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border rounded-3xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Settling (hold)</p>
            <p className="text-3xl font-black flex items-center"><IndianRupee size={22} />{inr(w.pending)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-3xl p-5 border ${w.dues > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Cash dues</p>
            <p className={`text-3xl font-black flex items-center ${w.dues > 0 ? 'text-red-600' : ''}`}><IndianRupee size={22} />{inr(w.dues)}</p>
          </motion.div>
        </div>

        {w.dues > 0 && (
          <p className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            Platform fee on cash jobs is owed. It is deducted from your next online earnings. New requests stop above ₹{inr(w.maxDues)}.
          </p>
        )}

        <section className="bg-white border rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-black">Bank account</h2>
          <PayoutAccountForm account={w.account} onSaved={(a) => setW((p) => ({ ...p, account: a }))} />
        </section>

        <section className="bg-white border rounded-3xl p-6 space-y-3">
          <h2 className="text-lg font-black">Withdraw</h2>
          <div className="flex gap-2">
            <div className="flex items-center flex-1 border border-zinc-200 rounded-xl px-3 focus-within:border-zinc-900">
              <IndianRupee size={14} className="text-zinc-400" />
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder={`Min ${w.minPayout}`} className="flex-1 py-3 px-2 outline-none text-sm" />
            </div>
            <button type="button" onClick={() => setAmount(String(Math.max(0, w.available)))} className="px-4 rounded-xl border border-zinc-200 text-xs font-bold">Max</button>
            <button type="button" onClick={withdraw} disabled={busy || !w.account || !amount} className="px-6 rounded-xl bg-zinc-900 text-white font-bold text-sm disabled:opacity-40">
              {busy ? <Loader2 size={16} className="animate-spin" /> : 'Withdraw'}
            </button>
          </div>
          {!w.account && <p className="text-xs text-amber-600">Add your bank account first.</p>}
          {msg.text && <p className={`text-xs font-semibold ${msg.type === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>{msg.text}</p>}
        </section>

        {w.payouts.length > 0 && (
          <section className="bg-white border rounded-3xl p-6">
            <h2 className="text-lg font-black mb-3">Withdrawals</h2>
            <div className="divide-y">
              {w.payouts.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between text-sm">
                  <div><p className="font-bold">₹{inr(p.amount)}</p><p className="text-xs text-zinc-400">{new Date(p.createdAt).toLocaleDateString('en-IN')}{p.utr && ` · UTR ${p.utr}`}</p></div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${PST[p.status]}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white border rounded-3xl p-6">
          <h2 className="text-lg font-black mb-3">History</h2>
          {w.entries.length === 0 ? <p className="text-sm text-zinc-400">No transactions yet.</p> : (
            <div className="divide-y">
              {w.entries.map((e) => (
                <div key={e._id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${e.amount >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {e.amount >= 0 ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span>
                    <div><p className="font-semibold">{LABEL[e.type] || e.type}</p>
                      <p className="text-xs text-zinc-400">{new Date(e.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {new Date(e.availableAt) > new Date() && ' · on hold'}</p></div>
                  </div>
                  <p className={`font-black ${e.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{e.amount >= 0 ? '+' : '−'}₹{inr(Math.abs(e.amount))}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}