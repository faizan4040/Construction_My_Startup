'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import useFetch from "@/hooks/useFetch"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import Image from "next/image"
import { IMAGES } from "@/routes/AllImages"

const StockOverview = () => {
  const { data, loading } = useFetch("/api/dashboard/admin/stock-overview")

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center text-muted-foreground">
        Loading stock data...
      </div>
    )
  }

  const stockTable = data?.data?.stockTable || []
  const mostSold = data?.data?.mostSold || []

  // Status badge renderer
  const renderStatus = (status) => {
    if (status === "Out of Stock") {
      return (
        <Badge className="bg-red-600 text-white flex items-center gap-1">
          <XCircle size={14} /> Out of Stock
        </Badge>
      )
    }

    if (status === "Low Stock") {
      return (
        <Badge className="bg-yellow-500 text-black flex items-center gap-1 animate-pulse">
          <AlertTriangle size={14} /> Low Stock
        </Badge>
      )
    }

    return (
      <Badge className="bg-green-600 text-white flex items-center gap-1">
        <CheckCircle size={14} /> In Stock
      </Badge>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* STOCK TABLE */}
      <Card className="xl:col-span-2 rounded-2xl shadow-sm h-full">
        <CardHeader className="border-b ">
          <CardTitle>Product Stock Overview</CardTitle>
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
                {stockTable.map(row => (
                  <TableRow key={row.variantId}>
                    <TableCell>
                  <div className="flex items-center gap-3">
                   <Image
                      src={row.image || IMAGES.product_placeholder}
                      width={56}
                      height={56}
                      className="rounded-lg border object-cover"
                      alt={row.productName}
                    />
                    <div>
                      <p className="font-medium">{row.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {row.sku}
                      </p>
                    </div>
                  </div>
                </TableCell>

                    <TableCell className="font-mono text-xs">
                      {row.sku}
                    </TableCell>

                    <TableCell className="text-center">
                      {row.totalSold}
                    </TableCell>

                    <TableCell className="text-center">
                      {row.remainingStock}
                    </TableCell>

                    <TableCell>
                      {renderStatus(row.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MOST SOLD */}
      <Card className="rounded-2xl shadow-sm h-full">
        <CardHeader className="border-b">
          <CardTitle>Most Sold Products</CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-3 max-h-112.5 overflow-y-auto">
          {mostSold.length ? (
            mostSold.map(item => (
              <div
                key={item.variantId}
                className="flex justify-between items-center p-3 rounded-xl bg-muted"
              >
                {/* LEFT: Image + Product Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative shrink-0">
                    <Image
                      src={item.image || IMAGES.product_placeholder}
                      alt={item.productName}
                      fill
                      className="rounded-lg border object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                </div>

                {/* RIGHT: Sold Badge */}
                <Badge className="bg-orange-500 text-white">
                  {item.totalSold} Sold
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No sales data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default StockOverview