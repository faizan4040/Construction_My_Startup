'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { statusBadge } from "@/lib/helperfunction"
import { IMAGES } from "@/routes/AllImages"
import Image from "next/image"
import { useMemo, useState } from "react"
import TablePagination from "@/components/ui/TablePagination"
import { useShopDashboard } from "@/contexts/ShopDashboardContext"

const PAGE_SIZE = 5

const LatestOrder = () => {
  const { data, loading } = useShopDashboard()
  const [page, setPage] = useState(1)
  const latestOrder = data?.latestOrder || []

  const totalPages = Math.max(1, Math.ceil(latestOrder.length / PAGE_SIZE))

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return latestOrder.slice(start, start + PAGE_SIZE)
  }, [latestOrder, page])

  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm p-10 flex justify-center items-center text-sm text-gray-400">
        Loading recent orders...
      </div>
    )
  }

  if (!latestOrder.length) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center gap-3">
        <Image src={IMAGES.logo} alt="No Orders" width={90} height={90} />
        <p className="text-sm text-gray-400">No orders yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Orders</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-gray-400 font-semibold">Product</TableHead>
            <TableHead className="text-gray-400 font-semibold">Order ID</TableHead>
            <TableHead className="text-gray-400 font-semibold">Payment ID</TableHead>
            <TableHead className="text-gray-400 font-semibold">Status</TableHead>
            <TableHead className="text-gray-400 font-semibold text-right pr-6">Your Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOrders.map((order) => {
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
              <TableRow key={order._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                <TableCell>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 shrink-0">
                      <Image src={finalImage} alt={productName} fill sizes="44px" className="rounded-lg object-cover bg-gray-50" unoptimized />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{productName}</span>
                      <span className="text-xs text-gray-400 truncate">{sku}{itemCount > 1 ? ` +${itemCount - 1} more` : ""}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-orange-500 font-medium">#{order._id?.slice(-6)}</TableCell>
                <TableCell className="font-mono text-xs text-gray-500 truncate">{order.payment_id || "—"}</TableCell>
                <TableCell>{statusBadge(order.status)}</TableCell>
                <TableCell className="text-right font-semibold pr-6 tabular-nums text-gray-800 dark:text-gray-100">
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{paginatedOrders.length}</span> of{" "}
          <span className="font-semibold text-gray-600">{latestOrder.length}</span> orders
        </p>
        <TablePagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}

export default LatestOrder






// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import useFetch from "@/hooks/useFetch"
// import { statusBadge } from "@/lib/helperfunction"
// import { IMAGES } from "@/routes/AllImages"
// import Image from "next/image"
// import { useEffect, useState } from "react"

// const LatestOrder = () => {
//   const [latestOrder, setLatestOrder] = useState([])
//   const { data, loading } = useFetch("/api/shopowner/dashboard/latest-order")

//   useEffect(() => {
//     if (data?.success) setLatestOrder(data.data)
//   }, [data])

//   if (loading) return <div className="h-full w-full flex justify-center items-center text-sm text-muted-foreground">Loading...</div>

//   if (!latestOrder.length) {
//     return (
//       <Card className="rounded-2xl sm:rounded-3xl shadow-sm h-full flex items-center justify-center border-gray-200/70 overflow-hidden">
//         <div className="h-1.5 bg-orange-500 absolute top-0 w-full" />
//         <Image src={IMAGES.logo} alt="No Orders" width={100} height={100} />
//       </Card>
//     )
//   }

//   return (
//     <Card className="rounded-2xl sm:rounded-3xl shadow-sm h-full bg-background border-gray-200/70 overflow-hidden">
//       <div className="h-1.5 bg-orange-500" />
//       <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
//         <div>
//           <p className="text-xs text-gray-400 font-medium">Site Ledger</p>
//           <CardTitle className="text-lg font-semibold tracking-tight">Your Recent Orders</CardTitle>
//         </div>
//         <span className="text-xs text-muted-foreground">last {latestOrder.length}</span>
//       </CardHeader>

//       <CardContent className="p-4">
//         <div className="relative max-h-80 overflow-y-auto">
//           <Table className="table-fixed w-full">
//             <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
//               <TableRow>
//                 <TableHead className="w-[36%]">Product</TableHead>
//                 <TableHead className="w-[22%]">Order ID</TableHead>
//                 <TableHead className="w-[18%]">Payment ID</TableHead>
//                 <TableHead className="w-[12%]">Status</TableHead>
//                 <TableHead className="w-[12%] text-right pr-6">Your Share</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {latestOrder.map((order, index) => {
//                 const product = order.products?.[0]
//                 const rawImage =
//                   product?.variantId?.media?.[0]?.secure_url ||
//                   product?.variantId?.media?.[0]?.url ||
//                   product?.variantId?.media?.[0]?.path || null

//                 const finalImage = rawImage
//                   ? (rawImage.startsWith("http") ? rawImage : `${process.env.NEXT_PUBLIC_API_URL}${rawImage}`)
//                   : IMAGES.image_placeholder

//                 const productName = product?.productId?.name || "Product"
//                 const sku = product?.variantId?.sku || "SKU"
//                 const itemCount = order.products?.length || 0

//                 return (
//                   <TableRow key={order._id} className={`h-20 transition-colors hover:bg-muted/50 ${index % 2 === 0 ? "bg-muted/20" : ""}`}>
//                     <TableCell>
//                       <div className="flex items-center gap-3 min-w-0">
//                         <div className="relative w-16 h-16 shrink-0">
//                           <Image src={finalImage} alt={productName} fill sizes="64px" className="rounded-md border object-cover bg-white" unoptimized />
//                         </div>
//                         <div className="flex flex-col min-w-0">
//                           <span className="text-sm font-medium truncate">{productName}</span>
//                           <span className="text-xs text-muted-foreground truncate">{sku}{itemCount > 1 ? ` +${itemCount - 1} more` : ""}</span>
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell className="font-mono text-xs truncate text-muted-foreground">{order._id}</TableCell>
//                     <TableCell className="font-mono text-xs truncate">{order.payment_id || "—"}</TableCell>
//                     <TableCell>{statusBadge(order.status)}</TableCell>
//                     <TableCell className="text-right font-semibold pr-6 tabular-nums">
//                       ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
//                     </TableCell>
//                   </TableRow>
//                 )
//               })}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default LatestOrder