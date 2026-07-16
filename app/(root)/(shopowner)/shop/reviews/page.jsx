'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_REVIEW_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_REVIEW_SHOW } from '@/routes/ShopOwnerPanelRoute'
import { useCallback, useMemo } from 'react'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Reviews' },
]

const ShopOwnerShowReviews = () => {
  const columns = useMemo(() => columnConfig(DT_REVIEW_COLUMN), [])

  const action = useCallback((row, deleteType, handleDelete) => [
    <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />,
  ], [])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className='py-4'>
        <Card className="py-0 max-w-302.5 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className='text-xl font-semibold'>Reviews on Your Products</h4>
          </CardHeader>
          <CardContent className='pb-5 px-0 pt-0'>
            <DatatableWrapper
              querykey="shopowner-review-data"
              fetchUrl="/api/shopowner/review"
              initialPageSize={10}
              columnsConfig={columns}
              deleteEndpoint="/api/shopowner/review/delete"
              deleteType="SD"
              createAction={action}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ShopOwnerShowReviews