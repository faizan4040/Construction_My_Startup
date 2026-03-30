'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import EditAction from '@/components/Application/Admin/EditAction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_COUPON_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import { ADMIN_COUPON_ADD, ADMIN_COUPON_EDIT, ADMIN_COUPON_SHOW, ADMIN_DASHBOARD, ADMIN_TRASH } from '@/routes/AdminPanelRoute'
import { FilePlus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'

const breadcrumbData = [
  {href: ADMIN_DASHBOARD, label: 'Home'},
  {href: ADMIN_COUPON_SHOW, label: 'Coupon'},
]

  const ShowCoupon = () => {

    const columns = useMemo(()=>{
    return columnConfig(DT_COUPON_COLUMN)
    },[])
   
    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        actionMenu.push(<EditAction key="edit" href={ADMIN_COUPON_EDIT(row.original._id)}/>)
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType}/>)
        return actionMenu
    }, [])



  return (
    <div>
        <BreadCrumb breadcrumbData={breadcrumbData}/>
        <div className='py-4'>
        <Card className="py-0 max-w-302.5 rounded-3xl shadow-sm gap-0">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
        <div className='flex justify-between items-center'>
          <h4 className='text-xl font-semibold'>Show Coupon</h4>
          
        <Button className='bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white'>
          <FilePlus/>
          <Link href={ADMIN_COUPON_ADD} >New Coupon</Link>
        </Button>

        </div>
        </CardHeader>
        <CardContent className='pb-5 px-0 pt-0'>
           <DatatableWrapper
            querykey="coupon-data"
            fetchUrl="/api/coupon"
            initialPageSize={10}
            columnsConfig={columns}
            exportEndpoint="/api/coupon/export"
            deleteEndpoint="/api/coupon/delete"
            deleteType="SD"
            trashView={`${ADMIN_TRASH}?trashof=coupon`}
            createAction={action}
           />
        </CardContent>
        </Card>
        </div>
    </div>
  )
}

export default ShowCoupon