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
import { statusBadge } from "@/lib/helperfunction"
import { IMAGES } from "@/routes/AllImages"
import Image from "next/image"
import { useEffect, useState } from "react"

const LatestOrder = () => {
  const [latestOrder, setLatestOrder] = useState([])
  const { data, loading } = useFetch(
    "/api/dashboard/admin/latest-order"
  )

  useEffect(() => {
    if (data?.success) {
      setLatestOrder(data.data)
    }
  }, [data])

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        Loading...
      </div>
    )
  }

  if (!latestOrder.length) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <Image
          src={IMAGES.logo}
          alt="No Orders"
          width={120}
          height={120}
        />
      </div>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm h-full bg-background -mt-14">
      {/* HEADER */}
      <CardHeader className="px-6 py-5 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Recent Orders
        </CardTitle>

        <span className="text-xs text-muted-foreground">
          Showing last {latestOrder.length} orders
        </span>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="p-4">
        <div className="relative max-h-80 overflow-y-auto">
          <Table className="table-fixed w-full">
            {/* HEADER */}
            <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
              <TableRow>
                <TableHead className="w-[32%]">Product</TableHead>
                <TableHead className="w-[20%]">Order ID</TableHead>
                <TableHead className="w-[18%]">Payment ID</TableHead>
                <TableHead className="w-[10%] text-center">Items</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[10%] text-right pr-6">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* BODY */}
            <TableBody>
              {latestOrder.map((order, index) => {
                const product = order.products?.[0]

                const rawImage =
                  product?.variantId?.media?.[0]?.secure_url ||
                  product?.variantId?.media?.[0]?.url ||
                  product?.variantId?.media?.[0]?.path ||
                  null

                const finalImage = rawImage
                  ? rawImage.startsWith("http")
                    ? rawImage
                    : `${process.env.NEXT_PUBLIC_API_URL}${rawImage}`
                  : IMAGES.image_placeholder

                const productName =
                  product?.productId?.name || "Product"

                const sku =
                  product?.variantId?.sku || "SKU"

                return (
                  <TableRow
                    key={order._id}
                    className={`h-20 transition-colors hover:bg-muted/50 ${
                      index % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                  >
                    {/* PRODUCT COLUMN */}
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-20 h-20 shrink-0">
                        <Image
                          src={finalImage}
                          alt={productName}
                          fill
                          sizes="80px"
                          className="rounded-md border object-cover bg-white"
                          unoptimized
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{productName}</span>
                        <span className="text-xs text-muted-foreground truncate">{sku}</span>
                      </div>
                    </div>
                  </TableCell>
                    {/* ORDER ID */}
                    <TableCell className="font-mono text-xs truncate text-muted-foreground">
                      {order._id}
                    </TableCell>

                    {/* PAYMENT ID */}
                    <TableCell className="font-mono text-xs truncate">
                      {order.payment_id || "—"}
                    </TableCell>

                    {/* ITEMS */}
                    <TableCell className="text-center font-medium">
                      {order.products?.length || 0}
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      {statusBadge(order.status)}
                    </TableCell>

                    {/* AMOUNT */}
                    <TableCell className="text-right font-semibold pr-6">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
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