// components/Services/BookingConfirmed.jsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Badge } from './Badge'
import { STATUS_UI, PAY_UI, inr, fmtDate } from './ui'

export default function BookingConfirmed({ id }) {
  const router = useRouter()
  const [b, setB] = useState(null)

  useEffect(() => {
    let tries = 0, t
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/services/bookings/${id}`)
        setB(data.booking)
        // the payment webhook may still be confirming it
        if (data.booking.status === 'pending_payment' && data.booking.paymentMethod === 'online' && ++tries < 5) t = setTimeout(load, 3000)
      } catch (e) { if (e.response?.status === 401) router.push('/auth/login'); else setB(false) }
    }
    load()
    return () => clearTimeout(t)
  }, [id, router])

  if (b === false) return <div className="min-h-screen pt-40 text-center font-bold">Booking not found</div>
  if (!b) return <div className="min-h-screen pt-40 flex justify-center"><Loader2 className="animate-spin" /></div>
  const ok = b.status !== 'pending_payment' && b.status !== 'cancelled'

  return (
    <div className="bg-[#f4f7f5] min-h-screen pt-28 pb-16 px-3">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }}
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${ok ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          {ok ? <CheckCircle2 size={46} className="text-[#0f7a55]" /> : <AlertCircle size={46} className="text-amber-500" />}
        </motion.div>
        <h1 className="text-2xl font-black mt-4">{ok ? 'Booking Confirmed!' : b.status === 'cancelled' ? 'Booking cancelled' : 'Payment not completed'}</h1>
        <p className="text-sm text-zinc-500 mt-1">{ok ? 'Our team will confirm and send a verified professional at your slot.' : 'Your booking is on hold. Complete the payment from My Bookings.'}</p>

        <div className="mt-6 text-left border border-zinc-200 rounded-2xl p-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-zinc-500">Booking ID</span><b>#{b.code}</b></div>
          <div className="flex justify-between"><span className="text-zinc-500">Status</span><Badge map={STATUS_UI} k={b.status} /></div>
          <div className="flex justify-between"><span className="text-zinc-500">Service</span><b>{b.categoryName} · {b.providerName}</b></div>
          <div className="flex justify-between"><span className="text-zinc-500">Date & Time</span><b>{fmtDate(b.slotDate)}, {b.slotTime}</b></div>
          <div className="flex justify-between gap-4"><span className="text-zinc-500">Address</span><b className="text-right">{b.address.full}, {b.address.city} - {b.address.pincode}</b></div>
          <div className="flex justify-between items-center"><span className="text-zinc-500">Payment</span><span className="flex items-center gap-2"><span className="capitalize font-semibold">{b.paymentMethod || '—'}</span><Badge map={PAY_UI} k={b.paymentStatus} /></span></div>
          <div className="flex justify-between border-t pt-3"><b>Total</b><b className="text-lg">{inr(b.total)}</b></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <Link href="/services/my-bookings" className="bg-[#0f7a55] text-white font-black py-3 rounded-xl">Track Booking</Link>
          <Link href="/services" className="border border-zinc-300 font-bold py-3 rounded-xl">Book another service</Link>
        </div>
      </motion.div>
    </div>
  )
}