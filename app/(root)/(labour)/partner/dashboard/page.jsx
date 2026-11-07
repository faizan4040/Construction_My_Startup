'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { login } from '@/store/reducer/authReducer'
import PartnerHome from '@/components/Application/Labour/PartnerHome'
import PartnerDashboard from '@/components/Application/Labour/PartnerDashboard'

/*
  Single entry point for a labour after login:
   - never registered (step 0)        -> registration form
   - registered, review not finished  -> onboarding progress (documents, KYC, pricing...)
   - approved + live                  -> work dashboard (duty ON/OFF, jobs, wallet)
*/
export default function PartnerDashboardPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [view, setView] = useState('loading')

  useEffect(() => {
    let off = false
    ;(async () => {
      try {
        const { data: me } = await axios.get('/api/auth/me')
        if (off) return
        dispatch(login(me))
        if (me.role !== 'laber') return router.replace('/')
        if (!me.partnerOnBoardingSteps) return router.replace('/partner/onboarding/labour')
        const live = me.partnerStatus === 'approved' && me.partnerOnBoardingSteps >= 7
        setView(live ? 'home' : 'onboarding')
      } catch {
        router.replace('/auth/login?callback=/partner/dashboard')
      }
    })()
    return () => { off = true }
  }, [dispatch, router])

  if (view === 'loading')
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-zinc-400" /></div>
  return view === 'home' ? <PartnerHome onNotLive={() => setView('onboarding')} /> : <PartnerDashboard />
}
