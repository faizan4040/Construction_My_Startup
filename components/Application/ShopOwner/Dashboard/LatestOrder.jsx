'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useFetch from "@/hooks/useFetch"
import { statusBadge } from "@/lib/helperfunction"
import { IMAGES } from "@/routes/AllImages"
import Image from "next/image"
import { useEffect, useState } from "react"

const LatestOrder = () => {
  const [latestOrder, setLatestOrder] = useState([])
  const { data, loading } = useFetch("/api/shopowner/dashboard/latest-order")

  useEffect(() => {
    if (data?.success) setLatestOrder(data.data)
  }, [data])

  if (loading) return <div className="h-full w-full flex justify-center items-center text-sm text-muted-foreground">Loading...</div>

  if (!latestOrder.length) {
    return (
      <Card className="rounded-2xl sm:rounded-3xl shadow-sm h-full flex items-center justify-center border-gray-200/70 overflow-hidden">
        <div className="h-1.5 bg-orange-500 absolute top-0 w-full" />
        <Image src={IMAGES.logo} alt="No Orders" width={100} height={100} />
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl sm:rounded-3xl shadow-sm h-full bg-background border-gray-200/70 overflow-hidden">
      <div className="h-1.5 bg-orange-500" />
      <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Site Ledger</p>
          <CardTitle className="text-lg font-semibold tracking-tight">Your Recent Orders</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">last {latestOrder.length}</span>
      </CardHeader>

      <CardContent className="p-4">
        <div className="relative max-h-80 overflow-y-auto">
          <Table className="table-fixed w-full">
            <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
              <TableRow>
                <TableHead className="w-[36%]">Product</TableHead>
                <TableHead className="w-[22%]">Order ID</TableHead>
                <TableHead className="w-[18%]">Payment ID</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[12%] text-right pr-6">Your Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestOrder.map((order, index) => {
                const product = order.products?.[0]
                const rawImage =
                  product?.variantId?.media?.[0]?.secure_url ||
                  product?.variantId?.media?.[0]?.url ||
                  product?.variantId?.media?.[0]?.path || null

                const finalImage = rawImage
                  ? (rawImage.startsWith("http") ? rawImage : `${process.env.NEXT_PUBLIC_API_URL}${rawImage}`)
                  : IMAGES.image_placeholder

                const productName = product?.productId?.name || "Product"
                const sku = product?.variantId?.sku || "SKU"
                const itemCount = order.products?.length || 0

                return (
                  <TableRow key={order._id} className={`h-20 transition-colors hover:bg-muted/50 ${index % 2 === 0 ? "bg-muted/20" : ""}`}>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-16 h-16 shrink-0">
                          <Image src={finalImage} alt={productName} fill sizes="64px" className="rounded-md border object-cover bg-white" unoptimized />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{productName}</span>
                          <span className="text-xs text-muted-foreground truncate">{sku}{itemCount > 1 ? ` +${itemCount - 1} more` : ""}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs truncate text-muted-foreground">{order._id}</TableCell>
                    <TableCell className="font-mono text-xs truncate">{order.payment_id || "—"}</TableCell>
                    <TableCell>{statusBadge(order.status)}</TableCell>
                    <TableCell className="text-right font-semibold pr-6 tabular-nums">
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default LatestOrder