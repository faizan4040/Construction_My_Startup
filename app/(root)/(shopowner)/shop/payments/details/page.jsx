'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Search, Loader2, FileSpreadsheet } from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SHOP_OWNER_DASHBOARD } from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '/shop/payments', label: 'Payment' },
  { href: '', label: 'Payment to Date' },
]

const STATUS_META = {
  on_hold: { label: 'On Hold', color: '#f97316', bg: '#fff7ed' },
  eligible: { label: 'Eligible', color: '#3b82f6', bg: '#eff6ff' },
  paid_out: { label: 'Paid', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
}

const formatINR = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`

const PaymentDetailsPage = () => {
  const [search, setSearch] = useState('')
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/shopowner/payments/list?search=${search}`)
      setTransactions(data.data.transactions)
      setSummary(data.data.summary)
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300)
    return () => clearTimeout(timeout)
  }, [fetchData])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Payment to Date</h1>
        <a href="/api/shopowner/payments/export" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
          <FileSpreadsheet size={16} /> Payment Excel
        </a>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Order / Sub-Order No." className="pl-9 rounded-xl h-11" />
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="border rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total Net Order Amount</p>
            <p className="text-lg font-bold text-gray-900">{formatINR(summary.totalNetOrderAmount)}</p>
          </div>
          <div className="border rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total Net Platform Recovery</p>
            <p className="text-lg font-bold text-red-600">-{formatINR(summary.totalNetPlatformRecovery)}</p>
          </div>
          <div className="border rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total Net Platform Compensation</p>
            <p className="text-lg font-bold text-green-600">+{formatINR(summary.totalNetPlatformCompensation)}</p>
          </div>
          <div className="border rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">{formatINR(summary.totalAmount)}</p>
          </div>
        </div>
      )}

      <Card className="rounded-3xl shadow-sm">
        <CardContent className="p-5">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 text-xs uppercase">
                    <th className="py-2 pr-4">Payment Date</th>
                    <th className="py-2 pr-4">Order Amount</th>
                    <th className="py-2 pr-4">Platform Recovery</th>
                    <th className="py-2 pr-4">Platform Compensation</th>
                    <th className="py-2 pr-4">Net Amount</th>
                    <th className="py-2 pr-4">Payment Details</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-gray-400">No payment records found.</td></tr>
                  )}
                  {transactions.map((t) => {
                    const meta = STATUS_META[t.status] || STATUS_META.on_hold
                    return (
                      <tr key={t._id} className="border-b last:border-0">
                        <td className="py-3 pr-4">{t.paidOutAt ? new Date(t.paidOutAt).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="py-3 pr-4">{formatINR(t.grossAmount)}</td>
                        <td className="py-3 pr-4 text-red-600">-{formatINR(t.platformRecovery)}</td>
                        <td className="py-3 pr-4 text-green-600">+{formatINR(t.platformCompensation)}</td>
                        <td className="py-3 pr-4 font-semibold">{formatINR(t.netAmount)}</td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <Link href={`/shop/payments/statement/${t._id}`} className="text-xs font-medium border rounded-lg px-3 py-1.5 hover:bg-gray-50 inline-block">
                            View Detail
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentDetailsPage