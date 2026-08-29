import React from 'react'
import CountOverview from './CountOverview'
import OrderStatus from './OrderStatus'
import LatestOrder from './LatestOrder'
import DashboardNotifications from './DashboardNotifications'
import StockOverview from './StockOverview'

const ShopOwnerDashboard = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Your Shop, at a Glance</h1>
        <p className="text-sm text-gray-500 mt-1">Live numbers from your storefront — orders, stock, and reviews.</p>
      </div>

      <CountOverview />

      <div className='py-8'>
        <OrderStatus />
      </div>

      <div className='py-2'>
        <LatestOrder />
      </div>

      <div className='py-2'>
        <StockOverview />
      </div>

      <div className='py-2'>
        <DashboardNotifications />
      </div>
    </div>
  )
}

export default ShopOwnerDashboard

