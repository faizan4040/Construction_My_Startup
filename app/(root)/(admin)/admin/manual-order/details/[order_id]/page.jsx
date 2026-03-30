'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_MANUAL_ORDERS_DETAILS } from '@/routes/AdminPanelRoute'

// ── React Icons ──────────────────────────────────────────────────
import { FiShoppingBag, FiUser, FiMail, FiPhone, FiMapPin, FiTag, FiCreditCard, FiDollarSign, FiPackage, FiEdit3, FiCheck, FiX, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiAlertCircle, FiFileText, FiHash, FiCalendar, FiLoader, FiBookmark, FiList } from 'react-icons/fi'
import { MdOutlinePayment, MdOutlineLocalShipping, MdOutlineInventory2 } from 'react-icons/md'
import { BsBoxSeam, BsCashCoin, BsReceiptCutoff } from 'react-icons/bs'
import { HiOutlineSparkles } from 'react-icons/hi'
import { TbDiscount } from 'react-icons/tb'

/* ═══════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');

  .mod-root *, .mod-root *::before, .mod-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .mod-root { font-family: 'Plus Jakarta Sans', sans-serif; }
  .mod-mono { font-family: 'Fira Code', monospace; }

  @keyframes spin-cw   { to { transform: rotate(360deg); } }
  @keyframes spin-ccw  { to { transform: rotate(-360deg); } }
  @keyframes pulse-ring {
    0%   { transform: scale(.8);  opacity: .55; }
    70%  { transform: scale(1.35); opacity: 0; }
    100% { transform: scale(.8);  opacity: 0; }
  }
  @keyframes dot-bounce {
    0%,80%,100% { transform: translateY(0);    opacity: .4; }
    40%         { transform: translateY(-9px);  opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes gradient-slide {
    0%,100% { background-position: 0% 50%; }
    50%     { background-position: 100% 50%; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-5px); }
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(20px) scale(.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes toast-out {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(8px) scale(.95); }
  }
  @keyframes checkmark {
    0%   { stroke-dashoffset: 50; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes spin-btn { to { transform: rotate(360deg); } }
  @keyframes spin-loader { to { transform: rotate(360deg); } }

  .anim-fade-up { animation: fade-up .5s ease both; }
  .anim-d1 { animation-delay: .08s; }
  .anim-d2 { animation-delay: .16s; }
  .anim-d3 { animation-delay: .24s; }
  .anim-d4 { animation-delay: .32s; }
  .anim-d5 { animation-delay: .40s; }

  .shimmer-line {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 700px 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 10px;
  }

  .top-bar {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1);
    background-size: 200% 100%;
    animation: gradient-slide 4s ease infinite;
  }

  .header-card {
    background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ecfeff 100%);
    border: 1.5px solid rgba(99,102,241,.22);
    box-shadow: 0 4px 32px rgba(99,102,241,.1), 0 1px 4px rgba(0,0,0,.04);
    border-radius: 20px;
    overflow: hidden;
  }

  .section-card {
    background: #fff;
    border: 1.5px solid #e8ecf4;
    box-shadow: 0 2px 16px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.03);
    border-radius: 18px;
    overflow: hidden;
  }

  .section-hd {
    background: linear-gradient(90deg, #f8faff, #fafbff);
    border-bottom: 1.5px solid #edf0f8;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .info-tile {
    padding: 14px 16px;
    border-radius: 13px;
    background: #f8fafc;
    border: 1.5px solid #e8ecf4;
    transition: all .2s;
  }
  .info-tile:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(99,102,241,.08);
  }

  .product-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1.5px solid #e8ecf4;
    background: #fafbff;
    transition: all .2s;
  }
  .product-row:hover {
    border-color: #a5b4fc;
    background: #f5f3ff;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99,102,241,.1);
  }

  .status-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border-radius: 11px;
    border: 2px solid #e2e8f0;
    background: #f8fafc;
    cursor: pointer;
    transition: all .2s;
    width: 100%;
    text-align: left;
  }
  .status-option:hover { border-color: #a5b4fc; background: #eef2ff; }
  .status-option.selected {
    border-color: #6366f1;
    background: #eef2ff;
    box-shadow: 0 0 0 3px rgba(99,102,241,.12);
  }

  .update-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 28px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 4px 18px rgba(99,102,241,.3);
    transition: all .2s;
    letter-spacing: .02em;
  }
  .update-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,102,241,.4);
  }
  .update-btn:disabled { opacity: .65; cursor: not-allowed; transform: none; }
  .update-btn.success {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 18px rgba(16,185,129,.3);
  }

  .total-pill {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 14px;
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 6px 24px rgba(99,102,241,.28);
  }

  .toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,.14);
    border: 1.5px solid #e2e8f0;
    min-width: 290px;
    max-width: 360px;
  }
  .toast.entering { animation: toast-in .35s ease both; }
  .toast.leaving  { animation: toast-out .3s ease both; }

  .meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 10px;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    font-size: 12px;
  }

  .floating { animation: float 3.2s ease-in-out infinite; }
  .dot1 { animation: dot-bounce 1.3s ease-in-out infinite; }
  .dot2 { animation: dot-bounce 1.3s ease-in-out .16s infinite; }
  .dot3 { animation: dot-bounce 1.3s ease-in-out .32s infinite; }

  .checkmark-path {
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
    animation: checkmark .4s ease .1s forwards;
  }

  .icon-spin { animation: spin-loader .8s linear infinite; }
  .icon-spin-btn { animation: spin-btn .8s linear infinite; }
`

/* ═══════════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════════ */
const Toast = ({ toast }) => {
  if (!toast) return null
  const cfg = {
    success: { bg: '#f0fdf4', border: '#86efac', color: '#16a34a', Icon: FiCheckCircle },
    error:   { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', Icon: FiXCircle    },
    info:    { bg: '#eff6ff', border: '#93c5fd', color: '#2563eb', Icon: FiAlertCircle },
  }[toast.type] || { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', Icon: FiFileText }

  const { Icon } = cfg
  return (
    <div className={`toast ${toast.phase}`} style={{ background: cfg.bg, borderColor: cfg.border }}>
      <Icon size={22} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: cfg.color, lineHeight: 1.4 }}>{toast.title}</p>
        {toast.msg && <p style={{ fontSize: 12, color: '#64748b', marginTop: 3, lineHeight: 1.5 }}>{toast.msg}</p>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   LOADER
═══════════════════════════════════════════════════════════════════ */
const OrderLoader = () => (
  <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, background: 'linear-gradient(135deg,#f8faff,#faf5ff,#f0fdff)' }}>
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(99,102,241,.25)', animation: 'pulse-ring 1.8s ease-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(139,92,246,.18)', animation: 'pulse-ring 1.8s ease-out .55s infinite' }} />
      <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '3.5px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#8b5cf6', animation: 'spin-cw 1.1s linear infinite' }} />
      <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', border: '2.5px solid transparent', borderTopColor: '#06b6d4', borderLeftColor: '#a5b4fc', animation: 'spin-ccw .85s linear infinite' }} />
      <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 22px rgba(99,102,241,.45)' }}>
        <FiShoppingBag size={20} color="white" />
      </div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 10 }}>
        <div className="dot1" style={{ width: 9, height: 9, borderRadius: '50%', background: '#6366f1' }} />
        <div className="dot2" style={{ width: 9, height: 9, borderRadius: '50%', background: '#8b5cf6' }} />
        <div className="dot3" style={{ width: 9, height: 9, borderRadius: '50%', background: '#06b6d4' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#6366f1' }}>Loading Order Details</p>
      <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Fetching your data, please wait…</p>
    </div>
    <div style={{ width: '100%', maxWidth: 540, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="shimmer-line" style={{ height: 72 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="shimmer-line" style={{ height: 54 }} />
        <div className="shimmer-line" style={{ height: 54 }} />
      </div>
      <div className="shimmer-line" style={{ height: 88 }} />
      <div className="shimmer-line" style={{ height: 52, width: '65%' }} />
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════════════
   BADGE
═══════════════════════════════════════════════════════════════════ */
const Badge = ({ label, bg, color, dot }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '.04em', background: bg, color, border: `1.5px solid ${color}40` }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot || color, boxShadow: `0 0 0 2.5px ${color}22` }} />
    {label}
  </span>
)

/* ═══════════════════════════════════════════════════════════════════
   SECTION CARD
═══════════════════════════════════════════════════════════════════ */
const SectionCard = ({ title, Icon, accent = '#6366f1', children }) => (
  <div className="section-card">
    <div className="section-hd">
      <span style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
        <Icon size={15} />
      </span>
      <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', letterSpacing: '.025em' }}>{title}</span>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </div>
)

/* ═══════════════════════════════════════════════════════════════════
   STATUS CONFIG
═══════════════════════════════════════════════════════════════════ */
const ORDER_STATUSES = [
  { value: 'pending',   label: 'Pending',   Icon: FiClock,       bg: '#fffbeb', color: '#d97706', dot: '#fbbf24', desc: 'Order received, awaiting confirmation' },
  { value: 'confirmed', label: 'Confirmed', Icon: FiCheckCircle, bg: '#eff6ff', color: '#2563eb', dot: '#60a5fa', desc: 'Order confirmed and being prepared'     },
  { value: 'shipped',   label: 'Shipped',   Icon: FiTruck,       bg: '#f5f3ff', color: '#7c3aed', dot: '#a78bfa', desc: 'Order dispatched and on the way'       },
  { value: 'delivered', label: 'Delivered', Icon: FiPackage,     bg: '#f0fdf4', color: '#16a34a', dot: '#4ade80', desc: 'Order successfully delivered'          },
  { value: 'cancelled', label: 'Cancelled', Icon: FiXCircle,     bg: '#fef2f2', color: '#dc2626', dot: '#f87171', desc: 'Order has been cancelled'              },
]

const PAYMENT_STATUSES = [
  { value: 'Pending', label: 'Pending', Icon: FiClock,        bg: '#fffbeb', color: '#d97706', dot: '#fbbf24', desc: 'Payment not yet received'     },
  { value: 'Paid',    label: 'Paid',    Icon: BsCashCoin,     bg: '#f0fdf4', color: '#16a34a', dot: '#4ade80', desc: 'Payment received & confirmed'  },
  { value: 'Failed',  label: 'Failed',  Icon: FiXCircle,      bg: '#fef2f2', color: '#dc2626', dot: '#f87171', desc: 'Payment attempt failed'        },
]

const osFind = v => ORDER_STATUSES.find(s => s.value === v)   || { label: v, bg: '#f8fafc', color: '#64748b', dot: '#94a3b8', Icon: FiPackage }
const psFind = v => PAYMENT_STATUSES.find(s => s.value === v) || { label: v, bg: '#f8fafc', color: '#64748b', dot: '#94a3b8', Icon: FiCreditCard }

/* ═══════════════════════════════════════════════════════════════════
   STATUS UPDATER PANEL
═══════════════════════════════════════════════════════════════════ */
const StatusUpdater = ({ order, onUpdated, showToast }) => {
  const [orderStatus,   setOrderStatus]   = useState(order.status        || 'pending')
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'Pending')
  const [note,   setNote]   = useState('')
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState(false)

  const hasChanged = orderStatus !== order.status || paymentStatus !== order.paymentStatus

  const handleUpdate = async () => {
    if (!hasChanged || saving) return
    setSaving(true)
    setDone(false)
    try {
      const res  = await fetch(`/api/manual-order/${order.order_id}/update-status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: orderStatus, paymentStatus, note }),
      })

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text.slice(0, 300))
        throw new Error(res.status === 404 ? 'API route not found — check update-status/route.js exists' : `Server error ${res.status}`)
      }

      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Update failed')

      setDone(true)
      onUpdated({ status: orderStatus, paymentStatus })
      showToast('success', 'Order Updated!', data.message)
      setTimeout(() => setDone(false), 3500)
    } catch (err) {
      console.error('[StatusUpdater]', err)
      showToast('error', 'Update Failed', err.message)
    } finally {
      setSaving(false)
    }
  }

  const osCurrent = osFind(orderStatus)
  const psCurrent = psFind(paymentStatus)

  return (
    <SectionCard title="Update Order Status" Icon={FiEdit3} accent="#6366f1">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>

        {/* ── Order Status ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <FiPackage size={13} color="#64748b" />
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.09em' }}>Order Status</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ORDER_STATUSES.map(s => {
              const selected = orderStatus === s.value
              return (
                <button key={s.value} className={`status-option${selected ? ' selected' : ''}`} onClick={() => setOrderStatus(s.value)}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${s.color}30`, color: s.color }}>
                    <s.Icon size={16} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: selected ? '#6366f1' : '#334155' }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc}</p>
                  </div>
                  {selected && (
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={12} color="white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Payment Status ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <FiCreditCard size={13} color="#64748b" />
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.09em' }}>Payment Status</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PAYMENT_STATUSES.map(s => {
              const selected = paymentStatus === s.value
              return (
                <button key={s.value} className={`status-option${selected ? ' selected' : ''}`} onClick={() => setPaymentStatus(s.value)}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${s.color}30`, color: s.color }}>
                    <s.Icon size={16} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: selected ? '#6366f1' : '#334155' }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{s.desc}</p>
                  </div>
                  {selected && (
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={12} color="white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Admin note */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <FiFileText size={13} color="#64748b" />
              <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.09em' }}>Admin Note (optional)</p>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note for the customer email notification…"
              rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 13, color: '#334155', resize: 'vertical', outline: 'none', transition: 'all .2s', lineHeight: 1.6 }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#eef2ff' }}
              onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
            />
          </div>
        </div>
      </div>

      {/* Preview + action row */}
      <div style={{ marginTop: 20, padding: '16px 20px', borderRadius: 14, background: '#f8faff', border: '1.5px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 7 }}>Preview after update:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Badge label={osCurrent.label} bg={osCurrent.bg} color={osCurrent.color} dot={osCurrent.dot} />
            <Badge label={psCurrent.label} bg={psCurrent.bg} color={psCurrent.color} dot={psCurrent.dot} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
            {hasChanged
              ? <><FiEdit3 size={11} color="#6366f1" /><p style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>Changes detected — customer will be notified by email</p></>
              : <><FiCheck  size={11} color="#94a3b8" /><p style={{ fontSize: 11, color: '#94a3b8' }}>No changes yet</p></>
            }
          </div>
        </div>

        <button className={`update-btn${done ? ' success' : ''}`} onClick={handleUpdate} disabled={!hasChanged || saving}>
          {saving ? (
            <><FiLoader size={16} className="icon-spin-btn" />Saving…</>
          ) : done ? (
            <><FiCheck size={16} />Updated!</>
          ) : (
            <><FiEdit3 size={16} />Update &amp; Notify Customer</>
          )}
        </button>
      </div>
    </SectionCard>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const ManualOrderDetails = () => {
  const { order_id } = useParams()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState(null)
  let t1 = null, t2 = null

  const showToast = (type, title, msg, duration = 4500) => {
    clearTimeout(t1); clearTimeout(t2)
    setToast({ type, title, msg, phase: 'entering' })
    t1 = setTimeout(() => setToast(t => t ? { ...t, phase: 'leaving' } : null), duration - 400)
    t2 = setTimeout(() => setToast(null), duration)
  }

  useEffect(() => {
    if (!order_id) return
    ;(async () => {
      try {
        const res  = await fetch(`/api/manual-order/${order_id}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
        setOrder(data.data)
      } catch (err) {
        console.error(err)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [order_id])

  const handleUpdated = ({ status, paymentStatus }) => {
    setOrder(prev => prev ? { ...prev, status, paymentStatus } : prev)
  }

  const inr = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  /* ── Loading ── */
  if (loading) return (
    <div className="mod-root">
      <style>{STYLES}</style>
      <div className="top-bar" style={{ height: 4 }} />
      <OrderLoader />
    </div>
  )

  /* ── Not found ── */
  if (!order) return (
    <div className="mod-root" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f8faff,#faf5ff)' }}>
      <style>{STYLES}</style>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div className="floating" style={{ marginBottom: 16, color: '#6366f1', display: 'flex', justifyContent: 'center' }}>
          <BsBoxSeam size={56} />
        </div>
        <p style={{ color: '#ef4444', fontWeight: 800, fontSize: 20 }}>Order Not Found</p>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>No record for order #{order_id}</p>
      </div>
    </div>
  )

  const os = osFind(order.status)
  const ps = psFind(order.paymentStatus)
  const subtotal    = Number(order.subtotal    || 0)
  const discount    = Number(order.discount    || 0)
  const totalAmount = Number(order.totalAmount || 0)
  const itemCount   = order.products?.length || 0

  /* stats strip config */
  const stats = [
    { label: 'Total Items', value: itemCount,                                            Icon: BsBoxSeam,       accent: '#6366f1' },
    { label: 'Subtotal',    value: `₹${inr(subtotal)}`,                                 Icon: BsReceiptCutoff, accent: '#0ea5e9' },
    { label: 'Discount',    value: discount > 0 ? `₹${inr(discount)}` : 'None',         Icon: TbDiscount,     accent: '#10b981' },
    { label: 'Grand Total', value: `₹${inr(totalAmount)}`,                              Icon: BsCashCoin,      accent: '#8b5cf6' },
  ]

  /* customer fields */
  const customerFields = [
    { label: 'Full Name',        value: order.name,        Icon: FiUser,    accent: '#6366f1' },
    { label: 'Email',            value: order.email || '—', Icon: FiMail,   accent: '#0ea5e9' },
    { label: 'Phone',            value: order.phone,        Icon: FiPhone,  accent: '#10b981' },
    { label: 'Delivery Address', value: order.address,      Icon: FiMapPin, accent: '#f59e0b' },
  ]

  /* meta chips */
  const metaChips = [
    { label: 'Order ID',     value: `#${order.order_id}`,                                                          Icon: FiHash     },
    { label: 'Placed On',    value: new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }), Icon: FiCalendar },
    { label: 'Order Status', value: os.label,                                                                       Icon: FiList     },
    { label: 'Payment',      value: ps.label,                                                                       Icon: FiCreditCard },
  ]

  return (
    <div className="mod-root" style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#f8faff 0%,#faf5ff 45%,#f0fdff 100%)' }}>
      <style>{STYLES}</style>

      <div className="top-bar" style={{ height: 4 }} />
      <Toast toast={toast} />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px 0' }}>
        <BreadCrumb breadcrumbData={[
          { href: ADMIN_DASHBOARD,             label: 'Home'          },
          { href: ADMIN_MANUAL_ORDERS_DETAILS, label: 'Manual Orders' },
          { href: '',                           label: `Order #${order.order_id}` },
        ]} />
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 20px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ════ HEADER ════ */}
        <div className="anim-fade-up header-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="floating" style={{ width: 58, height: 58, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(245,158,11,.32)' }}>
                <FiShoppingBag size={26} color="white" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <HiOutlineSparkles size={11} color="#f59e0b" />
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '.12em', textTransform: 'uppercase' }}>Manual Order</p>
                </div>
                <h2 className="mod-mono" style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>#{order.order_id}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <FiClock size={12} color="#94a3b8" />
                  <p style={{ fontSize: 12, color: '#64748b' }}>{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <Badge label={os.label} bg={os.bg} color={os.color} dot={os.dot} />
              <Badge label={ps.label} bg={ps.bg} color={ps.color} dot={ps.dot} />
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 }}>
            {stats.map(({ label, value, Icon, accent }) => (
              <div key={label} className="info-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <Icon size={12} color="#94a3b8" />
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.09em' }}>{label}</p>
                </div>
                <p className="mod-mono" style={{ fontSize: 15, fontWeight: 700, color: accent }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════ STATUS UPDATER ════ */}
        <div className="anim-fade-up anim-d1">
          <StatusUpdater order={order} onUpdated={handleUpdated} showToast={showToast} />
        </div>

        {/* ════ CUSTOMER DETAILS ════ */}
        <div className="anim-fade-up anim-d2">
          <SectionCard title="Customer Details" Icon={FiUser} accent="#6366f1">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
              {customerFields.map(({ label, value, Icon, accent }) => (
                <div key={label} className="info-tile">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
                      <Icon size={14} />
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', lineHeight: 1.6, paddingLeft: 2 }}>{value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ════ PRODUCTS ════ */}
        <div className="anim-fade-up anim-d3">
          <SectionCard title={`Products — ${itemCount} item${itemCount !== 1 ? 's' : ''}`} Icon={BsBoxSeam} accent="#8b5cf6">
            {itemCount > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.products.map((item, i) => {
                  const lineTotal = Number(item.qty || 1) * Number(item.price || 0)
                  const catName   = typeof item.category === 'object' ? item.category?.name : item.category
                  return (
                    <div key={i} className="product-row">
                      {/* Thumbnail */}
                      <div style={{ width: 62, height: 62, borderRadius: 12, flexShrink: 0, border: '1.5px solid #e2e8f0', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                        {item.media
                          ? <Image src={item.media} alt={item.name} fill style={{ objectFit: 'cover' }} />
                          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><BsBoxSeam size={24} /></div>
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          {catName && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 10px', borderRadius: 999, background: '#ede9fe', color: '#7c3aed', fontWeight: 600, border: '1px solid #ddd6fe' }}>
                              <FiTag size={10} />{catName}
                            </span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 10px', borderRadius: 999, background: '#eff6ff', color: '#2563eb', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                            <MdOutlineInventory2 size={11} />Qty: {item.qty}
                          </span>
                          <span className="mod-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                            <FiDollarSign size={11} />₹{Number(item.price).toLocaleString('en-IN')} / unit
                          </span>
                        </div>
                      </div>

                      {/* Line total */}
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginBottom: 3 }}>
                          <FiDollarSign size={9} color="#94a3b8" />
                          <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em' }}>Subtotal</p>
                        </div>
                        <p className="mod-mono" style={{ fontSize: 17, fontWeight: 800, color: '#6366f1' }}>₹{lineTotal.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <div className="floating" style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#cbd5e1' }}>
                  <MdOutlineLocalShipping size={40} />
                </div>
                <p style={{ fontWeight: 600, color: '#94a3b8' }}>No products in this order</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ════ PRICE SUMMARY ════ */}
        <div className="anim-fade-up anim-d4">
          <SectionCard title="Price Summary" Icon={BsCashCoin} accent="#10b981">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 4px', borderBottom: '1.5px dashed #e8ecf4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: '#f0f9ff', border: '1.5px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                    <BsReceiptCutoff size={16} />
                  </span>
                  <div>
                    <p style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Subtotal</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="mod-mono" style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>₹{inr(subtotal)}</span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 4px', borderBottom: '1.5px dashed #e8ecf4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, background: '#f0fdf4', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                      <TbDiscount size={18} />
                    </span>
                    <div>
                      <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Discount</p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '1px 8px', borderRadius: 999, background: '#f0fdf4', color: '#16a34a', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                        <FiCheckCircle size={9} />Applied
                      </span>
                    </div>
                  </div>
                  <span className="mod-mono" style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>− ₹{inr(discount)}</span>
                </div>
              )}

              {/* Grand total pill */}
              <div style={{ marginTop: 18 }}>
                <div className="total-pill">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BsCashCoin size={22} color="white" />
                    </span>
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em' }}>Grand Total</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>{discount > 0 ? 'Discount applied' : 'No discount'}</p>
                    </div>
                  </div>
                  <span className="mod-mono" style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>₹{inr(totalAmount)}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ════ META CHIPS ════ */}
        <div className="anim-fade-up anim-d5" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {metaChips.map(({ Icon, label, value }) => (
            <div key={label} className="meta-chip">
              <Icon size={14} color="#6366f1" />
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>{label}:</span>
              <span style={{ color: '#334155', fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default ManualOrderDetails