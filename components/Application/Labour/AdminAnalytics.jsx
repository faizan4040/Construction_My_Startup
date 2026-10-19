'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Activity, Briefcase, IndianRupee, Loader2, Percent, Wallet } from 'lucide-react'
import useAdminLive from '../../../hooks/useAdminLive'

const RANGES = [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['yearly', 'Yearly']]
const inr = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`
const compact = (n) =>
  n >= 10000000 ? `${+(n / 10000000).toFixed(1)}Cr`
  : n >= 100000 ? `${+(n / 100000).toFixed(1)}L`
  : n >= 1000 ? `${+(n / 1000).toFixed(1)}k`
  : String(n)

const niceMax = (v) => {
  const p = 10 ** Math.floor(Math.log10(Math.max(v, 1)))
  return Math.ceil(v / p) * p
}

function Chart({ series, hover, setHover }) {
  const W = 720, H = 280, pl = 52, pr = 12, pt = 16, pb = 36
  const max = niceMax(Math.max(1, ...series.map((s) => s.gross)))
  const innerH = H - pt - pb
  const bw = (W - pl - pr) / series.length
  const step = series.length > 12 ? 2 : 1
  const y = (v) => pt + innerH - (v / max) * innerH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Earnings chart">
      {[0, 1, 2, 3, 4].map((i) => {
        const v = (max / 4) * i
        return (
          <g key={i}>
            <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} className="stroke-zinc-200" strokeDasharray="3 3" />
            <text x={pl - 8} y={y(v) + 3} textAnchor="end" className="fill-zinc-400 text-[10px]">
              {compact(v)}
            </text>
          </g>
        )
      })}

      {series.map((s, i) => {
        const x = pl + i * bw + bw * 0.2
        const w = bw * 0.6
        const active = hover === i
        return (
          <g key={s.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={pl + i * bw} y={pt} width={bw} height={innerH} fill="transparent" />
            <rect x={x} y={y(s.gross)} width={w} height={Math.max(0, pt + innerH - y(s.gross))} rx="3"
              className={active ? 'fill-zinc-400' : 'fill-zinc-300'} />
            <rect x={x} y={y(s.commission)} width={w} height={Math.max(0, pt + innerH - y(s.commission))} rx="3"
              className="fill-zinc-900" />
            {i % step === 0 && (
              <text x={x + w / 2} y={H - 14} textAnchor="middle" className="fill-zinc-400 text-[10px]">
                {s.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function Stat({ icon, label, value, sub }) {
  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-zinc-400 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-black text-zinc-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminAnalytics() {
  const [range, setRange] = useState('daily')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hover, setHover] = useState(null)
  const reqRef = useRef(0)
  const timerRef = useRef(null)

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++reqRef.current
    if (!silent) setLoading(true)
    try {
      const { data } = await axios.get('/api/admin/labour/analytics', { params: { range } })
      if (id === reqRef.current) setData(data)
    } catch (e) {
      console.log(e)
    } finally {
      if (!silent && id === reqRef.current) setLoading(false)
    }
  }, [range])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') load({ silent: true })
    }, 30000)
    return () => clearInterval(t)
  }, [load])

  const live = useAdminLive(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => load({ silent: true }), 600)
  })

  const t = data?.totals
  const s = data?.summary
  const h = hover != null ? data?.series?.[hover] : null
  const empty = data && data.series.every((x) => x.gross === 0)

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-zinc-900">Earnings & Commission</h2>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${
              live ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-zinc-100 border-zinc-200 text-zinc-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
              {live ? 'LIVE' : 'Reconnecting'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Completed bookings only · platform commission {data?.percent ?? 10}%
          </p>
        </div>

        <div className="flex bg-zinc-100 rounded-xl p-1 gap-1">
          {RANGES.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setRange(k)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                range === k ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-200'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-zinc-500" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Stat icon={<IndianRupee size={13} />} label="Work value" value={inr(t?.gross)}
              sub={`Online ${inr(t?.online)} · Cash ${inr(t?.cash)}`} />
            <Stat icon={<Percent size={13} />} label="Platform earning" value={inr(t?.commission)}
              sub={`${data?.percent}% commission`} />
            <Stat icon={<Wallet size={13} />} label="Labour share" value={inr(t?.labour)} sub="After commission" />
            <Stat icon={<Briefcase size={13} />} label="Jobs completed" value={t?.jobs ?? 0}
              sub={`All time: ${s?.completed ?? 0} jobs`} />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-xs">
            <span className="inline-flex items-center gap-2 text-zinc-500"><i className="w-3 h-3 rounded bg-zinc-300" /> Work value</span>
            <span className="inline-flex items-center gap-2 text-zinc-500"><i className="w-3 h-3 rounded bg-zinc-900" /> Platform commission</span>
            <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold">
              <Activity size={12} /> {s?.requested ?? 0} waiting · {s?.active ?? 0} active jobs
            </span>
          </div>

          <div className="relative">
            {empty && (
              <p className="absolute inset-x-0 top-1/3 text-center text-sm text-zinc-400 z-10">
                No completed jobs in this period yet.
              </p>
            )}
            {data && <Chart series={data.series} hover={hover} setHover={setHover} />}
          </div>

          <motion.div key={h?.key ?? 'total'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 text-sm bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-zinc-600 min-h-[46px]">
            {h ? (
              <>
                <b className="text-zinc-900">{h.label}</b>
                {' — '}work {inr(h.gross)} · platform <b className="text-zinc-900">{inr(h.commission)}</b> · labour {inr(h.labour)} · {h.jobs} jobs
              </>
            ) : (
              <span className="text-zinc-400">Hover a bar to see the details.</span>
            )}
          </motion.div>
        </>
      )}
    </section>
  )
}