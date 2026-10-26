'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Banknote, CheckCircle, IndianRupee, Loader2, ShieldCheck, Wallet } from 'lucide-react'
import { CATEGORY_EMOJI, CATEGORY_LABEL } from './categoryMeta'

const OPTIONS = [
  { id: 'online', Icon: Wallet, title: 'Online Payment', sub: 'UPI · Card · Netbanking. Refunded if you cancel' },
  { id: 'cash', Icon: Banknote, title: 'Cash', sub: 'Pay the labour directly after the work' },
]

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

export default function PaymentChooser({ booking }) {
  const router = useRouter()
  const [method, setMethod] = useState('online')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const lab = booking?.labour
  const go = () => router.push(`/user/booking/${booking._id}`)

  const proceed = async () => {
    if (loading) return
    setLoading(true); setErr('')
    try {
      if (method === 'cash') {
        await axios.post(`/api/booking/${booking._id}/payment-method`, { method: 'cash' })
        return go()
      }
      if (!(await loadRazorpay())) throw new Error('Payment window could not load. Check your internet.')
      const { data } = await axios.post('/api/payment/create', { bookingId: booking._id })

      const rz = new window.Razorpay({
        key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.orderId,
        name: 'Constructezy', description: 'Labour booking', theme: { color: '#09090b' },
        handler: async (res) => {
          try {
            await axios.post('/api/payment/verify', { bookingId: booking._id, ...res })
          } catch {
            // the webhook will confirm it; the tracking page shows the final state
          }
          go()
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rz.on('payment.failed', (r) => { setErr(r?.error?.description || 'Payment failed. Try again.'); setLoading(false) })
      rz.open()
    } catch (e) {
      setErr(e.response?.data?.message || e.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
        <CheckCircle className="text-emerald-600 shrink-0" size={22} />
        <div className="min-w-0">
          <p className="text-sm font-black text-emerald-800">
            {CATEGORY_EMOJI[booking.category]} {CATEGORY_LABEL[booking.category] || 'Labour'} accepted your request
          </p>
          {lab && (
            <p className="text-xs text-emerald-700">
              {lab.experienceYears} yrs experience · {lab.rating ? `★ ${Number(lab.rating).toFixed(1)}` : 'New'}
              {lab.isVerified && ' · Verified'}
            </p>
          )}
        </div>
      </motion.div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">Almost there</p>
        <h3 className="text-2xl font-black text-zinc-900">Select Payment Method</h3>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((o, i) => {
          const active = method === o.id
          return (
            <motion.button key={o.id} type="button" onClick={() => setMethod(o.id)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${active ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-white/10' : 'bg-zinc-200'}`}>
                <o.Icon size={18} className={active ? 'text-white' : 'text-zinc-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${active ? 'text-white' : 'text-zinc-900'}`}>{o.title}</p>
                <p className="text-xs text-zinc-400">{o.sub}</p>
              </div>
              {active && <CheckCircle size={18} className="text-white shrink-0" />}
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total</span>
        <span className="text-2xl font-black text-zinc-900 flex items-center"><IndianRupee size={18} />{Number(booking.fare).toLocaleString('en-IN')}</span>
      </div>

      {err && <p className="flex items-center gap-1.5 text-red-500 text-xs font-semibold"><AlertCircle size={14} />{err}</p>}

      <button type="button" onClick={proceed} disabled={loading}
        className="w-full h-14 mt-auto bg-zinc-900 hover:bg-black disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-md">
        {loading ? <Loader2 className="animate-spin" size={17} /> : method === 'cash'
          ? <><Banknote size={16} /> Confirm Cash Payment</>
          : <><span>Proceed to Payment</span><ArrowRight size={16} /></>}
      </button>
      <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5"><ShieldCheck size={13} /> Payments are secured by Razorpay</p>
    </div>
  )
}