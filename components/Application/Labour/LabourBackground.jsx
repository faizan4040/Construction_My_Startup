'use client'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import GeoUpdater from './GeoUpdater'
import LabourAlerts from './LabourAlerts'

/**
 * Invisible services for a logged-in labour. Mounted ONCE per layout:
 *  - GPS streaming while on duty (or while a job is running)
 *  - job alerts with sound + block / kick handling
 * The duty toggle fires window event "labour-availability" so this reacts instantly.
 */
export default function LabourBackground() {
  const auth = useSelector((s) => s.authStore.auth)
  const userId = auth?.role === 'laber' ? auth?._id ?? auth?.id : null
  const [st, setSt] = useState({ live: false, online: false, hasActiveJob: false })

  const load = useCallback(async () => {
    try { const { data } = await axios.get('/api/partner/availability'); setSt(data) } catch { /* not approved / logged out */ }
  }, [])

  useEffect(() => {
    if (!userId) return
    load()
    const onChange = (e) => (e.detail ? setSt((s) => ({ ...s, ...e.detail })) : load())
    const onJobs = () => load()
    window.addEventListener('labour-availability', onChange)
    window.addEventListener('labour-jobs-changed', onJobs)
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 60000)
    return () => {
      window.removeEventListener('labour-availability', onChange)
      window.removeEventListener('labour-jobs-changed', onJobs)
      clearInterval(t)
    }
  }, [userId, load])

  if (!userId) return null
  return (
    <>
      <GeoUpdater userId={userId} enabled={st.live && (st.online || st.hasActiveJob)} />
      {st.live && <LabourAlerts />}
    </>
  )
}
