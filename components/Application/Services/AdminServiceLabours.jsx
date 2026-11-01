'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { BadgeCheck, Loader2, Pencil, Plus, Search, Star, Trash2, UserPlus } from 'lucide-react'
import AdminBell from './AdminBell'
import ProviderFormModal from './ProviderFormModal'
import { Pagination } from '@/components/Services/Badge'
import { inr, fmtDate } from '@/components/Services/ui'

export default function AdminServiceLabours() {
  const [view, setView] = useState('catalog')
  const [cats, setCats] = useState([])
  const [d, setD] = useState({ providers: [], labours: [], pages: 1, total: 0 })
  const [f, setF] = useState({ q: '', category: '', status: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => { axios.get('/api/admin/services/categories').then(({ data }) => setCats(data.categories)).catch(() => {}) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) }
      const { data } = await axios.get(view === 'catalog' ? '/api/admin/services/providers' : '/api/admin/services/registered', { params })
      setD(data)
    } catch (e) { setMsg(e.response?.data?.message || 'Could not load') } finally { setLoading(false) }
  }, [view, page, f])
  useEffect(() => { const t = setTimeout(load, f.q ? 350 : 0); return () => clearTimeout(t) }, [load, f.q])

  const refreshCats = () => axios.get('/api/admin/services/categories').then(({ data }) => setCats(data.categories))
  const saved = () => { setForm(null); setMsg('Saved'); load(); refreshCats() }
  const toggle = async (p) => { try { await axios.patch(`/api/admin/services/providers/${p._id}`, { isActive: !p.isActive }); load() } catch (e) { setMsg(e.response?.data?.message || 'Failed') } }
  const remove = async () => { try { await axios.delete(`/api/admin/services/providers/${del._id}`); setDel(null); setMsg('Labour deleted'); load() } catch (e) { setDel(null); setMsg(e.response?.data?.message || 'Failed') } }

  const importLabour = (l) => setForm({
    name: l.fullName, phone: l.phone, startingPrice: l.pricePerDay || l.pricePerHour || '', priceUnit: l.pricePerDay ? 'day' : 'hour',
    experienceYears: l.experienceYears, description: l.about, sourceLabour: l._id, suggestCategory: (l.category || '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()),
    image: l.profileImage ? { url: l.profileImage } : null,
  })

  return (
    <div className="p-3 sm:p-6 space-y-4 bg-[#f4f7f5] min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black">Service Labour</h1><p className="text-sm text-zinc-500">Labour shown to customers in the Book Services page</p></div>
        <div className="flex items-center gap-2"><Link href="/admin/services" className="text-sm font-bold border bg-white px-4 py-2.5 rounded-xl">Dashboard</Link>
          <button type="button" onClick={() => setForm({})} className="flex items-center gap-2 bg-emerald-700 text-white text-sm font-black px-5 py-2.5 rounded-xl"><Plus size={16} /> Add labour</button><AdminBell /></div>
      </div>

      <div className="flex gap-2">{[['catalog', 'Service catalog'], ['registered', 'Registered labour (self sign-up)']].map(([k, l]) => <button key={k} type="button" onClick={() => { setView(k); setPage(1); setF({ q: '', category: '', status: '' }) }} className={`px-4 py-2 rounded-full text-sm font-bold border ${view === k ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white'}`}>{l}</button>)}</div>
      {msg && <p className="text-sm font-semibold bg-white border rounded-xl px-4 py-2.5">{msg}</p>}

      <section className="bg-white border border-zinc-200 rounded-2xl p-4">
        <div className="grid sm:grid-cols-3 gap-2 mb-4 [&>*]:min-w-0">
          <div className="flex items-center gap-2 bg-zinc-50 border rounded-xl px-3"><Search size={14} className="text-zinc-400" /><input value={f.q} onChange={(e) => { setF({ ...f, q: e.target.value }); setPage(1) }} placeholder="Search name or mobile" className="flex-1 min-w-0 bg-transparent py-2.5 text-sm outline-none" /></div>
          {view === 'catalog' ? <>
            <select value={f.category} onChange={(e) => { setF({ ...f, category: e.target.value }); setPage(1) }} className="bg-zinc-50 border rounded-xl px-3 py-2.5 text-sm"><option value="">All categories</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
            <select value={f.status} onChange={(e) => { setF({ ...f, status: e.target.value }); setPage(1) }} className="bg-zinc-50 border rounded-xl px-3 py-2.5 text-sm"><option value="">All status</option><option value="active">Visible</option><option value="inactive">Hidden</option></select></>
            : <select value={f.status} onChange={(e) => { setF({ ...f, status: e.target.value }); setPage(1) }} className="bg-zinc-50 border rounded-xl px-3 py-2.5 text-sm"><option value="">All status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>}
        </div>

        <div className="w-0 min-w-full overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400">
              <tr>{(view === 'catalog' ? ['Labour', 'Category', 'Mobile', 'Price', 'Experience', 'Rating', 'Jobs', 'Visible', 'Actions'] : ['Labour', 'Category', 'Mobile', 'Rate', 'Experience', 'Status', 'Registered', 'Actions']).map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={9} className="py-14 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                : view === 'catalog' ? (d.providers.length === 0 ? <tr><td colSpan={9} className="py-14 text-center text-zinc-400">No labour added yet.</td></tr> : d.providers.map((p) => (
                  <tr key={p._id} className="border-t align-middle hover:bg-zinc-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.image?.url} alt="" className="w-12 h-12 rounded-xl object-cover bg-zinc-100" /><b className="flex items-center gap-1">{p.name}{p.isVerified && <BadgeCheck size={14} className="text-blue-500" />}</b></div></td>
                    <td className="px-4 py-3">{p.category?.name}</td><td className="px-4 py-3">{p.phone}</td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap">{inr(p.startingPrice)}<span className="text-xs text-zinc-400 font-normal">/{p.priceUnit}</span></td>
                    <td className="px-4 py-3">{p.experienceYears} yrs</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" />{p.rating ? p.rating.toFixed(1) : 'New'} <span className="text-xs text-zinc-400">({p.reviewCount})</span></span></td>
                    <td className="px-4 py-3">{p.jobsDone}</td>
                    <td className="px-4 py-3"><button type="button" onClick={() => toggle(p)} aria-label="Toggle visibility" className={`w-10 h-6 rounded-full relative transition-colors ${p.isActive ? 'bg-emerald-600' : 'bg-zinc-300'}`}><span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${p.isActive ? 'left-[18px]' : 'left-0.5'}`} /></button></td>
                    <td className="px-4 py-3 whitespace-nowrap"><button type="button" onClick={() => setForm(p)} className="inline-flex items-center gap-1 text-xs font-bold border px-3 py-1.5 rounded-lg mr-2"><Pencil size={12} />Edit</button>
                      <button type="button" onClick={() => setDel(p)} className="inline-flex items-center gap-1 text-xs font-bold border border-red-200 text-red-600 px-3 py-1.5 rounded-lg"><Trash2 size={12} />Delete</button></td>
                  </tr>)))
                  : (d.labours.length === 0 ? <tr><td colSpan={8} className="py-14 text-center text-zinc-400">No registered labour.</td></tr> : d.labours.map((l) => (
                    <tr key={l._id} className="border-t align-middle hover:bg-zinc-50">
                      <td className="px-4 py-3"><div className="flex items-center gap-3">{l.profileImage ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={l.profileImage} alt="" className="w-12 h-12 rounded-xl object-cover" /> : <div className="w-12 h-12 rounded-xl bg-zinc-100" />}<b>{l.fullName}</b></div></td>
                      <td className="px-4 py-3 capitalize">{(l.category || '').replace(/-/g, ' ')}</td><td className="px-4 py-3">{l.phone}</td>
                      <td className="px-4 py-3 text-xs">{l.pricePerDay ? `${inr(l.pricePerDay)}/day` : ''} {l.pricePerHour ? `${inr(l.pricePerHour)}/hr` : ''}</td>
                      <td className="px-4 py-3">{l.experienceYears} yrs</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${l.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : l.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{l.status}</span></td>
                      <td className="px-4 py-3 text-xs">{fmtDate(String(l.createdAt).slice(0, 10))}</td>
                      <td className="px-4 py-3">{l.inCatalog ? <span className="text-xs text-zinc-400 font-semibold">In catalog ✓</span> : <button type="button" onClick={() => importLabour(l)} className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-700 text-white px-3 py-1.5 rounded-lg"><UserPlus size={12} />Add to catalog</button>}</td>
                    </tr>)))}
            </tbody>
          </table>
        </div>
        <Pagination page={d.page || page} pages={d.pages} onChange={setPage} />
      </section>

      {form && <ProviderFormModal cats={cats} initial={form._id || form.name ? form : null} onClose={() => setForm(null)} onSaved={saved} />}
      {del && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50" onClick={() => setDel(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm"><h3 className="font-black text-lg">Delete {del.name}?</h3><p className="text-sm text-zinc-500 mt-1">The labour will disappear from the website. Old bookings stay safe.</p>
            <div className="flex gap-2 mt-5"><button onClick={() => setDel(null)} className="flex-1 border py-2.5 rounded-xl font-bold text-sm">Cancel</button><button onClick={remove} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm">Delete</button></div></div></div>
      )}
    </div>
  )
}