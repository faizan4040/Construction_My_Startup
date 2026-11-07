import { Suspense } from 'react'
import ServicesPage from '@/components/Services/ServicesPage'

export const metadata = { title: 'Home & Construction Services | ConstructEzy' }

export default function Page() {
  return <Suspense fallback={<div className="h-screen" />}><ServicesPage /></Suspense>
}