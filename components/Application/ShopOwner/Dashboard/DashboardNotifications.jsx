'use client'

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { FiAlertTriangle, FiTrendingUp, FiCheckCircle, FiPackage } from "react-icons/fi"
import { useShopDashboard } from "@/contexts/ShopDashboardContext"

const DashboardNotifications = () => {
  const { data, loading } = useShopDashboard()
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

  const lowStock = data?.stockReport?.lowStock || []
  const mostSold = data?.stockReport?.mostSold || []

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <FiAlertTriangle className="text-red-500" size={18} />
            <h2 className="font-semibold">Low Stock Alerts</h2>
          </div>
          <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-medium">{lowStock.length}</span>
        </div>
        <div className="px-4 pb-4 space-y-2">
          {lowStock.length > 0 ? lowStock.map((item) => (
            <motion.div key={item.variantId} whileHover={{ scale: 1.01 }} transition={{ duration: 0.15 }} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white shrink-0">
                  {item.image ? (
                    <Image src={item.image.startsWith("http") ? item.image : `${BASE_URL}${item.image}`} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full"><FiPackage className="text-gray-400" /></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                </div>
              </div>
              <span className="text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">{item.remainingStock} left</span>
            </motion.div>
          )) : (
            <div className="flex items-center gap-2 text-green-600 text-sm py-4"><FiCheckCircle /> All your stock levels are healthy</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <FiTrendingUp className="text-emerald-500" size={18} />
            <h2 className="font-semibold">Trending in Your Shop</h2>
          </div>
          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-medium">{mostSold.length}</span>
        </div>
        <div className="px-4 pb-4 space-y-2">
          {mostSold.length > 0 ? mostSold.map((item) => (
            <motion.div key={item.variantId} whileHover={{ scale: 1.01 }} transition={{ duration: 0.15 }} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white shrink-0">
                  {item.image ? (
                    <Image src={item.image.startsWith("http") ? item.image : `${BASE_URL}${item.image}`} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full"><FiPackage className="text-gray-400" /></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                </div>
              </div>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">{item.totalSold} sold</span>
            </motion.div>
          )) : (
            <p className="text-gray-400 text-sm py-4">No sales data available yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardNotifications














// 'use client'

// import React, { useEffect, useState } from "react"
// import axios from "axios"
// import Image from "next/image"
// import { motion } from "framer-motion"
// import { FiAlertTriangle, FiTrendingUp, FiCheckCircle, FiPackage } from "react-icons/fi"

// const DashboardNotifications = () => {
//   const [lowStock, setLowStock] = useState([])
//   const [mostSold, setMostSold] = useState([])
//   const [loading, setLoading] = useState(true)
//   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const res = await axios.get("/api/shopowner/dashboard/stock-report")
//         if (res.data?.success) {
//           setLowStock(res.data.data.lowStock || [])
//           setMostSold(res.data.data.mostSold || [])
//         }
//       } catch (error) {
//         console.error("Dashboard API error:", error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchDashboardData()
//   }, [])

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-60">
//         <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
//       </div>
//     )
//   }

//   return (
//     <div className="grid lg:grid-cols-2 gap-8">
//       <div className="bg-white rounded-3xl shadow-lg border border-red-100 overflow-hidden">
//         <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-red-500 to-orange-500 text-white">
//           <div className="flex items-center gap-2"><FiAlertTriangle size={20} /><h2 className="font-semibold">Low Stock Alerts</h2></div>
//           <span className="bg-white/20 px-3 py-1 rounded-full text-xs">{lowStock.length}</span>
//         </div>
//         <div className="p-5 space-y-4 max-h-105 overflow-y-auto">
//           {lowStock.length > 0 ? lowStock.map((item) => (
//             <motion.div key={item.variantId} whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border hover:shadow-md transition">
//               <div className="flex items-center gap-4">
//                 <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
//                   {item.image ? (
//                     <Image src={item.image.startsWith("http") ? item.image : `${BASE_URL}${item.image}`} alt={item.productName} fill className="object-cover" />
//                   ) : (
//                     <div className="flex items-center justify-center w-full h-full"><FiPackage className="text-gray-400" /></div>
//                   )}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
//                   <p className="text-xs text-gray-500">SKU : {item.sku}</p>
//                   <div className="w-40 h-2 bg-gray-200 rounded-full mt-1">
//                     <div className="h-2 rounded-full bg-red-500" style={{ width: `${Math.min(item.remainingStock * 20, 100)}%` }} />
//                   </div>
//                 </div>
//               </div>
//               <span className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full animate-pulse">{item.remainingStock} left</span>
//             </motion.div>
//           )) : (
//             <div className="flex items-center gap-2 text-green-600 text-sm"><FiCheckCircle /> All your stock levels are healthy</div>
//           )}
//         </div>
//         <div className="px-6 py-3 text-xs text-red-700 bg-red-50 border-t">Reorder soon to avoid missed sales</div>
//       </div>

//       <div className="bg-white rounded-3xl shadow-lg border border-green-100 overflow-hidden">
//         <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-emerald-500 to-green-600 text-white">
//           <div className="flex items-center gap-2"><FiTrendingUp size={20} /><h2 className="font-semibold">Trending in Your Shop</h2></div>
//           <span className="bg-white/20 px-3 py-1 rounded-full text-xs">{mostSold.length}</span>
//         </div>
//         <div className="p-5 space-y-4 max-h-105 overflow-y-auto">
//           {mostSold.length > 0 ? mostSold.map((item) => (
//             <motion.div key={item.variantId} whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border hover:shadow-md transition">
//               <div className="flex items-center gap-4">
//                 <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
//                   {item.image ? (
//                     <Image src={item.image.startsWith("http") ? item.image : `${BASE_URL}${item.image}`} alt={item.productName} fill className="object-cover" />
//                   ) : (
//                     <div className="flex items-center justify-center w-full h-full"><FiPackage className="text-gray-400" /></div>
//                   )}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
//                   <p className="text-xs text-gray-500">SKU : {item.sku}</p>
//                 </div>
//               </div>
//               <span className="text-xs font-semibold bg-green-100 text-green-600 px-3 py-1 rounded-full">{item.totalSold} sold</span>
//             </motion.div>
//           )) : (
//             <p className="text-gray-500 text-sm">No sales data available yet</p>
//           )}
//         </div>
//         <div className="px-6 py-3 text-xs text-green-700 bg-green-50 border-t">These products are performing well for you</div>
//       </div>
//     </div>
//   )
// }

// export default DashboardNotifications