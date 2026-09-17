'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Loader2, FileSpreadsheet } from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { SHOP_OWNER_DASHBOARD } from '@/routes/ShopOwnerPanelRoute'

const formatINR = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`

const StatementPage = () => {
  const { id } = useParams()
  const [txn, setTxn] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/shopowner/payments/statement/${id}`)
      .then(({ data }) => setTxn(data.data))
      .catch(() => setTxn(null))
      .finally(() => setLoading(false))
  }, [id])

  const breadcrumbData = [
    { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
    { href: '/shop/payments', label: 'Payment' },
    { href: '/shop/payments/details', label: 'Payment to Date' },
    { href: '', label: 'Statement' },
  ]

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  if (!txn) return <div className="text-center py-32 text-gray-400">Statement not found.</div>

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {txn.paidOutAt ? new Date(txn.paidOutAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending'}
        </h1>
        <a href="/api/shopowner/payments/export" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
          <FileSpreadsheet size={16} /> Payment Excel
        </a>
      </div>

      <Card className="rounded-3xl shadow-sm mb-4">
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">NEFT/UTR</span>
            <span className="font-medium">{txn.utr || 'Pending'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payout Mode</span>
            <span className="font-medium">{txn.payoutMode || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment ID</span>
            <span className="font-medium break-all">{txn.payoutId || '—'}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">Sub Total Net Order Amount</p>
              <p className="font-bold text-gray-900">{formatINR(txn.grossAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Net Platform Recovery</p>
              <p className="font-bold text-red-600">-{formatINR(txn.platformRecovery)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Net Platform Compensation</p>
              <p className="font-bold text-green-600">+{formatINR(txn.platformCompensation)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="font-bold text-gray-900">{formatINR(txn.netAmount)}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 text-xs uppercase">
                <th className="py-2 pr-4">Order ID</th>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2">Delivered On</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 pr-4 font-medium">{txn.orderId}</td>
                <td className="py-3 pr-4">{txn.productName}</td>
                <td className="py-3 pr-4">{txn.qty}</td>
                <td className="py-3">{new Date(txn.deliveredAt).toLocaleDateString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatementPage