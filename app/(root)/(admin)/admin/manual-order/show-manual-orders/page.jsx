'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { FilePlus } from 'lucide-react'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import ViewAction from '@/components/Application/Admin/ViewAction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { DT_MANUAL_ORDER_COLUM } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import {
  ADMIN_DASHBOARD,
  ADMIN_MANUAL_ORDER_DETAILS,
  ADMIN_MANUAL_ORDERS_ADD,
  ADMIN_TRASH,
} from '@/routes/AdminPanelRoute'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Manual Orders' },
]

const ShowManualOrders = () => {
  const columns = useMemo(() => columnConfig(DT_MANUAL_ORDER_COLUM), [])

  const action = useCallback(
    (row, deleteType, handleDelete) => [
      <ViewAction
        key="view"
        // Uses order_id string (e.g. "MANUAL-1234") — matches [order_id] route
        href={ADMIN_MANUAL_ORDER_DETAILS(row.original.order_id)}
      />,
      <DeleteAction
        key="delete"
        handleDelete={handleDelete}
        row={row}
        deleteType={deleteType}
      />,
    ],
    []
  )

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="py-4 max-w-300">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="flex justify-between items-center border-b">
            <h4 className="text-xl font-semibold">Manual Orders</h4>

            <Link href={ADMIN_MANUAL_ORDERS_ADD}>
              <Button className="bg-orange-500 text-white gap-2">
                <FilePlus size={18} />
                Add Manual Order
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="px-0">
            <DatatableWrapper
              querykey="manual-orders"
              fetchUrl="/api/manual-order"
              deleteEndpoint="/api/manual-order/delete"
              deleteType="SD"
              columnsConfig={columns}
              createAction={action}
              // FIX: Trash key must match TRASH_CONFIG key — changed to 'manual-orders'
              trashView={`${ADMIN_TRASH}?trashof=manual-order`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ShowManualOrders






















// 'use client'

// import { useMemo, useCallback } from 'react'
// import Link from 'next/link'
// import { FilePlus } from 'lucide-react'

// import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
// import DeleteAction from '@/components/Application/Admin/DeleteAction'
// import ViewAction from '@/components/Application/Admin/ViewAction'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'

// import { DT_MANUAL_ORDER_COLUM } from '@/lib/column'
// import { columnConfig } from '@/lib/helperfunction'
// import {
//   ADMIN_DASHBOARD,
//   ADMIN_MANUAL_ORDER_DETAILS,
//   ADMIN_MANUAL_ORDERS_ADD,
//   ADMIN_TRASH,
// } from '@/routes/AdminPanelRoute'

// const breadcrumbData = [
//   { href: ADMIN_DASHBOARD, label: 'Home' },
//   { href: '', label: 'Manual Orders' },
// ]

// const ShowManualOrders = () => {
//   const columns = useMemo(() => columnConfig(DT_MANUAL_ORDER_COLUM), [])

//   const action = useCallback((row, deleteType, handleDelete) => [
//     <ViewAction
//       key="view"
//       href={ADMIN_MANUAL_ORDER_DETAILS(row.original.order_id)}
//     />,
//     <DeleteAction
//       key="delete"
//       handleDelete={handleDelete}
//       row={row}
//       deleteType={deleteType}
//     />,
//   ], [])

//   return (
//     <div>
//       <BreadCrumb breadcrumbData={breadcrumbData} />

//       <div className="py-4 max-w-300">
//         <Card className="rounded-3xl shadow-sm">
//           <CardHeader className="flex justify-between items-center border-b">
//             <h4 className="text-xl font-semibold">Manual Orders</h4>

//             <Link href={ADMIN_MANUAL_ORDERS_ADD}>
//               <Button className="bg-orange-500 text-white gap-2">
//                 <FilePlus size={18} />
//                 Add Manual Order
//               </Button>
//             </Link>
//           </CardHeader>

//           <CardContent className="px-0">
//             <DatatableWrapper
//               querykey="manual-orders"
//               fetchUrl="/api/manual-order"
//               deleteEndpoint="/api/manual-order/delete"
//               deleteType="SD"
//               columnsConfig={columns}
//               createAction={action}
//               trashView={`${ADMIN_TRASH}?trashof=manual-orders`}
//               rowIdKey="_id"
//             />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

// export default ShowManualOrders