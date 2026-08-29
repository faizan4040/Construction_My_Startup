'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { XCircle, Truck, PackageCheck, CheckCircle, Loader } from 'lucide-react'
import { ListItemIcon, MenuItem } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import ViewAction from '@/components/Application/Admin/ViewAction'
import StatusCard from '@/components/Application/ShopOwner/Dashboard/StatusCard'


import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_ORDER_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_ORDER_DETAILS } from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Orders' },
]

const EMPTY_STATUS = { OrderCancel: 0, OrderShipped: 0, InProgress: 0, Delivered: 0 }

const ShopOwnerShowOrders = () => {
  const [statusCounts, setStatusCounts] = useState(EMPTY_STATUS)
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/shopowner/orders/status', { cache: 'no-store' })
        const data = await res.json()
        if (mounted && data) setStatusCounts(data)
      } catch {
        if (mounted) setStatusCounts(EMPTY_STATUS)
      } finally {
        mounted && setLoadingStatus(false)
      }
    }
    fetchStatus()
    return () => { mounted = false }
  }, [])

  const columns = useMemo(() => columnConfig(DT_ORDER_COLUMN), [])

  // 👇 Datatable.jsx yahan 3 arguments bhejta hai: (row, deleteType, handleDelete)
  // deleteType batata hai kaunsa mode hai ("SD" normal view, "PD" trash view)
  // handleDelete confirm-dialog dikha kar actual delete API call karta hai
  const action = useCallback((row, deleteType, handleDelete) => {
    const items = [
      <ViewAction key="view" href={SHOP_OWNER_ORDER_DETAILS(row.original.order_id)} />,
    ]

    if (deleteType === 'PD') {
      // trash view me: Restore + Permanently Delete
      items.push(
        <MenuItem key="restore" onClick={() => handleDelete([row.original._id], 'RSD')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Restore
        </MenuItem>,
        <MenuItem key="permanent-delete" onClick={() => handleDelete([row.original._id], 'PD')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Permanently
        </MenuItem>
      )
    } else {
      // normal view me: sirf Delete (soft delete / move to trash)
      items.push(
        <MenuItem key="delete" onClick={() => handleDelete([row.original._id], 'SD')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      )
    }

    return items
  }, [])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="py-4">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <h4 className="text-lg font-semibold">Your Order Overview</h4>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {loadingStatus ? (
                <div className="col-span-full flex justify-center py-6">
                  <Loader className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <StatusCard title="Cancelled" count={statusCounts.OrderCancel} icon={<XCircle />} bgColor="bg-white" textColor="text-gray-900" />
                  <StatusCard title="Shipped" count={statusCounts.OrderShipped} icon={<Truck />} bgColor="bg-white" textColor="text-gray-900" />
                  <StatusCard title="Processing" count={statusCounts.InProgress} icon={<PackageCheck />} bgColor="bg-white" textColor="text-gray-900" />
                  <StatusCard title="Delivered" count={statusCounts.Delivered} icon={<CheckCircle />} bgColor="bg-white" textColor="text-gray-900" />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="py-4">
        <Card className="py-0 max-w-302.5 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Orders Containing Your Products</h4>
          </CardHeader>
          <CardContent className="pb-5 px-0 pt-0">
            <DatatableWrapper
              querykey="shopowner-orders-data"
              fetchUrl="/api/shopowner/orders"
              initialPageSize={10}
              columnsConfig={columns}
              createAction={action}
              deleteEndpoint="/api/shopowner/orders/delete"
              deleteType="SD"
              trashView={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ShopOwnerShowOrders






// 'use client'

// import { useEffect, useState, useMemo, useCallback } from 'react'
// import { XCircle, Truck, PackageCheck, CheckCircle, Loader } from 'lucide-react'

// import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
// import ViewAction from '@/components/Application/Admin/ViewAction'
// import StatusCard from '@/components/Application/ShopOwner/Dashboard/StatusCard'


// import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { DT_ORDER_COLUMN } from '@/lib/column'
// import { columnConfig } from '@/lib/helperfunction'
// import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_ORDER_DETAILS } from '@/routes/ShopOwnerPanelRoute'

// const breadcrumbData = [
//   { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
//   { href: '', label: 'Orders' },
// ]

// const EMPTY_STATUS = { OrderCancel: 0, OrderShipped: 0, InProgress: 0, Delivered: 0 }

// const ShopOwnerShowOrders = () => {
//   const [statusCounts, setStatusCounts] = useState(EMPTY_STATUS)
//   const [loadingStatus, setLoadingStatus] = useState(true)

//   useEffect(() => {
//     let mounted = true
//     const fetchStatus = async () => {
//       try {
//         const res = await fetch('/api/shopowner/orders/status', { cache: 'no-store' })
//         const data = await res.json()
//         if (mounted && data) setStatusCounts(data)
//       } catch {
//         if (mounted) setStatusCounts(EMPTY_STATUS)
//       } finally {
//         mounted && setLoadingStatus(false)
//       }
//     }
//     fetchStatus()
//     return () => { mounted = false }
//   }, [])

//   const columns = useMemo(() => columnConfig(DT_ORDER_COLUMN), [])

//   const action = useCallback((row) => [
//     <ViewAction key="view" href={SHOP_OWNER_ORDER_DETAILS(row.original.order_id)} />,
//   ], [])

//   return (
//     <div>
//       <BreadCrumb breadcrumbData={breadcrumbData} />

//       <div className="py-4">
//         <Card className="rounded-3xl shadow-sm">
//           <CardHeader className="px-4 pt-4 pb-2">
//             <h4 className="text-lg font-semibold">Your Order Overview</h4>
//           </CardHeader>
//           <CardContent className="pt-2">
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//               {loadingStatus ? (
//                 <div className="col-span-full flex justify-center py-6">
//                   <Loader className="w-5 h-5 animate-spin text-gray-400" />
//                 </div>
//               ) : (
//                 <>
//                   <StatusCard title="Cancelled" count={statusCounts.OrderCancel} icon={<XCircle />} bgColor="bg-white" textColor="text-gray-900" />
//                   <StatusCard title="Shipped" count={statusCounts.OrderShipped} icon={<Truck />} bgColor="bg-white" textColor="text-gray-900" />
//                   <StatusCard title="Processing" count={statusCounts.InProgress} icon={<PackageCheck />} bgColor="bg-white" textColor="text-gray-900" />
//                   <StatusCard title="Delivered" count={statusCounts.Delivered} icon={<CheckCircle />} bgColor="bg-white" textColor="text-gray-900" />
//                 </>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="py-4">
//         <Card className="py-0 max-w-302.5 rounded-3xl shadow-sm gap-0">
//           <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
//             <h4 className="text-xl font-semibold">Orders Containing Your Products</h4>
//           </CardHeader>
//           <CardContent className="pb-5 px-0 pt-0">
            
//             <DatatableWrapper
//               querykey="shopowner-orders-data"
//               fetchUrl="/api/shopowner/orders"
//               initialPageSize={10}
//               columnsConfig={columns}
//               createAction={action}
//               deleteEndpoint="/api/shopowner/orders/delete"
//               deleteType="SD"
//               trashView={false}
//             />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

// export default ShopOwnerShowOrders







// import OrdersList from '@/components/Application/ShopOwner/Orders/OrdersList'

// const page = () => {
//   return (
//     <div className="space-y-4">
//       <h1 className="text-2xl font-semibold">Orders</h1>
//       <OrdersList />
//     </div>
//   )
// }

// export default page