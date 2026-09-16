'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { Loader2, Youtube, Truck, Package } from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { showToast } from '@/lib/showToast'
import { SHOP_OWNER_DASHBOARD } from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Return/RTO Orders' },
]

const TABS = ['Overview', 'Return Tracking', 'Claim Tracking', 'Courier Partner']

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last 1 Year' },
]

// ── Color-coded rate badge — 0-8% green, 8-15% yellow, 15%+ red ──
const rateColor = (rate) => {
  const n = Number(rate)
  if (n <= 8) return { color: '#10b981', bg: '#ecfdf5' }
  if (n <= 15) return { color: '#f59e0b', bg: '#fffbeb' }
  return { color: '#ef4444', bg: '#fef2f2' }
}

const ShopOwnerReturnsPage = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold text-gray-900">Return/RTO Orders</h1>
      </div>

      <Card className="rounded-3xl shadow-sm overflow-hidden py-0 gap-0 mt-4">
        <div className="border-b bg-gray-50/60 px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setActiveTab(i)}
                className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === i ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-5">
          {activeTab === 0 && <OverviewTab />}
          {activeTab === 1 && <ReturnTrackingTab />}
          {activeTab === 2 && <ClaimTrackingTab />}
          {activeTab === 3 && <CourierPartnerTab />}
        </CardContent>
      </Card>
    </div>
  )
}

