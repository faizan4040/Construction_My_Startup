'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { CheckCircle2, Landmark, Loader2 } from 'lucide-react'

export default function PayoutAccountForm({ account, onSaved }) {
  const [editing, setEditing] = useState(!account)
  const [f, setF] = useState({ holderName: '', accountNumber: '', confirm: '', ifsc: '', upiId: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (f.accountNumber !== f.confirm) return setErr('Account numbers do not match')
    setBusy(true); setErr('')
    try {
      const { data } = await axios.post('/api/payout-account', f)
      setEditing(false); onSaved?.(data.account)
    } catch (e) { setErr(e.response?.data?.message || 'Could not save') } finally { setBusy(false) }
  }

  if (!editing && account) return (
    <div className="flex items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
      <div className="flex items-center gap-3 min-w-0">
        <Landmark className="text-zinc-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{account.holderName}</p>
          <p className="text-xs text-zinc-500">A/c ••••{account.last4} · {account.ifsc}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${account.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {account.status === 'verified' ? <><CheckCircle2 size={10} className="inline mr-1" />Verified</> : 'Pending verification'}
        </span>
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-bold underline">Change</button>
      </div>
    </div>
  )

  const input = 'w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-zinc-900'
  return (
    <div className="space-y-3">
      <input className={input} placeholder="Account holder name" value={f.holderName} onChange={set('holderName')} />
      <input className={input} placeholder="Account number" inputMode="numeric" value={f.accountNumber} onChange={(e) => setF((p) => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))} />
      <input className={input} placeholder="Confirm account number" inputMode="numeric" value={f.confirm} onChange={(e) => setF((p) => ({ ...p, confirm: e.target.value.replace(/\D/g, '') }))} />
      <input className={input} placeholder="IFSC (e.g. SBIN0001234)" value={f.ifsc} onChange={(e) => setF((p) => ({ ...p, ifsc: e.target.value.toUpperCase() }))} maxLength={11} />
      <input className={input} placeholder="UPI id (optional)" value={f.upiId} onChange={set('upiId')} />
      {err && <p className="text-red-500 text-xs font-semibold">{err}</p>}
      <div className="flex gap-2">
        {account && <button type="button" onClick={() => setEditing(false)} className="flex-1 h-11 rounded-xl border border-zinc-200 font-bold text-sm">Cancel</button>}
        <button type="button" onClick={save} disabled={busy} className="flex-1 h-11 rounded-xl bg-zinc-900 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center">
          {busy ? <Loader2 size={16} className="animate-spin" /> : 'Save bank account'}
        </button>
      </div>
      <p className="text-[11px] text-zinc-400">Your account number is stored encrypted and is never shown again.</p>
    </div>
  )
}