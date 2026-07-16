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
  SHOP_OWNER_DASHBOARD,
  SHOP_OWNER_MANUAL_ORDER_ADD,
  SHOP_OWNER_MANUAL_ORDER_DETAILS,
} from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Manual Orders' },
]

const ShopOwnerShowManualOrders = () => {
  const columns = useMemo(() => columnConfig(DT_MANUAL_ORDER_COLUM), [])

  const action = useCallback(
    (row, deleteType, handleDelete) => [
      <ViewAction key="view" href={SHOP_OWNER_MANUAL_ORDER_DETAILS(row.original.order_id)} />,
      <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />,
    ],
    []
  )

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="py-4 max-w-300">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="flex justify-between items-center border-b">
            <h4 className="text-xl font-semibold">Your Manual Orders</h4>
            <Link href={SHOP_OWNER_MANUAL_ORDER_ADD}>
              <Button className="bg-orange-500 text-white gap-2 hover:bg-orange-600">
                <FilePlus size={18} />
                Add Manual Order
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="px-0">
            <DatatableWrapper
              querykey="shopowner-manual-orders"
              fetchUrl="/api/shopowner/manual-order"
              deleteEndpoint="/api/shopowner/manual-order/delete"
              deleteType="SD"
              columnsConfig={columns}
              createAction={action}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ShopOwnerShowManualOrders