// components/Services/BookingWizard.jsx
'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, ArrowRight, Banknote, Building2, Check, ChevronLeft, ChevronRight, CreditCard, Loader2, Smartphone, Wallet } from 'lucide-react'
import { inr, fmtDate } from './ui'
import { payOnline } from './payment'
import { SLOTS, MAX_DAYS_AHEAD, istToday, istHour, addDays, slotHour24 } from '@/lib/serviceConfig'

const STEPS = [['Date & Time', 4], ['Address', 5], ['Review', 6], ['Payment', 7]]
const FLOW = { 0: 'Select Date & Time', 1: 'Add Address', 2: 'Review & Confirm', 3: 'Payment' }
const PAY = [
  { id: 'upi', t: 'UPI', s: 'Google Pay, PhonePe, Paytm, BHIM', I: Smartphone },
  { id: 'card', t: 'Cards', s: 'Credit / Debit card', I: CreditCard },
  { id: 'netbanking', t: 'Net Banking', s: 'All major banks', I: Building2 },
  { id: 'wallet', t: 'Wallets', s: 'Paytm, Amazon Pay, etc.', I: Wallet },
  { id: 'cash', t: 'Cash on Service', s: 'Pay the professional after the work', I: Banknote },
]
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const inp = 'w-full border border-zinc-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-[#0f7a55]'

