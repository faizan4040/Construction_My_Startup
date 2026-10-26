'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { getSocket } from '@/lib/socket-client'

const QUICK = {
  customer: ['Please come fast', 'Gate is on the left', 'Call me when you reach', 'How long will it take?'],
  labour: ["I'm on the way", 'Reaching in 5 minutes', 'Please share the exact location', 'I have reached'],
}
const fmt = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

export default function LabourChat({ bookingId, role, title }) {
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const end = useRef(null)
  const mine = role === 'customer' ? 'user' : 'labour'

  useEffect(() => {
    axios.post('/api/chat/get-all', { bookingId }).then(({ data }) => setMsgs(Array.isArray(data) ? data : [])).catch(() => {})
  }, [bookingId])

  useEffect(() => {
    const s = getSocket()
    const on = (m) => {
      if (String(m.bookingId) !== String(bookingId)) return
      setMsgs((p) => (p.some((x) => x._id === m._id) ? p : [...p, m]))
    }
    s.on('chat-message', on)
    return () => s.off('chat-message', on)
  }, [bookingId])

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async (t) => {
    const v = (t ?? text).trim()
    if (!v || sending) return
    setSending(true)
    try {
      const { data } = await axios.post('/api/chat/send', { bookingId, text: v })
      setMsgs((p) => (p.some((x) => x._id === data._id) ? p : [...p, data]))
      setText('')
    } catch (e) { console.log(e) } finally { setSending(false) }
  }

  return (
    <div className="flex flex-col h-[420px] rounded-2xl border border-zinc-200 overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <p className="text-sm font-bold text-zinc-900">{title}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-zinc-50">
        {msgs.length === 0 && <p className="text-center text-xs text-zinc-400 pt-10">No messages yet. Say hello 👋</p>}
        {msgs.map((m) => (
          <motion.div key={m._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.sender === mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${m.sender === mine ? 'bg-zinc-900 text-white rounded-br-sm' : 'bg-white border border-zinc-200 text-zinc-900 rounded-bl-sm'}`}>
              <p className="break-words">{m.text}</p>
              <p className={`text-[9px] mt-0.5 ${m.sender === mine ? 'text-zinc-400' : 'text-zinc-400'}`}>{fmt(m.createdAt)}</p>
            </div>
          </motion.div>
        ))}
        <div ref={end} />
      </div>
      <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto">
        {QUICK[role].map((q) => (
          <button key={q} type="button" onClick={() => send(q)}
            className="shrink-0 text-[11px] font-semibold border border-zinc-200 rounded-full px-3 py-1.5 hover:bg-zinc-100">{q}</button>
        ))}
      </div>
      <div className="p-3 flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500}
          onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Message…"
          className="flex-1 bg-zinc-100 rounded-xl px-3.5 py-2.5 text-sm outline-none" />
        <button type="button" onClick={() => send()} disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center disabled:opacity-30">
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}