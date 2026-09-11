'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import Image from "next/image"
import { IMAGES } from "@/routes/AllImages"
import { useMemo, useState } from "react"
import TablePagination from "@/components/ui/TablePagination"
import { useShopDashboard } from "@/contexts/ShopDashboardContext"

const PAGE_SIZE = 5

const StockGauge = ({ healthy, low, out }) => {
  const total = healthy + low + out || 1
  const R = 80
  const circumference = Math.PI * R
  const healthyLen = (healthy / total) * circumference
  const lowLen = (low / total) * circumference
  const outLen = (out / total) * circumference
  const healthyPct = Math.round((healthy / total) * 100)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-56">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${healthyLen} ${circumference}`} />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${lowLen} ${circumference}`} strokeDashoffset={-healthyLen} />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${outLen} ${circumference}`} strokeDashoffset={-(healthyLen + lowLen)} />
        <text x="100" y="92" textAnchor="middle" className="fill-foreground font-bold" style={{ fontSize: "28px" }}>{healthyPct}%</text>
        <text x="100" y="108" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "11px" }}>stock healthy</text>
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
  const { data, loading } = useShopDashboard()
  const [page, setPage] = useState(1)

  const stockTable = data?.stockOverview?.stockTable || []
  const mostSold = data?.stockOverview?.mostSold || []

  const { healthy, low, out } = useMemo(() => {
    return stockTable.reduce((acc, row) => {
      if (row.status === "Out of Stock") acc.out += 1
      else if (row.status === "Low Stock") acc.low += 1
      else acc.healthy += 1
      return acc
    }, { healthy: 0, low: 0, out: 0 })
  }, [stockTable])

  const totalPages = Math.max(1, Math.ceil(stockTable.length / PAGE_SIZE))
  const paginatedStock = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return stockTable.slice(start, start + PAGE_SIZE)
  }, [stockTable, page])

  if (loading) {
    return <div className="bg-white dark:bg-card rounded-2xl shadow-sm p-10 text-center text-sm text-gray-400">Loading stock data...</div>
  }

  const renderStatus = (status) => {
    if (status === "Out of Stock") return <Badge className="bg-red-50 text-red-600 flex items-center gap-1 w-fit"><XCircle size={14} /> Out of Stock</Badge>
    if (status === "Low Stock") return <Badge className="bg-amber-50 text-amber-600 flex items-center gap-1 w-fit"><AlertTriangle size={14} /> Low Stock</Badge>
    return <Badge className="bg-green-50 text-green-600 flex items-center gap-1 w-fit"><CheckCircle size={14} /> In Stock</Badge>
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white dark:bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Product Stock</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-gray-400 font-semibold">Product</TableHead>
              <TableHead className="text-gray-400 font-semibold">SKU</TableHead>
              <TableHead className="text-gray-400 font-semibold text-center">Sold</TableHead>
              <TableHead className="text-gray-400 font-semibold text-center">Stock qty</TableHead>
              <TableHead className="text-gray-400 font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStock.map((row) => (
              <TableRow key={row.variantId} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image src={row.image || IMAGES.product_placeholder} width={40} height={40} className="rounded-lg object-cover bg-gray-50" alt={row.productName} />
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{row.productName}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">{row.sku}</TableCell>
                <TableCell className="text-center text-gray-700 dark:text-gray-200">{row.totalSold}</TableCell>
                <TableCell className="text-center text-gray-700 dark:text-gray-200">{row.remainingStock}</TableCell>
                <TableCell>{renderStatus(row.status)}</TableCell>
              </TableRow>
            ))}
            {!stockTable.length && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-gray-400 py-10">No variants yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {stockTable.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{paginatedStock.length}</span> of{" "}
              <span className="font-semibold text-gray-600">{stockTable.length}</span> products
            </p>
            <TablePagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Stock at a Glance</h2>
        </div>
        <div className="p-5 pt-0 flex flex-col items-center gap-6">
          <StockGauge healthy={healthy} low={low} out={out} />
          <div className="w-full">
            <p className="text-xs font-semibold text-gray-500 mb-2">Top Sellers</p>
            <div className="space-y-2">
              {mostSold.length ? mostSold.slice(0, 4).map((item) => (
                <div key={item.variantId} className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 relative shrink-0">
                      <Image src={item.image || IMAGES.product_placeholder} alt={item.productName} fill className="rounded-lg object-cover" unoptimized />
                    </div>
                    <p className="text-xs font-medium truncate text-gray-700 dark:text-gray-200">{item.productName}</p>
                  </div>
                  <Badge className="bg-orange-500 text-white text-[10px] shrink-0">{item.totalSold} sold</Badge>
                </div>
              )) : (
                <p className="text-xs text-gray-400">No sales data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockOverview











// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import useFetch from "@/hooks/useFetch"
// import { Badge } from "@/components/ui/badge"
// import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
// import Image from "next/image"
// import { IMAGES } from "@/routes/AllImages"
// import { useMemo } from "react"

// // signature element: semi-circular stock-health gauge
// const StockGauge = ({ healthy, low, out }) => {
//   const total = healthy + low + out || 1
//   const R = 80
//   const CX = 100
//   const CY = 100
//   const circumference = Math.PI * R // half circle

//   const healthyLen = (healthy / total) * circumference
//   const lowLen = (low / total) * circumference
//   const outLen = (out / total) * circumference

//   const healthyPct = Math.round((healthy / total) * 100)

//   return (
//     <div className="flex flex-col items-center">
//       <svg viewBox="0 0 200 110" className="w-full max-w-56">
//         {/* track */}
//         <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
//         {/* healthy arc */}
//         <path
//           d="M 20 100 A 80 80 0 0 1 180 100"
//           fill="none"
//           stroke="#22c55e"
//           strokeWidth="16"
//           strokeLinecap="round"
//           strokeDasharray={`${healthyLen} ${circumference}`}
//         />
//         {/* low arc, offset after healthy */}
//         <path
//           d="M 20 100 A 80 80 0 0 1 180 100"
//           fill="none"
//           stroke="#f59e0b"
//           strokeWidth="16"
//           strokeLinecap="round"
//           strokeDasharray={`${lowLen} ${circumference}`}
//           strokeDashoffset={-healthyLen}
//         />
//         {/* out arc, offset after healthy+low */}
//         <path
//           d="M 20 100 A 80 80 0 0 1 180 100"
//           fill="none"
//           stroke="#ef4444"
//           strokeWidth="16"
//           strokeLinecap="round"
//           strokeDasharray={`${outLen} ${circumference}`}
//           strokeDashoffset={-(healthyLen + lowLen)}
//         />
//         <text x="100" y="92" textAnchor="middle" className="fill-foreground font-bold" style={{ fontSize: "28px" }}>
//           {healthyPct}%
//         </text>
//         <text x="100" y="108" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "11px" }}>
//           stock healthy
//         </text>
//       </svg>

//       <div className="flex gap-4 mt-2 text-xs">
//         <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {healthy} healthy</span>
//         <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> {low} low</span>
//         <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> {out} out</span>
//       </div>
//     </div>
//   )
// }

// const StockOverview = () => {
//   const { data, loading } = useFetch("/api/shopowner/dashboard/stock-overview")

//   const stockTable = data?.data?.stockTable || []
//   const mostSold = data?.data?.mostSold || []

//   const { healthy, low, out } = useMemo(() => {
//     return stockTable.reduce(
//       (acc, row) => {
//         if (row.status === "Out of Stock") acc.out += 1
//         else if (row.status === "Low Stock") acc.low += 1
//         else acc.healthy += 1
//         return acc
//       },
//       { healthy: 0, low: 0, out: 0 }
//     )
//   }, [stockTable])

//   if (loading) {
//     return <div className="h-full w-full flex justify-center items-center text-muted-foreground text-sm">Loading stock data...</div>
//   }

//   const renderStatus = (status) => {
//     if (status === "Out of Stock") return <Badge className="bg-red-600 text-white flex items-center gap-1"><XCircle size={14} /> Out of Stock</Badge>
//     if (status === "Low Stock") return <Badge className="bg-yellow-500 text-black flex items-center gap-1 animate-pulse"><AlertTriangle size={14} /> Low Stock</Badge>
//     return <Badge className="bg-green-600 text-white flex items-center gap-1"><CheckCircle size={14} /> In Stock</Badge>
//   }

//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//       <Card className="xl:col-span-2 rounded-2xl sm:rounded-3xl shadow-sm h-full border-gray-200/70 overflow-hidden">
//         <div className="h-1.5 bg-rose-500" />
//         <CardHeader className="border-b pt-4">
//           <p className="text-xs text-gray-400 font-medium">Warehouse</p>
//           <CardTitle>Your Product Stock</CardTitle>
//         </CardHeader>
//         <CardContent className="p-4">
//           <div className="max-h-112.5 overflow-y-auto">
//             <Table>
//               <TableHeader className="sticky top-0 bg-background z-10">
//                 <TableRow>
//                   <TableHead>Product</TableHead>
//                   <TableHead>SKU</TableHead>
//                   <TableHead className="text-center">Sold</TableHead>
//                   <TableHead className="text-center">Stock qty</TableHead>
//                   <TableHead>Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {stockTable.map((row) => (
//                   <TableRow key={row.variantId}>
//                     <TableCell>
//                       <div className="flex items-center gap-3">
//                         <Image src={row.image || IMAGES.product_placeholder} width={48} height={48} className="rounded-lg border object-cover" alt={row.productName} />
//                         <div>
//                           <p className="font-medium text-sm">{row.productName}</p>
//                           <p className="text-xs text-muted-foreground">SKU: {row.sku}</p>
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell className="font-mono text-xs">{row.sku}</TableCell>
//                     <TableCell className="text-center">{row.totalSold}</TableCell>
//                     <TableCell className="text-center">{row.remainingStock}</TableCell>
//                     <TableCell>{renderStatus(row.status)}</TableCell>
//                   </TableRow>
//                 ))}
//                 {!stockTable.length && (
//                   <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No variants yet</TableCell></TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="rounded-2xl sm:rounded-3xl shadow-sm h-full border-gray-200/70 overflow-hidden">
//         <div className="h-1.5 bg-rose-500" />
//         <CardHeader className="border-b pt-4">
//           <p className="text-xs text-gray-400 font-medium">Health Check</p>
//           <CardTitle>Stock at a Glance</CardTitle>
//         </CardHeader>
//         <CardContent className="p-5 flex flex-col items-center gap-6">
//           <StockGauge healthy={healthy} low={low} out={out} />

//           <div className="w-full">
//             <p className="text-xs font-semibold text-gray-500 mb-2">Top Sellers</p>
//             <div className="space-y-2">
//               {mostSold.length ? mostSold.slice(0, 4).map((item) => (
//                 <div key={item.variantId} className="flex justify-between items-center p-2.5 rounded-xl bg-muted">
//                   <div className="flex items-center gap-2.5 min-w-0">
//                     <div className="w-9 h-9 relative shrink-0">
//                       <Image src={item.image || IMAGES.product_placeholder} alt={item.productName} fill className="rounded-lg border object-cover" unoptimized />
//                     </div>
//                     <p className="text-xs font-medium truncate">{item.productName}</p>
//                   </div>
//                   <Badge className="bg-orange-500 text-white text-[10px] shrink-0">{item.totalSold} sold</Badge>
//                 </div>
//               )) : (
//                 <p className="text-xs text-muted-foreground">No sales data yet</p>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default StockOverview