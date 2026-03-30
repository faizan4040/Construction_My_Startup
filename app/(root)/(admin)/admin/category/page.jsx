'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import EditAction from '@/components/Application/Admin/EditAction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_CATEGORY_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_EDIT, ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_TRASH } from '@/routes/AdminPanelRoute'
import { FilePlus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'

const breadcrumbData = [
  {href: ADMIN_DASHBOARD, label: 'Home'},
  {href: ADMIN_CATEGORY_SHOW, label: 'Category'},
]

  const ShowCategory = () => {

    const columns = useMemo(()=>{
    return columnConfig(DT_CATEGORY_COLUMN)
    },[])
   
    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        actionMenu.push(<EditAction key="edit" href={ADMIN_CATEGORY_EDIT(row.original._id)}/>)
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType}/>)
        return actionMenu
    }, [])



  return (
    <div>
        <BreadCrumb breadcrumbData={breadcrumbData}/>

        <div className='py-4'>
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
        <div className='flex justify-between items-center'>
          <h4 className='text-xl font-semibold'>Show Category</h4>
          
        <Button className='bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white'>
          <FilePlus/>
          <Link href={ADMIN_CATEGORY_ADD} >New Category</Link>
        </Button>

        </div>
        </CardHeader>
        <CardContent className='pb-5 px-0'>
           <DatatableWrapper
            querykey="category-data"
            fetchUrl="/api/category"
            initialPageSize={10}
            columnsConfig={columns}
            exportEndpoint="/api/category/export"
            deleteEndpoint="/api/category/delete"
            deleteType="SD"
            trashView={`${ADMIN_TRASH}?trashof=category`}
            createAction={action}
           />
        </CardContent>
        </Card>
        </div>
    </div>
  )
}

export default ShowCategory