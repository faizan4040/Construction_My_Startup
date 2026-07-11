"use client"

import { useEffect, useMemo, useState } from "react"
import { Pie, PieChart, Sector, Label } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LatestReview from "./LatestReview"
import MapOverview from "./MapOverview"
import useFetch from "@/hooks/useFetch"

const chartConfig = {
  status: { label: "Status" },
  pending: { label: "Pending", color: "#f97316" },
  processing: { label: "Processing", color: "#fbbf24" },
  shipped: { label: "Shipped", color: "#06b6d4" },
  delivered: { label: "Delivered", color: "#22c55e" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  unverified: { label: "Unverified", color: "#a855f7" },
}

const OrderStatus = () => {
  const id = "shop-order-status-pie"
  const [chartData, setChartData] = useState([])
  const [activeStatus, setActiveStatus] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  const { data, loading } = useFetch("/api/shopowner/dashboard/order-status")

  useEffect(() => {
    if (data?.success) {
      const formatted = data.data.map((item) => ({
        status: item._id,
        count: item.count,
        fill: chartConfig[item._id]?.color || "#9ca3af",
      }))
      setChartData(formatted)
      setActiveStatus(formatted[0]?.status || null)
      setTotalCount(formatted.reduce((sum, i) => sum + i.count, 0))
    }
  }, [data])

  const activeIndex = useMemo(() => chartData.findIndex((i) => i.status === activeStatus), [activeStatus, chartData])

  if (loading) return <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="flex flex-col rounded-2xl sm:rounded-3xl shadow-sm border-gray-200/70 overflow-hidden">
        <div className="h-1.5 bg-orange-500" />
        <ChartStyle id={id} config={chartConfig} />
        <CardHeader className="flex-row items-start justify-between pt-4">
          <div>
            <p className="text-xs text-gray-400 font-medium">Pipeline</p>
            <CardTitle>Your Order Status</CardTitle>
            <CardDescription>Total: {totalCount}</CardDescription>
          </div>
          <Select value={activeStatus} onValueChange={setActiveStatus}>
            <SelectTrigger className="h-7 w-36"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent align="end">
              {chartData.map((item) => (
                <SelectItem key={item.status} value={item.status}>{chartConfig[item.status]?.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex justify-center">
          {!chartData.length ? (
            <div className="py-10 text-sm text-muted-foreground">No orders yet</div>
          ) : (
            <ChartContainer id={id} config={chartConfig} className="aspect-square w-full max-w-65">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="count"
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={activeIndex}
                  activeShape={({ outerRadius = 0, ...props }) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 10} />
                      <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                    </g>
                  )}
                >
                  <Label
                    content={({ viewBox }) =>
                      viewBox?.cx && (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan className="text-3xl font-bold fill-foreground">{chartData[activeIndex]?.count || 0}</tspan>
                          <tspan x={viewBox.cx} dy={24} className="fill-muted-foreground text-sm">
                            {chartConfig[activeStatus]?.label}
                          </tspan>
                        </text>
                      )
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <MapOverview />
      <LatestReview />
    </div>
  )
}

export default OrderStatus