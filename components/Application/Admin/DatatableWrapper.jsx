'use client'

import React, { useEffect, useState } from 'react'
import { ThemeProvider, useTheme } from '@mui/material'
import { darkTheme, lightTheme } from '@/lib/materialTheme'
import Datatable from './Datatable'

const DatatableWrapper = ({
    querykey, 
    fetchUrl,
    columnsConfig,
    initialPageSize = 10,
    exportEndpoint,
    deleteEndpoint,
    deleteType,
    trashView,
    createAction
}) => {

  const {resolvedTheme} = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(()=>{
    setMounted(true)  
  },[])

  if(!mounted) return null

  return (
     <ThemeProvider theme={resolvedTheme === 'dark' ? darkTheme : lightTheme}>
        <Datatable
          querykey={querykey}
          fetchUrl={fetchUrl}
          columnsConfig={columnsConfig}
          initialPageSize={initialPageSize}
          exportEndpoint={exportEndpoint}
          deleteEndpoint={deleteEndpoint}
          deleteType={deleteType}
          trashView={trashView}
          createAction={createAction}
        />
     </ThemeProvider>

  )
}

export default DatatableWrapper