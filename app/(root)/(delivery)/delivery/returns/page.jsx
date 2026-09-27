'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Search, RotateCcw, Loader2 } from 'lucide-react'
import { showToast } from '@/lib/showToast'

const statusColors = {
  approved: 'bg-blue-50 text-blue-700',
  picked_up: 'bg-purple-50 text-purple-700',
  in_transit: 'bg-orange-50 text-orange-700',
}

const DeliveryReturnsPage = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReturns = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/delivery/returns?q=${encodeURIComponent(q)}`)
      if (data.success) setReturns(data.data)
      else showToast('error', data.message)
    } catch {
      showToast('error', 'Failed to load returns.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReturns() }, [fetchReturns])

  useEffect(() => {
    const timer = setTimeout(() => fetchReturns(query), 400)
    return () => clearTimeout(timer)
  }, [query, fetchReturns])

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw className="w-5 h-5 text-orange-600" />
        <h2 className="text-lg font-semibold">Return Pickups</h2>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by customer name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}

      {!loading && returns.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No return pickups assigned.</p>
      )}

      <div className="space-y-3">
        {returns.map((r) => (
          <button
            key={r._id}
            onClick={() => router.push(`/delivery/returns/${r._id}`)}
            className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-start mb-1">
              <p className="font-medium text-sm">{r.customerName}</p>
              <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${statusColors[r.trackingStatus] || 'bg-gray-100 text-gray-600'}`}>
                {r.trackingStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-1">{r.productName} × {r.qty}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Order #{r.orderId}</span>
              <span>·</span>
              <span className="capitalize">{r.reasonCategory === 'wrong_defective' ? 'Wrong/Defective' : 'Other'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DeliveryReturnsPage