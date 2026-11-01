// components/Services/ServiceDetail.jsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { BadgeCheck, Briefcase, CheckCircle2, Clock, Loader2, ShieldCheck, Truck } from 'lucide-react'
import { Stars } from './Badge'
import { inr, fmtDT } from './ui'

const TABS = [['inc', "What's Included"], ['proc', 'Service Process'], ['rev', 'Ratings & Reviews']]

export default function ServiceDetail({ id }) {
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState('inc')

  useEffect(() => {
    axios.get(`/api/services/providers/${id}`).then(({ data }) => setD(data)).catch(() => setErr('This service is not available.'))
  }, [id])

  if (err) return <div className="min-h-screen pt-40 text-center"><p className="font-bold">{err}</p><Link href="/services" className="underline text-emerald-700">Back to services</Link></div>
  if (!d) return <div className="min-h-screen pt-40 flex justify-center"><Loader2 className="animate-spin" /></div>
  const { provider: p, quote, reviews } = d

  return (
    <div className="bg-[#f7f6f3] min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <p className="text-xs text-zinc-500 mb-3"><Link href="/">Home</Link> &gt; <Link href="/services">Services</Link> &gt; {p.category && <Link href={`/services?category=${p.category.slug}`}>{p.category.name}</Link>} &gt; <b>{p.name}</b></p>
        <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 grid md:grid-cols-[320px_1fr_260px] gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={p.name} className="w-full aspect-square md:aspect-auto md:h-72 object-cover rounded-2xl" />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black">{p.name}</h1>
            <div className="flex items-center gap-2 mt-2"><Stars value={p.rating} size={16} /><b>{p.rating ? p.rating.toFixed(1) : 'New'}</b><span className="text-xs text-zinc-400">({p.reviewCount} reviews)</span></div>
            <p className="text-sm text-zinc-600 mt-3">{p.description || p.headline}</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold">
              {p.isVerified && <li className="flex items-center gap-2 text-emerald-700"><BadgeCheck size={16} /> Verified Professional</li>}
              <li className="flex items-center gap-2"><Briefcase size={16} className="text-zinc-400" /> {p.experienceYears}+ years experience</li>
              <li className="flex items-center gap-2"><Clock size={16} className="text-zinc-400" /> {p.responseText}</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-zinc-400" /> Service warranty</li>
            </ul>
          </div>
          <div className="border border-zinc-200 rounded-2xl p-4 h-fit">
            <p className="text-xs text-zinc-400">Starting at</p>
            <p className="text-3xl font-black">{inr(p.startingPrice)}</p>
            <p className="text-[11px] text-zinc-400 mb-3">per {p.priceUnit} · + {inr(quote.fee)} platform fee</p>
            <Link href={`/services/book/${p._id}`} className="block text-center bg-[#0f7a55] hover:bg-[#0c6a4a] text-white font-black py-3 rounded-xl">Book Now</Link>
            <p className="text-[11px] text-zinc-400 mt-3 flex items-center gap-1.5"><Truck size={12} /> {p.jobsDone} jobs completed</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl mt-5 p-4 sm:p-6">
          <div className="flex gap-6 border-b mb-4 overflow-x-auto">
            {TABS.map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 -mb-px ${tab === k ? 'border-[#0f7a55] text-[#0f7a55]' : 'border-transparent text-zinc-500'}`}>{l}</button>)}
          </div>
          {tab === 'inc' && (p.inclusions.length ? <ul className="grid sm:grid-cols-2 gap-2">{p.inclusions.map((x) => <li key={x} className="flex items-start gap-2 text-sm"><CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />{x}</li>)}</ul> : <p className="text-sm text-zinc-400">Details will be shared by our team.</p>)}
          {tab === 'proc' && (p.process.length ? <ol className="space-y-3">{p.process.map((x, i) => <li key={x} className="flex gap-3 text-sm"><span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-black flex items-center justify-center shrink-0">{i + 1}</span>{x}</li>)}</ol> : <p className="text-sm text-zinc-400">Book, we confirm, and our professional arrives at your slot.</p>)}
          {tab === 'rev' && (reviews.length ? <div className="divide-y">{reviews.map((r) => <div key={r._id} className="py-3"><div className="flex items-center gap-2"><b className="text-sm">{r.userName}</b><Stars value={r.rating} /><span className="text-[11px] text-zinc-400">{fmtDT(r.createdAt)}</span></div>{r.comment && <p className="text-sm text-zinc-600 mt-1">{r.comment}</p>}</div>)}</div> : <p className="text-sm text-zinc-400">No reviews yet. Be the first after your service.</p>)}
        </div>
      </div>
    </div>
  )
}