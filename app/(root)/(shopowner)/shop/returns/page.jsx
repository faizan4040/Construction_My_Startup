'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { Loader2, Mail, Truck } from 'lucide-react'
import { Tabs, Tab } from '@mui/material'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { SHOP_OWNER_DASHBOARD } from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Return/RTO Orders' },
]

const TABS = ['Overview', 'Return Tracking', 'Claim Tracking', 'Courier Partner']

const ShopOwnerReturnsPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [overview, setOverview] = useState(null)
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOverview = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/shopowner/returns/overview')
      setOverview(data.data)
    } catch {}
  }, [])

  const fetchReturns = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/shopowner/returns/list')
      setReturns(data.data)
    } catch {}
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchOverview(), fetchReturns()]).finally(() => setLoading(false))
  }, [fetchOverview, fetchReturns])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold text-gray-900">Return/RTO Orders</h1>
      </div>

      <Card className="rounded-3xl shadow-sm overflow-hidden py-0 gap-0 mt-4">
        <div className="border-b bg-gray-50/60 px-4 pt-3">
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="scrollable" scrollButtons="auto">
            {TABS.map((t, i) => <Tab key={t} label={t} />)}
          </Tabs>
        </div>

        <CardContent className="p-5">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : (
            <>
              {activeTab === 0 && <OverviewTab overview={overview} />}
              {activeTab === 1 && <ReturnTrackingTab returns={returns} />}
              {activeTab === 2 && <ClaimTrackingTab />}
              {activeTab === 3 && <CourierPartnerTab />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ══ Overview: summary + Product Performance table ══
const OverviewTab = ({ overview }) => {
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  if (!overview) return <p className="text-sm text-gray-400">No data available.</p>

  let products = [...overview.products]
  if (sortBy === 'recent') products.sort((a, b) => new Date(b.lastReturnAt || 0) - new Date(a.lastReturnAt || 0))
  if (sortBy === 'most_returns') products.sort((a, b) => b.customerReturn - a.customerReturn)

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">Customer Return Rate</p>
          <p className="text-2xl font-bold text-orange-600">{overview.customerReturnRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{overview.totalReturns} returns out of {overview.totalDelivered} delivered</p>
        </div>
        <div className="border rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Returns</p>
          <p className="text-2xl font-bold text-gray-900">{overview.totalReturns}</p>
        </div>
      </div>

      {/* Product Performance header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Product Performance</h3>
        </div>
        <div className="flex items-center gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5">
            <option value="all">All Categories</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5">
            <option value="recent">Most Recent Return</option>
            <option value="most_returns">Most Returns</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
            {products.map((p) => (
              <tr key={p.productId} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 rounded-md border overflow-hidden bg-white">
                      <Image src={p.image || '/placeholder.png'} alt={p.name} fill sizes="48px" className="object-cover" unoptimized />
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

// ══ Return Tracking: simple list, email-based follow-up for now ══
const ReturnTrackingTab = ({ returns }) => (
  <div>
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <Mail size={14} />
      Return updates are also sent to the customer's registered email — this table is for your quick reference.
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500 text-xs uppercase">
            <th className="py-2 pr-4">Order ID</th>
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Reason</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2">Requested On</th>
          </tr>
        </thead>
        <tbody>
          {returns.length === 0 && (
            <tr><td colSpan={6} className="py-8 text-center text-gray-400">No return requests yet.</td></tr>
          )}
          {returns.map((r) => (
            <tr key={r._id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{r.orderId}</td>
              <td className="py-3 pr-4">{r.productName}</td>
              <td className="py-3 pr-4">{r.customerName}</td>
              <td className="py-3 pr-4 max-w-[200px] truncate">{r.reason}</td>
              <td className="py-3 pr-4">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-700 capitalize">{r.status}</span>
              </td>
              <td className="py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

// ══ Claim Tracking: placeholder, simple ══
const ClaimTrackingTab = () => (
  <div className="text-center py-16 text-gray-400">
    <p className="text-sm">No claims raised yet. Claims from courier disputes will appear here.</p>
  </div>
)

// ══ Courier Partner: placeholder, simple ══
const CourierPartnerTab = () => (
  <div className="text-center py-16 text-gray-400">
    <Truck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
    <p className="text-sm">Courier partner preferences for returns will be configurable here once integrated.</p>
  </div>
)

export default ShopOwnerReturnsPage