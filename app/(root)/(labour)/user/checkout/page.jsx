import CheckOutContent from '@/components/Application/Labour/CheckOutContent'
import React, { Suspense } from 'react'

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckOutContent />
    </Suspense>
  )
}

export default Page