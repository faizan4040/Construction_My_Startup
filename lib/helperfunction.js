import { NextResponse } from "next/server";

export const response = (success, statusCode, message, data = {}) => {
  return NextResponse.json({
    success,
    statusCode,
    message,
    data,
  })
}

export const catchError = (error, customMessage ) => {
  // handleing duplicate key error
  if(error.code == 11000){
    const keys = Object.keys(error.keyPattern).join(',');
    error.message = `Duplicate field: ${keys}. These field value must be unique.`;
  }
  
  let errorObj = {}

  if(process.env.NODE_ENV === 'development'){
    errorObj = {
      message: error.message,
      error
    }
  } else {
      errorObj = {
      message: customMessage || 'Internal server error.',
    }
  }

// return response(false, error.code || 500, errorObj)
return NextResponse.json({
  success: false,
  statusCode: error.code,
  ...errorObj
})
}


export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 90000).toString()
  return otp
}




// table
export const columnConfig = (
  columns, 
  isCreatedAt = false, 
  isUpdatedAt = false, 
  isDeletedAt= false
  ) =>{
   const newColumns = [...columns]

   if(isCreatedAt) {
    newColumns.push({
      accessorkey: 'createdAt',
      header: 'Created At',
      cell: ({ renderedCellValue }) => (new Date(renderedCellValue).
      toLocaleString())
    })
   }
   
   if(isUpdatedAt){
     newColumns.push({
      accessorkey: 'updatedAt',
      header: 'Updated At',
      cell: ({renderCellValue}) => (new Date(renderCellValue).toLocaleString())
     })
   }


   if(isDeletedAt){
     newColumns.push({
      accessorkey: 'deletedAt',
      header: 'Deleted At',
      cell: ({renderCellValue}) => (new Date(renderCellValue).toLocaleString())
     })
   }

   return newColumns
}



export const statusBadge = (status) => {
  const statusColorConfig = {
    pending: 'bg-blue-500',
    processing: 'bg-yellow-500',
    shipped: 'bg-cyan-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
    unverified: 'bg-orange-500',
  }
  return <span className={`${statusColorConfig[status]} capitalize px-3 py-1 rounded-full text-xs text-white font-semibold`}>{status}</span>
}