/* ══════════════════════ OVERVIEW TAB ══════════════════════ */
const OverviewTab = () => {
  const [range, setRange] = useState('6m')
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/shopowner/returns/overview?range=${range}`)
      setOverview(data.data)
    } catch {
      setOverview(null)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { fetchOverview() }, [fetchOverview])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  if (!overview) return <p className="text-sm text-gray-400 text-center py-16">No data available.</p>

  const returnColor = rateColor(overview.customerReturnRate)
  const rtoColor = rateColor(overview.rtoRate)

  return (
    <div>
      {/* Header with date range */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="font-semibold text-gray-900">Summary</h3>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5"
        >
          {RANGE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="border rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">Customer Return Rate</p>
          <p className="text-2xl font-bold" style={{ color: returnColor.color }}>{overview.customerReturnRate}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {overview.totalReturns} orders returned out of {overview.totalDelivered} delivered
          </p>
        </div>
        <div className="border rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">Courier Return (RTO) Rate</p>
          <p className="text-2xl font-bold" style={{ color: rtoColor.color }}>{overview.rtoRate}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {overview.totalRTO} RTO orders out of {overview.totalDispatched} dispatched
          </p>
        </div>
      </div>

      {/* Dual pricing + Claims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-2">Dual Pricing - Customer Return Rate</p>
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-gray-400">Wrong/Defective Return Rate</p>
              <p className="text-lg font-bold" style={{ color: rateColor(overview.wrongDefectiveRate).color }}>
                {overview.wrongDefectiveRate}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">ConstructEzy Price Return Rate</p>
              <p className="text-lg font-bold" style={{ color: rateColor(overview.constructEzyRate).color }}>
                {overview.constructEzyRate}%
              </p>
            </div>
          </div>
        </div>
        <div className="border rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">RTO Approved Claims</p>
          <p className="text-lg font-bold text-gray-900">
            We approved {overview.totalClaimsApproved} out of {overview.totalClaimsRaised} claims raised by you
          </p>
        </div>
      </div>

      {/* Product Performance */}
      <h3 className="font-semibold text-gray-900 mb-3">Product Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500 text-xs uppercase">
              <th className="py-2 pr-4">Product Details</th>
              <th className="py-2 pr-4">Orders Delivered</th>
              <th className="py-2 pr-4">Customer Return</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2">What Changed</th>
            </tr>
          </thead>
          <tbody>
            {overview.products.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No products yet.</td></tr>
            )}
            {overview.products.map((p) => (
              <tr key={p.productId} className="border-b last:border-0">
                <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0 rounded-md border overflow-hidden bg-white">
                    <Image
                      src={p.image || '/placeholder.png'}
                      alt={p.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="font-medium truncate">{p.name}</span>
                </div>
              </td>
                <td className="py-3 pr-4">{p.ordersDelivered}</td>
                <td className="py-3 pr-4">
                  {p.customerReturnRate}%
                  <span className="text-xs text-gray-400 block">{p.customerReturn} Returns</span>
                </td>
                <td className="py-3 pr-4">
                  <button className="text-xs font-medium border rounded-lg px-3 py-1.5 hover:bg-gray-50">View Details</button>
                </td>
                <td className="py-3 text-gray-400">N/A</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ══════════════════════ RETURN TRACKING TAB ══════════════════════ */
const TRACKING_META = {
  requested:        { label: 'Requested',         color: '#f97316', bg: '#fff7ed' },
  approved:         { label: 'Approved',          color: '#3b82f6', bg: '#eff6ff' },
  rejected:         { label: 'Rejected',          color: '#ef4444', bg: '#fef2f2' },
  picked_up:        { label: 'Picked Up',         color: '#8b5cf6', bg: '#f5f3ff' },
  in_transit:       { label: 'In Transit',        color: '#0ea5e9', bg: '#f0f9ff' },
  reached_warehouse:{ label: 'Reached Warehouse', color: '#6366f1', bg: '#eef2ff' },
  refunded:         { label: 'Refunded',          color: '#10b981', bg: '#ecfdf5' },
}

const ReturnTrackingTab = () => {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/shopowner/returns/tracking')
      .then(({ data }) => setReturns(data.data || []))
      .catch(() => setReturns([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500 text-xs uppercase">
            <th className="py-2 pr-4">Order ID</th>
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Courier</th>
            <th className="py-2">Tracking Status</th>
          </tr>
        </thead>
        <tbody>
          {returns.length === 0 && (
            <tr><td colSpan={5} className="py-8 text-center text-gray-400">No returns to track yet.</td></tr>
          )}
          {returns.map((r) => {
            const meta = TRACKING_META[r.trackingStatus] || TRACKING_META.requested
            return (
              <tr key={r._id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium">{r.orderId}</td>
                <td className="py-3 pr-4">{r.productName}</td>
                <td className="py-3 pr-4">{r.customerName}</td>
                <td className="py-3 pr-4">{r.courierPartner?.name || '—'}</td>
                <td className="py-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════ CLAIM TRACKING TAB ══════════════════════ */
const CLAIM_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Reject' },
]

const CLAIM_STATUS_META = {
  open: { label: 'Open', color: '#f97316', bg: '#fff7ed' },
  approved: { label: 'Approved', color: '#10b981', bg: '#ecfdf5' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
}

const ClaimTrackingTab = () => {
  const [filter, setFilter] = useState('all')
  const [claims, setClaims] = useState([])
  const [counts, setCounts] = useState({ all: 0, open: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  const fetchClaims = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/shopowner/claims?status=${filter}`)
      setClaims(data.data.claims || [])
      setCounts(data.data.counts || {})
    } catch {
      setClaims([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchClaims() }, [fetchClaims])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {CLAIM_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              filter === f.key ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label} ({counts[f.key] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 text-xs uppercase">
                <th className="py-2 pr-4">Order ID</th>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Claim Reason</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Raised On</th>
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No claims in this category.</td></tr>
              )}
              {claims.map((c) => {
                const meta = CLAIM_STATUS_META[c.status] || CLAIM_STATUS_META.open
                return (
                  <tr key={c._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.return?.orderId || '—'}</td>
                    <td className="py-3 pr-4">{c.return?.productName || '—'}</td>
                    <td className="py-3 pr-4 max-w-[220px] truncate">{c.reason}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════ COURIER PARTNER TAB ══════════════════════ */
const CourierPartnerTab = () => {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/courier-partner/list')
      .then(({ data }) => setPartners(data.data || []))
      .catch(() => setPartners([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="grid md:grid-cols-[1fr_320px] gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Customer Return Courier Partner Preference</h3>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-4">
            <li>Decide the courier partner based on the details given below in the table</li>
            <li>Use set preference to define your sequence of preferred courier partners</li>
            <li>Returns will be done using your defined preferred courier partner from this list, depending on their availability and capacity determined by ConstructEzy</li>
          </ul>
        </div>
        <div className="border rounded-2xl overflow-hidden flex items-center justify-center bg-gray-50 aspect-video">
          <a
            href="https://www.youtube.com/results?search_query=how+courier+return+works"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 text-gray-400 hover:text-red-500"
          >
            <Youtube size={32} />
            <span className="text-xs font-medium">How to Manage Courier Partners</span>
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">My Courier Partners for Customer Returns</h3>
        <div className="flex gap-2">
          <button className="text-xs font-medium border rounded-lg px-3 py-1.5 hover:bg-gray-50">View Rate Card</button>
          <button className="text-xs font-medium bg-orange-500 text-white rounded-lg px-3 py-1.5 hover:bg-orange-600">Edit My Choice</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 text-xs uppercase">
                <th className="py-2 pr-4">Preference</th>
                <th className="py-2 pr-4">Courier Partner</th>
                <th className="py-2 pr-4">Reverse Shipping Charges</th>
                <th className="py-2 pr-4">Avg Return Time (Days)</th>
                <th className="py-2 pr-4">Claims Raised</th>
                <th className="py-2">Claim Approval %</th>
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">
                  No courier partners configured yet. Ask Admin to add courier partners.
                </td></tr>
              )}
              {partners.map((p, i) => (
                <tr key={p._id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">
                    {['1st', '2nd', '3rd', '4th', '5th'][i] || `${i + 1}th`} Choice
                  </td>
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <Truck size={14} className="text-gray-400" />
                    {p.name}
                  </td>
                  <td className="py-3 pr-4">₹{p.reverseShippingCharge} for 1st 500gm</td>
                  <td className="py-3 pr-4">{p.avgReturnTimeDays}</td>
                  <td className="py-3 pr-4">{p.claimsRaised}</td>
                  <td className="py-3">{p.approvalPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ShopOwnerReturnsPage