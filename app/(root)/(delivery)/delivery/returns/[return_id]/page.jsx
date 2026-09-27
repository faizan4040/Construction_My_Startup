'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Loader2, Phone, MapPin, Package, ArrowLeft, RotateCcw,
  Wallet, CheckCircle2, ArrowRight,
} from 'lucide-react'
import { showToast } from '@/lib/showToast'

const NEXT_LABEL = {
  approved: 'Mark Picked Up',
  picked_up: 'Mark In Transit',
}

const DeliveryReturnDetailPage = () => {
  const { return_id } = useParams()
  const router = useRouter()

  const [ret, setRet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calling, setCalling] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchReturn = async () => {
    try {
      const { data } = await axios.get(`/api/delivery/returns/${return_id}`)
      if (data.success) setRet(data.data)
      else showToast('error', data.message)
    } catch {
      showToast('error', 'Could not load return.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReturn() }, [return_id])

  const handleCall = async () => {
    setCalling(true)
    try {
      const { data } = await axios.post('/api/delivery/call', { type: 'return', id: return_id })
      showToast(data.success ? 'success' : 'error', data.message)
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Call failed.')
    } finally {
      setCalling(false)
    }
  }

  const handleAdvanceStatus = async () => {
    setUpdating(true)
    try {
      const { data } = await axios.post(`/api/delivery/returns/${return_id}/pickup`)
      if (data.success) {
        showToast('success', data.message)
        fetchReturn()
      } else {
        showToast('error', data.message)
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to update.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  if (!ret) {
    return <div className="text-center py-32 text-gray-400">Return not found.</div>
  }

  const { lat, lng } = ret.location || {}
  const hasLocation = lat && lng
  const isCod = ret.paymentMode === 'cod'
  const nextLabel = NEXT_LABEL[ret.trackingStatus]

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500">
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div className="bg-white border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-orange-600" />
            <h2 className="font-semibold text-gray-900">Return · Order #{ret.orderId}</h2>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 capitalize">
            {ret.trackingStatus.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-md bg-gray-100 overflow-hidden shrink-0">
            {ret.productImage ? (
              <img src={ret.productImage} alt={ret.productName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={20} />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{ret.productName}</p>
            <p className="text-xs text-gray-500">Qty: {ret.qty}</p>
            {ret.attributes?.length > 0 && (
              <p className="text-[11px] text-gray-400">
                {ret.attributes.map((a) => `${a.label}: ${a.value}`).join(' · ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="bg-white border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Return Reason</h3>
        <span
          className={`inline-block text-[11px] px-2 py-0.5 rounded-full mb-2 ${
            ret.reasonCategory === 'wrong_defective' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {ret.reasonCategory === 'wrong_defective' ? 'Wrong / Defective Item' : 'Other'}
        </span>
        <p className="text-sm text-gray-600">{ret.reason}</p>
      </div>

      {/* Customer */}
      <div className="bg-white border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
        <p className="font-medium text-gray-900">{ret.customerName}</p>

        <button
          onClick={handleCall}
          disabled={calling}
          className="flex items-center gap-1.5 text-sm text-blue-600 mt-1 disabled:opacity-50"
        >
          <Phone size={13} /> {calling ? 'Calling...' : 'Call Customer'}
        </button>

        <p className="flex items-start gap-1.5 text-sm text-gray-600 mt-2">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          {ret.address}, {ret.landmark && `${ret.landmark}, `}{ret.city}, {ret.state} - {ret.pincode}
        </p>
      </div>

      {/* Map */}
      {hasLocation && (
        <div className="rounded-2xl overflow-hidden border h-40">
          <iframe
            title="customer-location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
          />
        </div>
      )}

      {/* Refund context — delivery-boy ko pata hona chahiye cash involved hai ya nahi */}
      <div className="bg-white border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Wallet size={15} /> Refund Info
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Original Payment</span>
          <span className="font-medium">{isCod ? 'Cash on Delivery' : 'Paid Online'}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
          {isCod
            ? "Ye COD order tha — customer ko koi cash NAHI dena hai. Refund shop ke through process hoga (agar applicable)."
            : "Ye online-paid order tha — refund seedha customer ke original payment-method me admin/shop dwara process hoga. Aapko koi cash handle nahi karna."}
        </div>
      </div>

      {/* Advance status */}
      {nextLabel && (
        <button
          onClick={handleAdvanceStatus}
          disabled={updating}
          className="w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {updating ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          {updating ? 'Updating...' : nextLabel}
        </button>
      )}

      {ret.trackingStatus === 'in_transit' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-3 text-sm font-medium">
          <CheckCircle2 size={16} /> Item is in transit to warehouse
        </div>
      )}
    </div>
  )
}

export default DeliveryReturnDetailPage