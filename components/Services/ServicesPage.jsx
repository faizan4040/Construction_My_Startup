'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight, BadgeCheck, Briefcase, CheckCircle2, Clock, Headphones, IndianRupee, Loader2, MapPin,
  MessageCircle, Phone, Search, ShieldCheck, SlidersHorizontal, Upload, X, Tag, Calendar, Quote,
} from 'lucide-react'
import { IconFor } from './serviceIcons'
import { Pagination, Stars } from './Badge'
import { inr } from './ui'
import { SERVICE_TYPES } from '@/lib/serviceConfig'

const WA = '918504061727'
const DEFAULT = { maxPrice: 50000, rating: 0, types: [], pro: [], date: '' }
const SORTS = [['popularity', 'Popularity'], ['rating', 'Rating'], ['price_low', 'Price: low to high'], ['price_high', 'Price: high to low'], ['newest', 'Newest']]
const STEPS = [
  ['Choose Service', 'Select the service you need', Search],
  ['Select Date & Location', 'Pick a convenient date and time', Calendar],
  ['Confirm Booking', 'Get confirmation on your booking', CheckCircle2],
  ['Our Professional Arrives', 'Our verified professional will arrive at your location', Briefcase],
]

function Check({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-zinc-700 cursor-pointer py-0.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 accent-orange-500" /> {children}
    </label>
  )
}

