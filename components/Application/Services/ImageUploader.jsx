'use client'
import React, { useRef, useState } from 'react'
import axios from 'axios'
import { ImagePlus, Loader2, X } from 'lucide-react'

export default function ImageUploader({ value, onChange, label = 'Upload image' }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setErr('Only JPG, PNG or WEBP')
    if (file.size > 3 * 1024 * 1024) return setErr('Image must be under 3 MB')
    setBusy(true); setErr('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const { data } = await axios.post('/api/admin/services/upload', fd)
      onChange({ url: data.url, public_id: data.public_id })
    } catch (e2) { setErr(e2.response?.data?.message || 'Upload failed') } finally { setBusy(false) }
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="hidden" />
      {value?.url ? (
        <div className="relative w-28 h-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt="" className="w-28 h-28 rounded-2xl object-cover border" />
          <button type="button" onClick={() => onChange(null)} aria-label="Remove image" className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"><X size={13} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}
          className="w-28 h-28 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-zinc-500 flex flex-col items-center justify-center gap-1 text-xs font-bold text-zinc-500">
          {busy ? <Loader2 className="animate-spin" size={20} /> : <><ImagePlus size={22} />{label}</>}
        </button>
      )}
      {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
    </div>
  )
}