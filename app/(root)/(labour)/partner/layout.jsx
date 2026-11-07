'use client'
import { usePathname } from 'next/navigation'
import LabourHeader from '@/components/Website/LabourHeader'
import LabourBackground from '@/components/Application/Labour/LabourBackground'

// Every /partner/* page: labour header, GPS while on duty, job alerts with sound.
export default function PartnerLayout({ children }) {
  const pathname = usePathname()
  const onboarding = pathname.startsWith('/partner/onboarding')
  return (
    <>
      <LabourHeader />
      <LabourBackground />
      <main className={onboarding ? 'pt-20' : ''}>{children}</main>
    </>
  )
}
