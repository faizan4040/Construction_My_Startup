'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { Store, Package, ShoppingCart, IndianRupee, Loader2 } from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { showToast } from '@/lib/showToast'
import { IMAGES } from '@/routes/AllImages'
import { ADMIN_DASHBOARD, ADMIN_SHOPOWNER_TRACKER_DETAILS } from '@/routes/AdminPanelRoute'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Shopowner Tracker' },
]

const ShopownerTracker = () => {
  const [shopOwners, setShopOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/admin/shopowner-tracker')
      if (data.success) setShopOwners(data.data)
    } catch (err) {
      showToast('error', 'Failed to load shopowners.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleToggle = async (owner) => {
    const block = !owner.isBlocked
    if (block) {
      const reason = window.prompt(`Block "${owner.shop?.name || owner.name}"? Enter a reason (optional):`)
      if (reason === null) return // cancelled
      await doToggle(owner._id, true, reason || '')
    } else {
      if (!window.confirm(`Unblock "${owner.shop?.name || owner.name}"?`)) return
      await doToggle(owner._id, false, '')
    }
  }

  const doToggle = async (userId, block, reason) => {
    setTogglingId(userId)
    try {
      const { data } = await axios.put('/api/admin/shopowner-tracker/toggle-block', { userId, block, reason })
      if (!data.success) throw new Error(data.message)
      showToast('success', data.message)
      fetchData()
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message)
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="mt-4 mb-6 rounded-2xl sm:rounded-3xl bg-linear-to-br from-orange-500 via-orange-400 to-amber-300 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm"><Store className="h-6 w-6" /></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Shopowner Tracker</h1>
            <p className="text-sm text-orange-50 mt-0.5">Monitor every shop's listings and earnings, and manage access.</p>
          </div>
        </div>
      </div>

      {!shopOwners.length ? (
        <div className="text-center py-20 text-gray-400">No shopowners yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shopOwners.map((owner) => (
            <Card key={owner._id} className="rounded-2xl shadow-sm border-gray-200/70 overflow-hidden">
              <div className={`h-1.5 ${owner.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border shrink-0 bg-gray-100">
                    <Image src={owner.avatar?.url || IMAGES.profile} alt={owner.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <Link href={ADMIN_SHOPOWNER_TRACKER_DETAILS(owner._id)} className="font-semibold text-sm truncate hover:underline block">
                      {owner.shop?.name || 'No Shop'}
                    </Link>
                    <p className="text-xs text-gray-500 truncate">{owner.name} · {owner.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <Package size={14} className="mx-auto text-orange-500 mb-1" />
                    <p className="text-sm font-bold">{owner.productCount}</p>
                    <p className="text-[10px] text-gray-400">Products</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <ShoppingCart size={14} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-sm font-bold">{owner.orderCount}</p>
                    <p className="text-[10px] text-gray-400">Orders</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <IndianRupee size={14} className="mx-auto text-green-500 mb-1" />
                    <p className="text-sm font-bold">₹{Number(owner.earnings).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400">Earnings</p>
                  </div>
                </div>

                {owner.isBlocked && owner.blockReason && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-lg p-2 mb-3">Reason: {owner.blockReason}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${owner.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {owner.isBlocked ? 'Blocked' : 'Active'}
                  </span>

                  <button
                    onClick={() => handleToggle(owner)}
                    disabled={togglingId === owner._id}
                    className={`relative w-12 h-6 rounded-full transition-colors ${owner.isBlocked ? 'bg-gray-300' : 'bg-green-500'} disabled:opacity-50`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${owner.isBlocked ? 'translate-x-0.5' : 'translate-x-6'}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ShopownerTracker