'use client'

import axios from 'axios'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const CancelOrderButton = ({ orderId, status }) => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()

  const cancellableStatuses = ['pending', 'on_hold']
  if (!cancellableStatuses.includes(status)) return null

  const handleCancel = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/orders/${orderId}/cancel`
      )

      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Order cancelled successfully.' })
        setConfirmOpen(false)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.message || 'Could not cancel order.' })
      }
    } catch (error) {
      console.error('CANCEL ORDER ERROR:', error?.response?.data || error.message)
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Something went wrong.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 min-w-[110px]">
      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="text-[11px] font-semibold text-red-600 hover:text-red-700
                     underline underline-offset-2 whitespace-nowrap"
        >
          Cancel Order
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-white border border-red-200
                         rounded-md shadow-sm px-2 py-1 whitespace-nowrap">
          <span className="text-[11px] text-gray-600">Cancel?</span>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600
                       hover:bg-red-700 text-white text-[11px] font-semibold
                       disabled:opacity-50"
          >
            {loading && <Loader2 size={10} className="animate-spin" />}
            Yes
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={loading}
            className="px-2 py-0.5 rounded border border-gray-300 text-gray-600
                       text-[11px] font-semibold hover:bg-gray-100 disabled:opacity-50"
          >
            No
          </button>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center gap-1 text-[11px] font-medium whitespace-nowrap
          ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={12} />
          ) : (
            <AlertCircle size={12} />
          )}
          {message.text}
        </div>
      )}
    </div>
  )
}

export default CancelOrderButton