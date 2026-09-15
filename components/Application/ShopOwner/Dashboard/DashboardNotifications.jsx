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



