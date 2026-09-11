"use client"

import React from 'react'
import { ShopDashboardProvider } from "@/contexts/ShopDashboardContext"
import CountOverview from "@/components/Application/ShopOwner/Dashboard/CountOverview"
import PerformanceChart from "@/components/Application/ShopOwner/Dashboard/PerformanceChart"
import OrderStatus from "@/components/Application/ShopOwner/Dashboard/OrderStatus"
import LatestOrder from "@/components/Application/ShopOwner/Dashboard/LatestOrder"
import DashboardNotifications from "@/components/Application/ShopOwner/Dashboard/DashboardNotifications"
import StockOverview from "@/components/Application/ShopOwner/Dashboard/StockOverview"

const ShopOwnerDashboard = () => {
  return (
    <ShopDashboardProvider>
      <div>
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Your Shop, at a Glance</h1>
          <p className="text-sm text-gray-500 mt-1">Live numbers from your storefront — orders, stock, and reviews.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
          <div className="xl:col-span-2">
            <CountOverview />
          </div>
          <div className="xl:col-span-3">
            <PerformanceChart />
          </div>
        </div>

        <div className="mb-6">
          <OrderStatus />
        </div>

        <div className="mb-6">
          <LatestOrder />
        </div>

        <div className="mb-6">
          <StockOverview />
        </div>

        <div>
          <DashboardNotifications />
        </div>
      </div>
    </ShopDashboardProvider>
  )
}

export default ShopOwnerDashboard






// import React from 'react'
// import CountOverview from './CountOverview'
// import OrderStatus from './OrderStatus'
// import LatestOrder from './LatestOrder'
// import DashboardNotifications from './DashboardNotifications'
// import StockOverview from './StockOverview'

// const ShopOwnerDashboard = () => {
//   return (
//     <div>
//       <div className="mb-6">
//         <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Your Shop, at a Glance</h1>
//         <p className="text-sm text-gray-500 mt-1">Live numbers from your storefront — orders, stock, and reviews.</p>
//       </div>

//       <CountOverview />

//       <div className='py-8'>
//         <OrderStatus />
//       </div>

//       <div className='py-2'>
//         <LatestOrder />
//       </div>

//       <div className='py-2'>
//         <StockOverview />
//       </div>

//       <div className='py-2'>
//         <DashboardNotifications />
//       </div>
//     </div>
//   )
// }

// export default ShopOwnerDashboard

