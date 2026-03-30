"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import useFetch from "@/hooks/useFetch"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

// FILTER LOGIC
const filterData = (data, range) => {
  if (range === "1M") return data.slice(-1)
  if (range === "6M") return data.slice(-6)
  if (range === "1Y" || range === "All") return data
  return data
}

// CHART CONFIG
const chartConfig = {
  amount: { label: "Page View", color: "var(--chart-1)" },
  click: { label: "Click", color: "#22c55e" },
}

export function OrderOverview() {
  const [activeRange, setActiveRange] = useState("All")
  const [chartData, setChartData] = useState([])

  const { data: monthlySales, loading } =
    useFetch("/api/dashboard/admin/monthly-sales")

  // 🔁 Build Jan–Dec data from API
  useEffect(() => {
    if (!monthlySales?.success) return

    const formatted = MONTHS.map((month, index) => {
      const monthData = monthlySales.data.find(
        (item) => item._id.month === index + 1
      )

      return {
        month,
        amount: monthData ? monthData.totalSales : 0,
        click: monthData ? monthData.orders : 0,
      }
    })

    setChartData(formatted)
  }, [monthlySales])

  // 🔍 Apply filters
  const filteredChartData = useMemo(() => {
    return filterData(chartData, activeRange)
  }, [chartData, activeRange])

  return (
    <Card className="h-full flex flex-col">
      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="text-sm font-semibold">Performance</div>

        <div className="flex gap-4 text-sm font-medium text-muted-foreground">
          {["All", "1M", "6M", "1Y"].map((item) => (
            <button
              key={item}
              onClick={() => setActiveRange(item)}
              className={`px-2 py-1 rounded-lg transition ${
                activeRange === item
                  ? "text-primary"
                  : "bg-gray-200 hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </CardHeader>

      {/* CHART */}
      <CardContent className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : !filteredChartData.length ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No sales data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-65 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                <Bar
                  dataKey="amount"
                  fill="var(--color-amount)"
                  radius={3}
                  barSize={18}
                />

                <Line
                  type="monotone"
                  dataKey="click"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-muted-foreground">Page View</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Click</span>
        </div>
      </CardFooter>
    </Card>
  )
}
