'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import AdminBell from './AdminBell'
import ImageUploader from './ImageUploader'
import { IconFor } from '@/components/Services/serviceIcons'
import { ICON_NAMES } from '@/lib/serviceConfig'

export default function AdminServiceCategories() {
  const [cats, setCats] = useState(null)
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => axios.get('/api/admin/services/categories').then(({ data }) => setCats(data.categories)).catch(() => setCats([])), [])
  useEffect(() => { load() }, [load])

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('')
    try {
      if (form._id) await axios.put(`/api/admin/services/categories/${form._id}`, form)
      else await axios.post('/api/admin/services/categories', form)
      setForm(null); load()
    } catch (e2) { setMsg(e2.response?.data?.message || 'Could not save') } finally { setBusy(false) }
  }
  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return
    try { await axios.delete(`/api/admin/services/categories/${c._id}`); load() } catch (e) { setMsg(e.response?.data?.message || 'Could not delete') }
  }
  const inp = 'w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-600'

  return (
    <div className="p-3 sm:p-6 space-y-4 bg-[#f4f7f5] min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black">Service Categories</h1><p className="text-sm text-zinc-500">These appear in the left sidebar of the services page</p></div>
        <div className="flex items-center gap-2"><Link href="/admin/services" className="text-sm font-bold border bg-white px-4 py-2.5 rounded-xl">Dashboard</Link>
          <button type="button" onClick={() => setForm({ name: '', icon: 'Wrench', image: null, isActive: true })} className="flex items-center gap-2 bg-emerald-700 text-white text-sm font-black px-5 py-2.5 rounded-xl"><Plus size={16} /> Add category</button><AdminBell /></div>
      </div>
      {msg && <p className="text-sm font-semibold text-red-600 bg-white border rounded-xl px-4 py-2.5">{msg}</p>}

      {!cats ? <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cats.map((c) => (
            <div key={c._id} className={`bg-white border rounded-2xl overflow-hidden ${c.isActive ? '' : 'opacity-60'}`}>
              <div className="h-32 bg-zinc-100">{/* eslint-disable-next-line @next/next/no-img-element */}{c.image?.url && <img src={c.image.url} alt="" className="w-full h-full object-cover" />}</div>
              <div className="p-4"><div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><IconFor name={c.icon} size={18} /></span><b className="flex-1 truncate">{c.name}</b></div>
                <p className="text-xs text-zinc-500 mt-2">{c.count} labour {c.isActive ? '' : '· hidden'}</p>
                <div className="flex gap-2 mt-3"><button type="button" onClick={() => setForm({ ...c })} className="flex-1 text-xs font-bold border py-2 rounded-lg flex items-center justify-center gap-1"><Pencil size={12} />Edit</button>
                  <button type="button" onClick={() => remove(c)} className="flex-1 text-xs font-bold border border-red-200 text-red-600 py-2 rounded-lg flex items-center justify-center gap-1"><Trash2 size={12} />Delete</button></div></div>
            </div>
          ))}
          {cats.length === 0 && <p className="col-span-full text-center text-zinc-400 py-16">No categories yet. Add one, or create it while adding labour.</p>}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3"><div className="absolute inset-0 bg-black/50" onClick={() => setForm(null)} />
          <form onSubmit={save} className="relative bg-white rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between"><h2 className="text-lg font-black">{form._id ? 'Edit category' : 'Add category'}</h2><button type="button" onClick={() => setForm(null)} aria-label="Close"><X size={18} /></button></div>
            <ImageUploader value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Category image" />
            <input className={inp} placeholder="Category name" maxLength={40} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="flex flex-wrap gap-1.5">{ICON_NAMES.map((n) => <button key={n} type="button" title={n} onClick={() => setForm({ ...form, icon: n })} className={`w-9 h-9 rounded-lg border flex items-center justify-center ${form.icon === n ? 'bg-emerald-700 text-white border-emerald-700' : ''}`}><IconFor name={n} size={16} /></button>)}</div>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" /> Visible on website</label>
            <button disabled={busy} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-black disabled:opacity-50">{busy ? '...' : 'Save'}</button>
          </form>
        </div>
      )}
    </div>
  )
}