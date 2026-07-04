'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const StatCard = ({ label, value, prefix = '' }) => (
  <Card className="rounded-2xl shadow-sm">
    <CardContent className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{prefix}{value}</p>
    </CardContent>
  </Card>
)

const ShopDashboard = () => {
  const [stats, setStats] = useState(null)
  const [earnings, setEarnings] = useState([])
  const [groupBy, setGroupBy] = useState('daily')
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/shopowner/dashboard/stats')
      if (data.success) setStats(data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchEarnings = async (period) => {
    try {
      const { data } = await axios.get(`/api/shopowner/dashboard/earnings?groupBy=${period}`)
      if (data.success) setEarnings(data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStats(), fetchEarnings(groupBy)]).finally(() => setLoading(false))
  }, [groupBy])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Shop Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earning" value={stats?.totalEarning?.toLocaleString() ?? '—'} prefix="₹" />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? '—'} />
        <StatCard label="Units Sold" value={stats?.totalUnitsSold ?? '—'} />
        <StatCard label="Total Products" value={stats?.totalProducts ?? '—'} />
      </div>

      {stats?.lowStockCount > 0 && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-sm text-orange-700">
          ⚠ {stats.lowStockCount} variant(s) are low on stock.
        </div>
      )}

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <h4 className="text-lg font-semibold">Earnings Trend</h4>
          <div className="flex gap-2">
            {['daily', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setGroupBy(p)}
                className={`px-3 py-1 rounded-md text-sm border ${
                  groupBy === p ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {p === 'daily' ? 'Daily' : 'Monthly'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <div className="h-full w-full bg-gray-100 rounded-xl animate-pulse" />
          ) : earnings.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(val) => [`₹${val}`, 'Earning']} />
                <Line type="monotone" dataKey="totalEarning" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ShopDashboard






















// import React from 'react'

// const ShopDashboard = () => {
//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Shop Dashboard</h1>
//       {/* Add your shop dashboard components here */}
//     </div>
//   )
// }

// export default ShopDashboard