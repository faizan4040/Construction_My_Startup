'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import EditAction from '@/components/Application/Admin/EditAction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_WAREHOUSE_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import { 
  ADMIN_WAREHOUSE_ADD, 
  ADMIN_WAREHOUSE_EDIT, 
  ADMIN_WAREHOUSE_SHOW, 
  ADMIN_DASHBOARD,
} from '@/routes/AdminPanelRoute'
import { FilePlus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_WAREHOUSE_SHOW, label: 'Warehouse' },
]

const ShowWarehouse = () => {
  const columns = useMemo(() => {
    return columnConfig(DT_WAREHOUSE_COLUMN)
  }, [])

  const action = useCallback((row, deleteType, handleDelete) => {
    let actionMenu = []
    actionMenu.push(
      <EditAction 
        key="edit" 
        href={ADMIN_WAREHOUSE_EDIT(row.original._id)}
      />
    )
    actionMenu.push(
      <DeleteAction 
        key="delete" 
        handleDelete={handleDelete} 
        row={row} 
        deleteType={deleteType}
      />
    )
    return actionMenu
  }, [])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className='py-4 max-w-300'>
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <div className='flex justify-between items-center'>
              <h4 className='text-xl font-semibold'>Warehouse Management</h4>
              <Button className='bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white rounded-lg'>
                <FilePlus size={18} />
                <Link href={ADMIN_WAREHOUSE_ADD}>New Warehouse</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pb-5 px-0'>
            <DatatableWrapper
              querykey="warehouse-data"
              fetchUrl="/api/warehouse/list"
              initialPageSize={10}
              columnsConfig={columns}
              deleteEndpoint="/api/warehouse/delete"
              deleteType="SD"
              trashView={`${ADMIN_WAREHOUSE_SHOW}?trashof=warehouse`}
              createAction={action}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ShowWarehouse