function Calendar({ value, onChange }) {
  const today = istToday(), max = addDays(today, MAX_DAYS_AHEAD)
  const start = new Date(`${value || today}T00:00:00Z`)
  const [v, setV] = useState({ y: start.getUTCFullYear(), m: start.getUTCMonth() })
  const lead = new Date(Date.UTC(v.y, v.m, 1)).getUTCDay()
  const days = new Date(Date.UTC(v.y, v.m + 1, 0)).getUTCDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const ymd = (d) => `${v.y}-${String(v.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const step = (n) => setV((x) => { const d = new Date(Date.UTC(x.y, x.m + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() } })
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => step(-1)} aria-label="Previous month" className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center"><ChevronLeft size={16} /></button>
        <b className="text-sm">{MONTHS[v.m]} {v.y}</b>
        <button type="button" onClick={() => step(1)} aria-label="Next month" className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 mb-1">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const k = ymd(d), off = k < today || k > max, on = k === value
          return <button key={i} type="button" disabled={off} onClick={() => onChange(k)}
            className={`aspect-square rounded-lg text-sm font-semibold transition-colors ${on ? 'bg-[#0f7a55] text-white' : off ? 'text-zinc-300 cursor-not-allowed' : 'hover:bg-emerald-50'}`}>{d}</button>
        })}
      </div>
    </div>
  )
}

export default function BookingWizard({ providerId }) {
  const router = useRouter()
  const path = usePathname()
  const [d, setD] = useState(null)
  const [step, setStep] = useState(0)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [contact, setContact] = useState({ name: '', phone: '' })
  const [addr, setAddr] = useState({ full: '', landmark: '', city: 'Jaipur', pincode: '' })
  const [booking, setBooking] = useState(null)
  const [pay, setPay] = useState('upi')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { axios.get(`/api/services/providers/${providerId}`).then(({ data }) => setD(data)).catch(() => setErr('This service is not available.')) }, [providerId])

  const today = istToday()
  const slotOff = (s) => date === today && slotHour24(s) <= istHour()
  const guard = (e) => { if (e.response?.status === 401) { router.push(`/auth/login?callback=${encodeURIComponent(path)}`); return true } return false }

  const problem = useMemo(() => {
    if (step === 0) return !date ? 'Select a date' : !time ? 'Select a time slot' : ''
    if (step === 1) {
      if (contact.name.trim().length < 2) return 'Enter your name'
      if (!/^[6-9]\d{9}$/.test(contact.phone)) return 'Enter a valid 10 digit mobile number'
      if (addr.full.trim().length < 8) return 'Enter the full address'
      if (addr.city.trim().length < 2) return 'Enter the city'
      if (!/^\d{6}$/.test(addr.pincode)) return 'Enter a valid 6 digit PIN code'
    }
    return ''
  }, [step, date, time, contact, addr])

  const next = () => { if (problem) return setErr(problem); setErr(''); setStep((s) => s + 1) }

  const confirm = async () => {
    setBusy(true); setErr('')
    try {
      const { data } = await axios.post('/api/services/bookings', {
        providerId, slotDate: date, slotTime: time, contactName: contact.name, contactPhone: contact.phone, address: addr,
      })
      setBooking(data.booking); setStep(3)
    } catch (e) { if (!guard(e)) setErr(e.response?.data?.message || 'Could not create the booking') }
    finally { setBusy(false) }
  }

  const payNow = async () => {
    setBusy(true); setErr('')
    try {
      if (pay === 'cash') await axios.post(`/api/services/bookings/${booking._id}/pay`, { method: 'cash' })
      else await payOnline({ bookingId: booking._id, method: pay, prefill: { name: contact.name, contact: contact.phone } })
      router.push(`/services/booking/${booking._id}`)
    } catch (e) { if (!guard(e)) setErr(e.response?.data?.message || e.message || 'Payment failed'); setBusy(false) }
  }

  if (err && !d) return <div className="min-h-screen pt-40 text-center font-bold">{err}</div>
  if (!d) return <div className="min-h-screen pt-40 flex justify-center"><Loader2 className="animate-spin" /></div>
  const p = d.provider, q = booking || { price: d.quote.price, fee: d.quote.fee, total: d.quote.total }

  return (
    <div className="bg-[#f4f7f5] min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <p className="text-xs text-zinc-500 mb-3"><Link href="/services">Services</Link> &gt; <Link href={`/services/${p._id}`}>{p.name}</Link> &gt; <b>Book</b></p>

        {/* stepper */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-2">
          {STEPS.map(([l], i) => (
            <React.Fragment key={l}>
              <div className="flex items-center gap-2">
                <motion.span animate={{ scale: i === step ? 1.12 : 1 }} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i < step ? 'bg-[#0f7a55] text-white' : i === step ? 'bg-[#0f7a55] text-white ring-4 ring-emerald-100' : 'bg-zinc-200 text-zinc-500'}`}>{i < step ? <Check size={15} /> : i + 1}</motion.span>
                <span className={`hidden sm:block text-xs font-bold ${i <= step ? 'text-zinc-900' : 'text-zinc-400'}`}>{l}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-[#0f7a55]' : 'bg-zinc-200'}`} />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-center text-xs text-zinc-500 mb-5">Step {STEPS[step][1]} of 9 · {FLOW[step]}</p>

        <div className="grid md:grid-cols-[1fr_300px] gap-5">
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-7 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
                {step === 0 && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div><h2 className="font-black text-lg mb-3">Select Date</h2><Calendar value={date} onChange={(v) => { setDate(v); if (time && v === today && slotHour24(time) <= istHour()) setTime('') }} /></div>
                    <div><h2 className="font-black text-lg mb-3">Available Time Slots</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {SLOTS.map((s) => <button key={s} type="button" disabled={!date || slotOff(s)} onClick={() => setTime(s)}
                          className={`py-3 rounded-xl border text-sm font-bold transition-colors ${time === s ? 'bg-[#0f7a55] text-white border-[#0f7a55]' : 'border-zinc-200 hover:border-[#0f7a55] disabled:opacity-35 disabled:hover:border-zinc-200 disabled:cursor-not-allowed'}`}>{s}</button>)}
                      </div>
                      {!date && <p className="text-xs text-zinc-400 mt-3">Pick a date first.</p>}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="font-black text-lg">Service Address</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input className={inp} placeholder="Your name" value={contact.name} maxLength={60} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                      <input className={inp} placeholder="Mobile number" inputMode="numeric" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                    </div>
                    <input className={inp} placeholder="Full address (house no., street, area)*" value={addr.full} maxLength={200} onChange={(e) => setAddr({ ...addr, full: e.target.value })} />
                    <input className={inp} placeholder="Landmark (optional)" value={addr.landmark} maxLength={100} onChange={(e) => setAddr({ ...addr, landmark: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={inp} placeholder="City" value={addr.city} maxLength={40} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                      <input className={inp} placeholder="PIN code" inputMode="numeric" value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-black text-lg">Booking Summary</h2>
                    <div className="flex gap-4 items-center bg-zinc-50 rounded-2xl p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="w-20 h-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1"><b className="block truncate">{p.name}</b><span className="text-xs text-zinc-500">{p.category?.name}</span></div>
                      <b>{inr(q.price)}</b>
                    </div>
                    {[['Date & Time', `${fmtDate(date)}, ${time}`], ['Address', `${addr.full}${addr.landmark ? `, ${addr.landmark}` : ''}, ${addr.city} - ${addr.pincode}`], ['Contact', `${contact.name} · +91 ${contact.phone}`]].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 text-sm border-b pb-3"><span className="text-zinc-500">{k}</span><span className="font-semibold text-right">{v}</span></div>
                    ))}
                    <p className="text-xs text-zinc-500 bg-amber-50 border border-amber-100 rounded-xl p-3">Free cancellation before our professional is sent. Online payments are refunded automatically.</p>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <h2 className="font-black text-lg">Choose Payment Method</h2>
                    {PAY.map((o) => (
                      <button key={o.id} type="button" onClick={() => setPay(o.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${pay === o.id ? 'border-[#0f7a55] bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pay === o.id ? 'border-[#0f7a55]' : 'border-zinc-300'}`}>{pay === o.id && <span className="w-2.5 h-2.5 rounded-full bg-[#0f7a55]" />}</span>
                        <o.I size={20} className="text-zinc-500" />
                        <span className="flex-1"><b className="text-sm block">{o.t}</b><span className="text-xs text-zinc-500">{o.s}</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {err && <p className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm font-semibold"><AlertCircle size={15} />{err}</p>}

            <div className="flex justify-between mt-6">
              <button type="button" disabled={busy || step === 0 || (step === 3 && !!booking && false)} onClick={() => { setErr(''); setStep((s) => s - 1) }}
                className="flex items-center gap-2 border border-zinc-200 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-30"><ArrowLeft size={15} /> Back</button>
              {step < 2 && <button type="button" onClick={next} className="flex items-center gap-2 bg-[#0f7a55] hover:bg-[#0c6a4a] text-white px-7 py-3 rounded-xl text-sm font-black">Continue <ArrowRight size={15} /></button>}
              {step === 2 && <button type="button" onClick={confirm} disabled={busy} className="flex items-center gap-2 bg-[#0f7a55] hover:bg-[#0c6a4a] text-white px-7 py-3 rounded-xl text-sm font-black disabled:opacity-50">{busy ? <Loader2 size={16} className="animate-spin" /> : <>Confirm Booking <ArrowRight size={15} /></>}</button>}
              {step === 3 && <button type="button" onClick={payNow} disabled={busy} className="flex items-center gap-2 bg-[#0f7a55] hover:bg-[#0c6a4a] text-white px-7 py-3 rounded-xl text-sm font-black disabled:opacity-50">{busy ? <Loader2 size={16} className="animate-spin" /> : pay === 'cash' ? 'Confirm Booking' : `Pay ${inr(q.total)}`}</button>}
            </div>
          </div>

          <aside className="bg-white border border-zinc-200 rounded-3xl p-5 h-fit space-y-3">
            <h3 className="font-black">Price Details</h3>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Service charge</span><b>{inr(q.price)}</b></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Platform fee</span><b>{inr(q.fee)}</b></div>
            <div className="flex justify-between border-t pt-3"><b>Total Amount</b><b className="text-lg">{inr(q.total)}</b></div>
          </aside>
        </div>
      </div>
    </div>
  )
}