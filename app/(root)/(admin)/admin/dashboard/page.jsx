import React from 'react'
import CountOverview from './CountOverview'
import OrderStatus from './OrderStatus'
import LatestOrder from './LatestOrder'
import DashboardNotifications from './DashboardNotifications'
import StockOverview from './StockOverview'

const AdminDashboard = () => {
  return (
    <div>
      <CountOverview/>

                   
      <div className='py-18'>
        <OrderStatus/>
      </div>

       <div className='py-2'>
       <LatestOrder/>
      </div>

       <div className='py-2'>
        <StockOverview/>
      </div>

       <div className='py-2'>
        <DashboardNotifications/>
      </div>


      </div>
  )
}

export default AdminDashboard