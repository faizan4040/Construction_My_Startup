'use client'
import React from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

export function Badge({ map, k }) {
  const m = map[k]
  if (!m) return <span className="text-zinc-300">—</span>
  return <span className={`inline-flex whitespace-nowrap text-[10px] font-bold px-2.5 py-1 rounded-full border ${m.cls}`}>{m.label}</span>
}

export function Stars({ value = 0, size = 13 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} />
      ))}
    </span>
  )
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  const list = []
  for (let p = 1; p <= pages; p++) if (p === 1 || p === pages || Math.abs(p - page) <= 1) list.push(p)
  const out = []
  list.forEach((p, i) => { if (i && p - list[i - 1] > 1) out.push('…' + p); out.push(p) })
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"
        className="w-9 h-9 rounded-xl border border-zinc-200 bg-white flex items-center justify-center disabled:opacity-30 hover:border-zinc-400"><ChevronLeft size={16} /></button>
      {out.map((p) => typeof p === 'string'
        ? <span key={p} className="px-1 text-zinc-400">…</span>
        : <button key={p} type="button" onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-bold border ${p === page ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:border-zinc-400'}`}>{p}</button>)}
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"
        className="w-9 h-9 rounded-xl border border-zinc-200 bg-white flex items-center justify-center disabled:opacity-30 hover:border-zinc-400"><ChevronRight size={16} /></button>
    </div>
  )
}