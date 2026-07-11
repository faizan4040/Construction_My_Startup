"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import useFetch from "@/hooks/useFetch"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const filterData = (data, range) => {
  if (range === "1M") return data.slice(-1)
  if (range === "6M") return data.slice(-6)
  return data
}

const chartConfig = {
  amount: { label: "Revenue", color: "#f97316" },
  click: { label: "Orders", color: "#22c55e" },
}

export function OrderOverview() {
  const [activeRange, setActiveRange] = useState("All")
  const [chartData, setChartData] = useState([])
  const { data: monthlySales, loading } = useFetch("/api/shopowner/dashboard/monthly-sales")

  useEffect(() => {
    if (!monthlySales?.success) return
    const formatted = MONTHS.map((month, index) => {
      const monthData = monthlySales.data.find((item) => item._id.month === index + 1)
      return {
        month,
        amount: monthData ? monthData.totalSales : 0,
        click: monthData ? monthData.orders : 0,
      }
    })
    setChartData(formatted)
  }, [monthlySales])

  const filteredChartData = useMemo(() => filterData(chartData, activeRange), [chartData, activeRange])

  return (
    <Card className="h-full flex flex-col rounded-2xl sm:rounded-3xl border-gray-200/70 shadow-sm overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" />
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">Site Ledger</p>
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">Your Shop's Performance</div>
        </div>
        <div className="flex gap-1 text-xs font-medium">
          {["All", "1M", "6M", "1Y"].map((item) => (
            <button
              key={item}
              onClick={() => setActiveRange(item)}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeRange === item
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
        ) : !filteredChartData.length ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No sales data yet</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-65 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="#f97316" radius={4} barSize={16} />
                <Line type="monotone" dataKey="click" stroke="#22c55e" strokeWidth={2} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="flex justify-center gap-8 text-sm border-t pt-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-muted-foreground">Revenue (₹)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Orders</span>
        </div>
      </CardFooter>
    </Card>
  )
}