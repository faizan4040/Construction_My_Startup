"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Pie, PieChart, Sector, Label } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import LatestReview from "./LatestReview"
import MapOverview from "./MapOverview"
import useFetch from "@/hooks/useFetch"

/* ------------------ CHART CONFIG ------------------ */
const chartConfig = {
  status: { label: "Status" },
  pending: { label: "Pending", color: "var(--chart-1)" },
  processing: { label: "Processing", color: "var(--chart-2)" },
  shipped: { label: "Shipped", color: "var(--chart-3)" },
  delivered: { label: "Delivered", color: "var(--chart-4)" },
  cancelled: { label: "Cancelled", color: "var(--chart-5)" },
  unverified: { label: "Unverified", color: "var(--chart-6)" },
}

/* ------------------ COMPONENT ------------------ */
const OrderStatus = () => {
  const id = "order-status-pie"

  const [chartData, setChartData] = useState([])
  const [activeStatus, setActiveStatus] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  const { data, loading } = useFetch(
    "/api/dashboard/admin/order-status"
  )

  /* ---------- API DATA → CHART DATA ---------- */
  useEffect(() => {
    if (data?.success) {
      const formatted = data.data.map((item) => ({
        status: item._id,
        count: item.count,
        fill: `var(--color-${item._id})`,
      }))

      setChartData(formatted)
      setActiveStatus(formatted[0]?.status || null)

      const total = formatted.reduce(
        (sum, i) => sum + i.count,
        0
      )
      setTotalCount(total)
    }
  }, [data])

  /* ---------- ACTIVE INDEX ---------- */
  const activeIndex = useMemo(
    () => chartData.findIndex((i) => i.status === activeStatus),
    [activeStatus, chartData]
  )

  /* ---------- LOADING ---------- */
  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-12">
      
      {/* ================= PIE CHART ================= */}
      <Card className="flex flex-col">
        <ChartStyle id={id} config={chartConfig} />

        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Total Orders: {totalCount}</CardDescription>
          </div>

          <Select value={activeStatus} onValueChange={setActiveStatus}>
            <SelectTrigger className="h-7 w-36">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent align="end">
              {chartData.map((item) => (
                <SelectItem key={item.status} value={item.status}>
                  {chartConfig[item.status]?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex justify-center">
          <ChartContainer
            id={id}
            config={chartConfig}
            className="aspect-square w-full max-w-65"
          >
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
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) =>
                    viewBox?.cx && (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan className="text-3xl font-bold fill-foreground">
                          {chartData[activeIndex]?.count || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          dy={24}
                          className="fill-muted-foreground text-sm"
                        >
                          {chartConfig[activeStatus]?.label}
                        </tspan>
                      </text>
                    )
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ================= MAP ================= */}
      <MapOverview />

      {/* ================= TABLE ================= */}
      <LatestReview />
    </div>
  )
}

export default OrderStatus
