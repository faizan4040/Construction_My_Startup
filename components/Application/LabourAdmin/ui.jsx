'use client'
import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`
export const fmtDT = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—')
export const fmtD = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
export const fmtSlot = (ymd, t) => (ymd ? `${new Date(`${ymd}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${t}` : '—')
export const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl'
export const input = 'w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-900 dark:focus:border-zinc-400'

const TONES = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
  blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
  violet: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900',
  zinc: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  dark: 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900',
}
export function Pill({ tone = 'zinc', children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${TONES[tone]} ${className}`}>{children}</span>
}

export function Kpi({ icon: I, label, value, sub, tone = 'bg-zinc-100 text-zinc-700', highlight }) {
  return (
    <div className={`${card} p-4 flex items-start gap-3 min-w-0 ${highlight ? 'ring-2 ring-amber-300' : ''}`}>
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}><I size={20} /></span>
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-500 font-semibold truncate">{label}</p>
        <p className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-zinc-400 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// progress chips: Booked › Assigned › Started › Finished › Paid
export function Steps({ steps, step, dead, paid }) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {steps.map((s, i) => {
        const reached = !dead && (i <= step || (s === 'Paid' && paid))
        return (
          <React.Fragment key={s}>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dead ? 'bg-zinc-100 text-zinc-300 line-through dark:bg-zinc-800' : reached ? (i === step ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300') : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>{s}</span>
            {i < steps.length - 1 && <span className={`w-1.5 h-px ${reached ? 'bg-emerald-400' : 'bg-zinc-200'}`} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export function Drawer({ open, onClose, title, subtitle, children, width = 'max-w-xl', footer }) {
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[60]" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed right-0 top-0 bottom-0 w-full ${width} bg-white dark:bg-zinc-950 z-[70] shadow-2xl flex flex-col`}>
            <div className="border-b dark:border-zinc-800 px-5 py-4 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">{subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{subtitle}</p>}<div className="font-black truncate">{title}</div></div>
              <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t dark:border-zinc-800 p-4 shrink-0">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
          <motion.div initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30 }} onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-zinc-950 rounded-3xl w-full ${wide ? 'max-w-4xl' : 'max-w-md'} max-h-[92vh] overflow-hidden flex flex-col shadow-2xl`}>
            <div className="px-5 py-4 border-b dark:border-zinc-800 flex items-center justify-between shrink-0">
              <h3 className="font-black">{title}</h3>
              <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 text-sm">
      <span className="text-zinc-500 shrink-0">{k}</span><span className="font-semibold text-right break-words min-w-0">{v ?? '—'}</span>
    </div>
  )
}