function SidebarContent({ cats, slug, onCat, f, setF, onClose }) {
  const toggle = (k, v) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((i) => i !== v) : [...x[k], v] }))
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-zinc-900 mb-2">Service Categories</h3>
        <nav className="space-y-0.5">
          {[{ slug: 'all', name: 'All Services', icon: 'House' }, ...cats].map((c) => (
            <button key={c.slug} type="button" onClick={() => { onCat(c.slug); onClose?.() }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-left transition-colors ${
                slug === c.slug ? 'bg-orange-50 text-orange-600' : 'text-zinc-700 hover:bg-zinc-50'}`}>
              <IconFor name={c.icon} size={16} className={slug === c.slug ? 'text-orange-500' : 'text-zinc-500'} />
              <span className="flex-1 truncate">{c.name}</span>
              {c.count > 0 && <span className="text-[10px] text-zinc-400">{c.count}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-5 border-t pt-5">
        <h3 className="font-black text-zinc-900">Filters</h3>
        <div>
          <p className="text-xs font-black text-zinc-900 mb-1.5">Service Type</p>
          {SERVICE_TYPES.map((t) => <Check key={t} checked={f.types.includes(t)} onChange={() => toggle('types', t)}>{t}</Check>)}
        </div>
        <div>
          <p className="text-xs font-black text-zinc-900 mb-1.5">Max starting price</p>
          <input type="range" min={500} max={50000} step={500} value={f.maxPrice} onChange={(e) => setF((x) => ({ ...x, maxPrice: Number(e.target.value) }))} className="w-full accent-orange-500" />
          <p className="text-xs text-zinc-500">₹0 – {inr(f.maxPrice)}{f.maxPrice >= 50000 && '+'}</p>
        </div>
        <div>
          <p className="text-xs font-black text-zinc-900 mb-1.5">Rating</p>
          {[4.5, 4, 3.5, 3].map((r) => (
            <label key={r} className="flex items-center gap-2 text-[13px] py-0.5 cursor-pointer">
              <input type="radio" name="rating" checked={f.rating === r} onChange={() => setF((x) => ({ ...x, rating: r }))} className="accent-orange-500" />
              <Stars value={r} size={12} /> {r} & above
            </label>
          ))}
        </div>
        <div>
          <p className="text-xs font-black text-zinc-900 mb-1.5">Availability</p>
          <input type="date" value={f.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setF((x) => ({ ...x, date: e.target.value }))}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <p className="text-xs font-black text-zinc-900 mb-1.5">Professional Type</p>
          <Check checked={f.pro.includes('individual')} onChange={() => toggle('pro', 'individual')}>Individual Professional</Check>
          <Check checked={f.pro.includes('company')} onChange={() => toggle('pro', 'company')}>Company / Team</Check>
        </div>
        <button type="button" onClick={() => setF(DEFAULT)} className="w-full text-sm font-bold text-orange-600 py-2">Reset</button>
      </div>
    </div>
  )
}

function ProviderCard({ p, i }) {
  return (
    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-shadow">
      <Link href={`/services/${p._id}`} className="sm:w-44 shrink-0 h-44 sm:h-auto bg-zinc-100 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
      </Link>
      <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <Link href={`/services/${p._id}`} className="text-lg font-black text-zinc-900 hover:text-orange-600 line-clamp-1">{p.name}</Link>
            {p.category && <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">{p.category.name}</p>}
          </div>
        </div>
        <p className="text-sm text-zinc-500 line-clamp-2">{p.headline || p.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <Stars value={p.rating} />
          <b className="text-zinc-900">{p.rating ? p.rating.toFixed(1) : 'New'}</b>
          {p.reviewCount > 0 && <span className="text-zinc-400 text-xs">({p.reviewCount} reviews)</span>}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 font-semibold">
          {p.isVerified && <span className="flex items-center gap-1 text-emerald-700"><BadgeCheck size={13} /> Verified</span>}
          <span className="flex items-center gap-1"><Briefcase size={13} /> {p.experienceYears}+ yrs experience</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {p.responseText}</span>
        </div>
        {p.latestReview ? (
          <div className="mt-1 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2">
            <p className="text-xs text-zinc-600 line-clamp-2 flex gap-1.5"><Quote size={12} className="shrink-0 mt-0.5 text-orange-400" /> {p.latestReview.comment}</p>
            <p className="text-[10px] text-zinc-400 mt-1">— {p.latestReview.userName} · {p.latestReview.rating}★</p>
          </div>
        ) : <p className="text-[11px] text-zinc-400 mt-1">No written reviews yet</p>}
      </div>
      <div className="sm:w-40 shrink-0 p-4 sm:border-l border-zinc-100 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
        <div className="sm:text-right">
          <p className="text-[11px] text-zinc-400">Starting at</p>
          <p className="text-2xl font-black text-zinc-900">{inr(p.startingPrice)}</p>
          <p className="text-[10px] text-zinc-400">per {p.priceUnit}</p>
        </div>
        <Link href={`/services/book/${p._id}`} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-black px-6 py-2.5 rounded-lg transition-colors">Book Now</Link>
      </div>
    </motion.article>
  )
}

export default function ServicesPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const slug = sp.get('category') || 'all'

  const [cats, setCats] = useState([])
  const [data, setData] = useState({ providers: [], total: 0, pages: 1, page: 1 })
  const [f, setF] = useState(DEFAULT)
  const [q, setQ] = useState('')
  const [qd, setQd] = useState('')
  const [sort, setSort] = useState('popularity')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [quote, setQuote] = useState({ service: '', city: 'Jaipur', date: '', details: '' })
  const reqId = useRef(0)

  useEffect(() => { axios.get('/api/services/categories').then(({ data }) => setCats(data.categories)).catch(() => {}) }, [])
  useEffect(() => { const t = setTimeout(() => setQd(q.trim()), 350); return () => clearTimeout(t) }, [q])
  useEffect(() => { setPage(1) }, [slug, qd, sort, f])
  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [drawer])

  const load = useCallback(async () => {
    const id = ++reqId.current
    setLoading(true); setError('')
    try {
      const params = { page, limit: 8, sort }
      if (slug !== 'all') params.category = slug
      if (qd) params.q = qd
      if (f.maxPrice < 50000) params.maxPrice = f.maxPrice
      if (f.rating) params.minRating = f.rating
      if (f.types.length) params.serviceType = f.types.join(',')
      if (f.pro.length) params.professionalType = f.pro.join(',')
      if (f.date) params.date = f.date
      const { data } = await axios.get('/api/services/providers', { params })
      if (id === reqId.current) setData(data)
    } catch { if (id === reqId.current) setError('Could not load services. Please try again.') }
    finally { if (id === reqId.current) setLoading(false) }
  }, [page, slug, qd, sort, f])
  useEffect(() => { load() }, [load])

  const onCat = (s) => router.replace(s === 'all' ? '/services' : `/services?category=${s}`, { scroll: false })
  const activeCat = cats.find((c) => c.slug === slug)
  const sendQuote = () => {
    const t = `Hi ConstructEzy, I need a quote.\nService: ${quote.service || 'Not selected'}\nCity: ${quote.city}\nDate: ${quote.date || 'Flexible'}\nDetails: ${quote.details || '-'}`
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(t)}`, '_blank', 'noopener')
  }

  return (
    <div className="bg-[#f7f6f3] min-h-screen pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
        <p className="text-xs text-zinc-500 mb-3"><Link href="/" className="hover:underline">Home</Link> &gt; <span className="font-semibold text-zinc-700">Services</span>{activeCat && <> &gt; {activeCat.name}</>}</p>

        {/* banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-[#fff4e8] to-[#fde3c8] border border-orange-100 min-h-[260px]">
          <div className="relative z-10 p-6 sm:p-10 max-w-xl">
            <h1 className="text-3xl sm:text-5xl font-black leading-tight text-zinc-900">Home & Construction <span className="text-orange-500">Services</span></h1>
            <p className="mt-3 text-zinc-600 text-sm sm:text-base">Verified professionals for all your construction and renovation needs.</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-zinc-800">
              {[[BadgeCheck, 'Verified Professionals'], [IndianRupee, 'Transparent Pricing'], [Clock, 'On-time Service']].map(([I, t]) => (
                <span key={t} className="flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center"><I size={14} /></span>{t}</span>
              ))}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80" alt="" loading="eager"
            className="hidden md:block absolute right-0 top-0 h-full w-[48%] object-cover [mask-image:linear-gradient(to_right,transparent,black_40%)]" />
        </section>

        {/* quick actions */}
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          {[
            [MessageCircle, 'Book via WhatsApp', 'Chat with our team', `https://wa.me/${WA}?text=${encodeURIComponent('Hello, I want to book a service.')}`],
            [Phone, 'Book via Call', 'Talk to our experts', 'tel:+918504061727'],
            [Upload, 'Upload Your Material List', 'Get best prices & quick quotes', '/ContactUs'],
          ].map(([I, t, s, h]) => (
            <a key={t} href={h} className="bg-white border border-orange-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
              <span className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0"><I size={22} /></span>
              <span className="flex-1 min-w-0"><b className="block text-zinc-900">{t}</b><span className="text-xs text-zinc-500">{s}</span></span>
              <ArrowRight size={18} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
            </a>
          ))}
        </div>

        {/* mobile toggle */}
        <button type="button" onClick={() => setDrawer(true)}
          className="lg:hidden mt-4 w-full flex items-center justify-between bg-white border border-zinc-200 rounded-2xl px-4 py-3 font-bold text-sm">
          <span className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-orange-500" /> {activeCat ? activeCat.name : 'All Services'} · Categories & Filters</span>
          <ArrowRight size={16} />
        </button>

        <div className="mt-4 grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_300px]">
          {/* left */}
          <aside className="hidden lg:block bg-white border border-zinc-200 rounded-2xl p-4 h-fit sticky top-24">
            <SidebarContent cats={cats} slug={slug} onCat={onCat} f={f} setF={setF} />
          </aside>

          {/* center */}
          <main className="min-w-0 space-y-4">
            <section className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black text-zinc-900">Popular Service Categories</h2>
                {slug !== 'all' && <button type="button" onClick={() => onCat('all')} className="text-sm font-bold text-orange-600">View All →</button>}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {cats.slice(0, 12).map((c) => (
                  <button key={c._id} type="button" onClick={() => onCat(c.slug)}
                    className={`rounded-xl border p-2 text-center transition-all hover:shadow-md ${slug === c.slug ? 'border-orange-400 bg-orange-50' : 'border-zinc-200 bg-white'}`}>
                    <div className="aspect-square rounded-lg bg-zinc-100 overflow-hidden mb-1.5 flex items-center justify-center">
                      {c.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
                        : <IconFor name={c.icon} size={28} className="text-orange-500" />}
                    </div>
                    <span className="flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-800 leading-tight"><IconFor name={c.icon} size={11} className="text-orange-500 shrink-0" />{c.name}</span>
                  </button>
                ))}
                {cats.length === 0 && <p className="col-span-full text-sm text-zinc-400 py-4 text-center">Categories will appear here.</p>}
              </div>
            </section>

            <section className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
                <h2 className="text-lg font-black text-zinc-900">{activeCat ? `${activeCat.name} Services` : 'Recommended Services'} <span className="text-xs font-semibold text-zinc-400">({data.total})</span></h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 flex-1 sm:w-52 focus-within:border-orange-400">
                    <Search size={14} className="text-zinc-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search labour or service" className="flex-1 min-w-0 bg-transparent py-2 text-sm outline-none" />
                  </div>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-zinc-200 rounded-lg px-2 py-2 text-xs font-semibold bg-white">
                    {SORTS.map(([k, l]) => <option key={k} value={k}>Sort by: {l}</option>)}
                  </select>
                </div>
              </div>

              {error && <p className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-3">{error} <button onClick={load} className="underline font-bold">Retry</button></p>}

              <div className="space-y-4">
                {loading && data.providers.length === 0
                  ? [0, 1, 2].map((i) => <div key={i} className="h-44 rounded-2xl bg-zinc-100 animate-pulse" />)
                  : data.providers.length === 0
                    ? <div className="text-center py-14"><Search size={30} className="mx-auto text-zinc-300 mb-2" /><p className="font-bold">No service found</p><p className="text-sm text-zinc-400">Try another category or reset the filters.</p></div>
                    : <div className={`space-y-4 transition-opacity ${loading ? 'opacity-50' : ''}`}>{data.providers.map((p, i) => <ProviderCard key={p._id} p={p} i={i} />)}</div>}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={(p) => { setPage(p); window.scrollTo({ top: 300, behavior: 'smooth' }) }} />

              <div className="mt-5 flex flex-wrap items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-4">
                <ShieldCheck className="text-orange-500" size={28} />
                <p className="flex-1 text-sm min-w-[200px]"><b>All services are backed by our Service Guarantee</b><br /><span className="text-zinc-500 text-xs">Quality work, on-time service and 100% satisfaction.</span></p>
                <Link href="/AboutUs" className="border border-orange-400 text-orange-600 font-bold text-sm px-4 py-2 rounded-lg">Know More</Link>
              </div>
            </section>
          </main>

          {/* right */}
          <aside className="hidden xl:block space-y-4">
            <section className="bg-white border border-orange-100 rounded-2xl p-4">
              <h3 className="text-lg font-black text-orange-500">Get a Service Quote</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-3">Tell us what you need and we'll connect you with the right professionals.</p>
              <label className="text-xs font-bold">Service Type</label>
              <select value={quote.service} onChange={(e) => setQuote({ ...quote, service: e.target.value })} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm mb-3 mt-1">
                <option value="">Select Service</option>{cats.map((c) => <option key={c._id}>{c.name}</option>)}
              </select>
              <label className="text-xs font-bold">Your Location</label>
              <input value={quote.city} onChange={(e) => setQuote({ ...quote, city: e.target.value.slice(0, 40) })} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm mb-3 mt-1" />
              <label className="text-xs font-bold">Preferred Date</label>
              <input type="date" value={quote.date} onChange={(e) => setQuote({ ...quote, date: e.target.value })} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm mb-3 mt-1" />
              <label className="text-xs font-bold">Additional Details (Optional)</label>
              <textarea rows={3} maxLength={300} value={quote.details} onChange={(e) => setQuote({ ...quote, details: e.target.value })} placeholder="e.g. 2BHK painting, kitchen renovation" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm mt-1" />
              <button type="button" onClick={sendQuote} className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white font-black py-2.5 rounded-lg flex items-center justify-center gap-2">Request a Quote <ArrowRight size={16} /></button>
            </section>
            <section className="bg-white border border-zinc-200 rounded-2xl p-4">
              <h3 className="font-black mb-3">Why Choose ConstructEzy?</h3>
              {[['Verified Professionals', 'Background verified', ShieldCheck], ['Transparent Pricing', 'No hidden charges', Tag], ['On-time Service', 'Reliable & punctual', Clock], ['Wide Service Coverage', 'Across Delhi NCR & Jaipur', MapPin], ['Dedicated Support', "We're here to help", Headphones]].map(([t, s, I]) => (
                <div key={t} className="flex items-center gap-3 py-2"><span className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><I size={17} /></span><span className="text-sm"><b className="block leading-tight">{t}</b><span className="text-xs text-zinc-500">{s}</span></span></div>
              ))}
            </section>
            <section className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2">
              <h3 className="font-black">Need Help?</h3>
              <a href={`https://wa.me/${WA}`} className="block text-center bg-orange-500 text-white font-bold py-2.5 rounded-lg">Chat on WhatsApp</a>
              <a href="tel:+918504061727" className="block text-center border border-orange-400 text-orange-600 font-bold py-2.5 rounded-lg">Call Now</a>
              <p className="text-[11px] text-zinc-400 text-center">Available 9 AM - 9 PM</p>
            </section>
          </aside>
        </div>

        {/* how it works */}
        <section className="mt-6 bg-white border border-zinc-200 rounded-2xl p-5">
          <h2 className="text-center font-black text-lg mb-4">How Service Booking Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(([t, s, I], i) => (
              <div key={t} className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-500 text-white font-black flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-sm"><b className="block">{t}</b><span className="text-xs text-zinc-500">{s}</span></span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} className="fixed inset-0 bg-black/50 z-[70] lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white z-[80] lg:hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <p className="font-black">Categories & Filters</p>
                <button type="button" onClick={() => setDrawer(false)} aria-label="Close" className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4"><SidebarContent cats={cats} slug={slug} onCat={onCat} f={f} setF={setF} onClose={() => setDrawer(false)} /></div>
              <div className="p-4 border-t"><button type="button" onClick={() => setDrawer(false)} className="w-full bg-orange-500 text-white font-black py-3 rounded-xl">Show {data.total} result{data.total === 1 ? '' : 's'}</button></div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}