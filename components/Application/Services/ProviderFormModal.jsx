'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { Loader2, X } from 'lucide-react'
import ImageUploader from './ImageUploader'
import { ICON_NAMES, SERVICE_TYPES } from '@/lib/serviceConfig'
import { IconFor } from '@/components/Services/serviceIcons'

const inp = 'w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-600'
const L = ({ t, children }) => <label className="block"><span className="text-xs font-bold text-zinc-600">{t}</span>{children}</label>

export default function ProviderFormModal({ cats, initial, onClose, onSaved }) {
  const edit = !!initial?._id
  const [f, setF] = useState(() => ({
    name: initial?.name || '', phone: initial?.phone || '', categoryId: initial?.category?._id || initial?.category || '',
    image: initial?.image?.url ? initial.image : null, headline: initial?.headline || '', description: initial?.description || '',
    startingPrice: initial?.startingPrice || '', priceUnit: initial?.priceUnit || 'visit', experienceYears: initial?.experienceYears ?? 0,
    responseText: initial?.responseText || 'Same-day service', serviceType: initial?.serviceType || SERVICE_TYPES[0],
    professionalType: initial?.professionalType || 'individual',
    inclusions: (initial?.inclusions || []).join('\n'), process: (initial?.process || []).join('\n'),
    isVerified: initial?.isVerified ?? true, isActive: initial?.isActive ?? true,
    newName: initial?.suggestCategory || '', newIcon: 'Wrench', newImage: null,
  }))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const creating = f.categoryId === '__new'

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    const body = {
      ...f, startingPrice: Number(f.startingPrice), experienceYears: Number(f.experienceYears),
      categoryId: creating ? undefined : f.categoryId,
      newCategory: creating ? { name: f.newName, icon: f.newIcon, image: f.newImage } : undefined,
      sourceLabour: initial?.sourceLabour,
    }
    try {
      if (edit) await axios.put(`/api/admin/services/providers/${initial._id}`, body)
      else await axios.post('/api/admin/services/providers', body)
      onSaved()
    } catch (e2) { setErr(e2.response?.data?.message || 'Could not save'); setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-3 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={submit} className="relative bg-white rounded-3xl w-full max-w-2xl my-6 p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-black">{edit ? 'Edit labour' : 'Add service labour'}</h2><button type="button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>

        <div className="flex gap-4 items-start"><ImageUploader value={f.image} onChange={(v) => setF({ ...f, image: v })} label="Labour photo" />
          <div className="flex-1 grid sm:grid-cols-2 gap-3">
            <L t="Name*"><input className={inp} value={f.name} maxLength={80} onChange={set('name')} /></L>
            <L t="Mobile* (admin only)"><input className={inp} inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></L>
          </div></div>

        <L t="Category*">
          <select className={inp} value={f.categoryId} onChange={set('categoryId')}>
            <option value="">Select category</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}<option value="__new">+ Create new category</option>
          </select></L>
        {creating && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-800">New category (appears in the left sidebar automatically)</p>
            <div className="flex gap-4 items-start"><ImageUploader value={f.newImage} onChange={(v) => setF({ ...f, newImage: v })} label="Category image" />
              <div className="flex-1 space-y-3"><input className={inp} placeholder="Category name e.g. Waterproofing" maxLength={40} value={f.newName} onChange={set('newName')} />
                <div className="flex flex-wrap gap-1.5">{ICON_NAMES.map((n) => <button key={n} type="button" onClick={() => setF({ ...f, newIcon: n })} title={n} className={`w-9 h-9 rounded-lg border flex items-center justify-center ${f.newIcon === n ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white'}`}><IconFor name={n} size={16} /></button>)}</div></div></div>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          <L t="Starting price (₹)*"><input className={inp} inputMode="numeric" value={f.startingPrice} onChange={(e) => setF({ ...f, startingPrice: e.target.value.replace(/\D/g, '') })} /></L>
          <L t="Per"><select className={inp} value={f.priceUnit} onChange={set('priceUnit')}>{['visit', 'hour', 'day', 'sq.ft', 'project'].map((u) => <option key={u}>{u}</option>)}</select></L>
          <L t="Experience (years)"><input className={inp} inputMode="numeric" value={f.experienceYears} onChange={(e) => setF({ ...f, experienceYears: e.target.value.replace(/\D/g, '').slice(0, 2) })} /></L>
          <L t="Service type"><select className={inp} value={f.serviceType} onChange={set('serviceType')}>{SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></L>
          <L t="Professional type"><select className={inp} value={f.professionalType} onChange={set('professionalType')}><option value="individual">Individual</option><option value="company">Company / Team</option></select></L>
          <L t="Response text"><input className={inp} value={f.responseText} maxLength={60} onChange={set('responseText')} /></L>
        </div>
        <L t="Short headline"><input className={inp} maxLength={140} value={f.headline} onChange={set('headline')} placeholder="Fix switches, wiring, lights, fans and more" /></L>
        <L t="Description"><textarea className={inp} rows={3} maxLength={1500} value={f.description} onChange={set('description')} /></L>
        <div className="grid sm:grid-cols-2 gap-3">
          <L t="What's included (one per line)"><textarea className={inp} rows={4} value={f.inclusions} onChange={set('inclusions')} /></L>
          <L t="Service process (one step per line)"><textarea className={inp} rows={4} value={f.process} onChange={set('process')} /></L>
        </div>
        <div className="flex gap-6 text-sm font-semibold"><label className="flex items-center gap-2"><input type="checkbox" checked={f.isVerified} onChange={set('isVerified')} className="w-4 h-4" /> Verified</label><label className="flex items-center gap-2"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} className="w-4 h-4" /> Visible to customers</label></div>
        {err && <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        <div className="flex gap-2 justify-end"><button type="button" onClick={onClose} className="px-5 py-2.5 border rounded-xl text-sm font-bold">Cancel</button>
          <button disabled={busy} className="px-7 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-black disabled:opacity-50 flex items-center gap-2">{busy && <Loader2 size={14} className="animate-spin" />}{edit ? 'Save changes' : 'Add labour'}</button></div>
      </form>
    </div>
  )
}