'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import axios from 'axios'
import {
  Loader2, Phone, MapPin, Package, IndianRupee, QrCode,
  Wallet, CheckCircle2, ArrowLeft, Send,
} from 'lucide-react'
import { showToast } from '@/lib/showToast'

// ── Leaflet needs `window` — must be client-only, no SSR ──
const DeliveryMap = dynamic(() => import('@/components/Application/Delivery/DeliveryMap'), {
  ssr: false,
  loading: () => <div className="h-[320px] bg-gray-100 rounded-2xl animate-pulse" />,
})

const DeliveryOrderDetailPage = () => {
  const { order_id } = useParams()
  const router = useRouter()

  const [order, setOrder] = useState(null)
  const [customerLocation, setCustomerLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  const [qrImage, setQrImage] = useState(null)
  const [checkingPayment, setCheckingPayment] = useState(false)

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/delivery/orders/${order_id}/detail`)
      setOrder(data.data)
    } catch {
      showToast('error', 'Could not load order.')
    } finally {
      setLoading(false)
    }
  }, [order_id])

  const fetchLocation = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/delivery/orders/${order_id}/geocode`)
      if (data.success) setCustomerLocation(data.data)
    } catch {}
  }, [order_id])

  useEffect(() => {
    fetchOrder()
    fetchLocation()
  }, [fetchOrder, fetchLocation])

  const item = order?.products?.[0]
  const isCod = order?.paymentMode === 'cod'
  const isPaid = order?.paymentStatus === 'Paid'

  // ── Payment: generate QR ──
  const handleGenerateQR = async () => {
    try {
      const { data } = await axios.post('/api/courier/payment-qr/create', { orderId: order_id })
      if (data.success) {
        setQrImage(data.data.imageUrl)
        pollPaymentStatus()
      } else {
        showToast('error', data.message)
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to generate QR.')
    }
  }

  const pollPaymentStatus = () => {
    setCheckingPayment(true)
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/courier/payment-qr/status?orderId=${order_id}`)
        if (data.data.paid) {
          clearInterval(interval)
          setCheckingPayment(false)
          setQrImage(null)
          showToast('success', 'Payment received!')
          fetchOrder()
        }
      } catch {}
    }, 3000)

    // stop polling after 5 minutes regardless
    setTimeout(() => { clearInterval(interval); setCheckingPayment(false) }, 5 * 60 * 1000)
  }

  const handleMarkCash = async () => {
    try {
      const { data } = await axios.post('/api/courier/mark-cash-collected', { orderId: order_id })
      if (data.success) {
        showToast('success', 'Cash collection recorded.')
        fetchOrder()
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed.')
    }
  }

  // ── OTP flow ──
  const handleSendOtp = async () => {
    try {
      const { data } = await axios.put('/api/courier/deliver', { labelCode: item.labelCode })
      if (data.success) {
        setOtpSent(true)
        showToast('success', 'OTP sent to customer.')
      } else {
        showToast('error', data.message)
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to send OTP.')
    }
  }

  const handleConfirmDelivery = async () => {
    if (otp.trim().length < 4) {
      showToast('error', 'Enter the OTP shared by the customer.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await axios.post('/api/courier/deliver', { labelCode: item.labelCode, otp: otp.trim() })
      if (data.success) {
        showToast('success', 'Delivery confirmed!')
        router.push('/')
      } else {
        showToast('error', data.message)
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Invalid OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  if (!order || !item) {
    return <div className="text-center py-32 text-gray-400">Order not found.</div>
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500">
        <ArrowLeft size={15} /> Back
      </button>

      {/* Order header */}
      <div className="bg-white border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">#{order.order_id}</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 capitalize">
            {order.status?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-gray-700"><Package size={14} className="text-gray-400" /> {item.name} × {item.qty}</p>
          <p className="flex items-center gap-2 text-gray-700"><IndianRupee size={14} className="text-gray-400" /> {order.totalAmount}</p>
          <p className="text-xs text-gray-400 font-mono">Tracking ID: {item.labelCode || '—'}</p>
          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-white border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
        <p className="font-medium text-gray-900">{order.name}</p>
        <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 mt-1">
          <Phone size={13} /> {order.phone}
        </a>
        <p className="flex items-start gap-1.5 text-sm text-gray-600 mt-2">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          {order.address}, {order.landmark && `${order.landmark}, `}{order.city}, {order.state} - {order.pincode}
        </p>
      </div>

      {/* Live map */}
      <DeliveryMap customerLocation={customerLocation} customerName={order.name} />

      {/* Payment collection */}
      <div className="bg-white border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Wallet size={15} /> Payment
        </h3>

        {isPaid ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-3 text-sm font-medium">
            <CheckCircle2 size={16} /> Payment Done
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              {isCod ? 'Cash on Delivery — collect via cash or QR.' : 'Payment pending — collect via QR.'}
            </p>

            {qrImage ? (
              <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-4">
                <img src={qrImage} alt="Payment QR" className="w-48 h-48" />
                {checkingPayment && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" /> Waiting for payment...
                  </p>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateQR}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-xl"
                >
                  <QrCode size={15} /> Collect via QR
                </button>
                {isCod && (
                  <button
                    onClick={handleMarkCash}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-xl"
                  >
                    Cash Received
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* OTP delivery confirmation — locked until payment settled */}
      <div className="bg-white border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Confirm Delivery</h3>

        {!isPaid ? (
          <p className="text-xs text-gray-400">Collect payment above before confirming delivery.</p>
        ) : !otpSent ? (
          <button
            onClick={handleSendOtp}
            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl"
          >
            <Send size={15} /> Send OTP to Customer
          </button>
        ) : (
          <div className="space-y-2">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP from customer"
              maxLength={6}
              className="w-full border rounded-xl px-3 py-2.5 text-sm text-center tracking-widest font-mono"
            />
            <button
              onClick={handleConfirmDelivery}
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Confirm Delivery'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryOrderDetailPage