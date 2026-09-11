"use client"

import { useMemo, useState } from "react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { useShopDashboard } from "@/contexts/ShopDashboardContext"

const RANGES = ["ALL", "1M", "6M", "1Y"]

const PerformanceChart = () => {
  const { data, loading } = useShopDashboard()
  const [range, setRange] = useState("1Y")

  const chartData = data?.performance || []

  const filtered = useMemo(() => {
    if (range === "1M") return chartData.slice(-1)
    if (range === "6M") return chartData.slice(-6)
    return chartData
  }, [chartData, range])

  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Performance</h2>
        <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">Loading chart...</div>
        ) : !filtered.length ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">No performance data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filtered} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} barSize={18} name="Orders" />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-5 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /> Orders</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> Revenue</span>
      </div>
    </div>
  )
}

export default PerformanceChart