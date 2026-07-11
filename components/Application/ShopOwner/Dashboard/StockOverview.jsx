'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useFetch from "@/hooks/useFetch"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import Image from "next/image"
import { IMAGES } from "@/routes/AllImages"
import { useMemo } from "react"

// signature element: semi-circular stock-health gauge
const StockGauge = ({ healthy, low, out }) => {
  const total = healthy + low + out || 1
  const R = 80
  const CX = 100
  const CY = 100
  const circumference = Math.PI * R // half circle

  const healthyLen = (healthy / total) * circumference
  const lowLen = (low / total) * circumference
  const outLen = (out / total) * circumference

  const healthyPct = Math.round((healthy / total) * 100)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-56">
        {/* track */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
        {/* healthy arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#22c55e"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${healthyLen} ${circumference}`}
        />
        {/* low arc, offset after healthy */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${lowLen} ${circumference}`}
          strokeDashoffset={-healthyLen}
        />
        {/* out arc, offset after healthy+low */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#ef4444"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${outLen} ${circumference}`}
          strokeDashoffset={-(healthyLen + lowLen)}
        />
        <text x="100" y="92" textAnchor="middle" className="fill-foreground font-bold" style={{ fontSize: "28px" }}>
          {healthyPct}%
        </text>
        <text x="100" y="108" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "11px" }}>
          stock healthy
        </text>
      </svg>

      <div className="flex gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {healthy} healthy</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> {low} low</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> {out} out</span>
      </div>
    </div>
  )
}

const StockOverview = () => {
  const { data, loading } = useFetch("/api/shopowner/dashboard/stock-overview")

  const stockTable = data?.data?.stockTable || []
  const mostSold = data?.data?.mostSold || []

  const { healthy, low, out } = useMemo(() => {
    return stockTable.reduce(
      (acc, row) => {
        if (row.status === "Out of Stock") acc.out += 1
        else if (row.status === "Low Stock") acc.low += 1
        else acc.healthy += 1
        return acc
      },
      { healthy: 0, low: 0, out: 0 }
    )
  }, [stockTable])

  if (loading) {
    return <div className="h-full w-full flex justify-center items-center text-muted-foreground text-sm">Loading stock data...</div>
  }

  const renderStatus = (status) => {
    if (status === "Out of Stock") return <Badge className="bg-red-600 text-white flex items-center gap-1"><XCircle size={14} /> Out of Stock</Badge>
    if (status === "Low Stock") return <Badge className="bg-yellow-500 text-black flex items-center gap-1 animate-pulse"><AlertTriangle size={14} /> Low Stock</Badge>
    return <Badge className="bg-green-600 text-white flex items-center gap-1"><CheckCircle size={14} /> In Stock</Badge>
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card className="xl:col-span-2 rounded-2xl sm:rounded-3xl shadow-sm h-full border-gray-200/70 overflow-hidden">
        <div className="h-1.5 bg-rose-500" />
        <CardHeader className="border-b pt-4">
          <p className="text-xs text-gray-400 font-medium">Warehouse</p>
          <CardTitle>Your Product Stock</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="max-h-112.5 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Sold</TableHead>
                  <TableHead className="text-center">Stock qty</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockTable.map((row) => (
                  <TableRow key={row.variantId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image src={row.image || IMAGES.product_placeholder} width={48} height={48} className="rounded-lg border object-cover" alt={row.productName} />
                        <div>
                          <p className="font-medium text-sm">{row.productName}</p>
                          <p className="text-xs text-muted-foreground">SKU: {row.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                    <TableCell className="text-center">{row.totalSold}</TableCell>
                    <TableCell className="text-center">{row.remainingStock}</TableCell>
                    <TableCell>{renderStatus(row.status)}</TableCell>
                  </TableRow>
                ))}
                {!stockTable.length && (
                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No variants yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl sm:rounded-3xl shadow-sm h-full border-gray-200/70 overflow-hidden">
        <div className="h-1.5 bg-rose-500" />
        <CardHeader className="border-b pt-4">
          <p className="text-xs text-gray-400 font-medium">Health Check</p>
          <CardTitle>Stock at a Glance</CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex flex-col items-center gap-6">
          <StockGauge healthy={healthy} low={low} out={out} />

          <div className="w-full">
            <p className="text-xs font-semibold text-gray-500 mb-2">Top Sellers</p>
            <div className="space-y-2">
              {mostSold.length ? mostSold.slice(0, 4).map((item) => (
                <div key={item.variantId} className="flex justify-between items-center p-2.5 rounded-xl bg-muted">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 relative shrink-0">
                      <Image src={item.image || IMAGES.product_placeholder} alt={item.productName} fill className="rounded-lg border object-cover" unoptimized />
                    </div>
                    <p className="text-xs font-medium truncate">{item.productName}</p>
                  </div>
                  <Badge className="bg-orange-500 text-white text-[10px] shrink-0">{item.totalSold} sold</Badge>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">No sales data yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StockOverview