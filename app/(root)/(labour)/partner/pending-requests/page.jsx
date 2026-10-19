'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import axios from 'axios'
import {
  AlertCircle, Clock, IndianRupee, Loader2, MapPin, HardHat, Navigation,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSocket } from '@/lib/socket-client'

function Countdown({ expiresAt, onExpire }) {
  const calc = () =>
    Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
  const [left, setLeft] = useState(calc)

  useEffect(() => {
    let done = false
    const tick = () => {
      const s = calc()
      setLeft(s)
      if (s === 0 && !done) {
        done = true
        onExpire?.()
      }
    }
    tick() // handles a request that is already expired on mount
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt])

  const m = Math.floor(left / 60)
  const s = String(left % 60).padStart(2, "0")
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${left <= 20 ? "text-red-500" : "text-amber-600"}`}>
      <Clock size={14} />
      Expires in {m}:{s}
    </span>
  )
}

function PendingRequestsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true) // first load only
  const [actingId, setActingId] = useState(null)
  const [actingType, setActingType] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const removeBooking = useCallback(
    (id) => setBookings((prev) => prev.filter((b) => b._id !== id)),
    []
  )

  const fetchPendingRequests = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true)
      const { data } = await axios.get("/api/partner/bookings/pending-requests")
      setBookings(Array.isArray(data) ? data : [])
      if (!silent) setError("")
    } catch (e) {
      if (e.response?.status === 401) {
        router.push("/auth/login")
        return
      }
      if (!silent) setError("Could not load requests")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [router])

  const handleAccept = async (id) => {
    if (actingId) return
    try {
      setActingId(id)
      setActingType("accept")
      setError("")
      await axios.post(`/api/partner/bookings/${id}/accept`)
      router.push("/partner/bookings")
    } catch (e) {
      setError(e.response?.data?.message || "Could not accept this request")
      setActingId(null)
      setActingType("")
      fetchPendingRequests({ silent: true })
    }
  }

  const handleReject = async (id) => {
    if (actingId) return
    try {
      setActingId(id)
      setActingType("reject")
      setError("")
      await axios.post(`/api/partner/bookings/${id}/reject`)
      removeBooking(id)
    } catch (e) {
      setError(e.response?.data?.message || "Could not reject this request")
      fetchPendingRequests({ silent: true })
    } finally {
      setActingId(null)
      setActingType("")
    }
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [fetchPendingRequests])

  // live events (named handlers: off() removes only OUR listeners)
  useEffect(() => {
    const socket = getSocket()
    const onNew = (data) =>
      setBookings((prev) => (prev.some((b) => b._id === data._id) ? prev : [data, ...prev]))
    const onCancelled = ({ bookingId }) => removeBooking(bookingId)
    const onReconnect = () => fetchPendingRequests({ silent: true })

    socket.on("new-booking", onNew)
    socket.on("booking-cancelled", onCancelled)
    socket.on("connect", onReconnect) // catch anything missed while offline
    return () => {
      socket.off("new-booking", onNew)
      socket.off("booking-cancelled", onCancelled)
      socket.off("connect", onReconnect)
    }
  }, [fetchPendingRequests, removeBooking])

  // refresh when the labour comes back to this tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchPendingRequests({ silent: true })
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [fetchPendingRequests])

  return (
    <div className='min-h-screen bg-[#f4f5f7]'>
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-6 pt-32 pb-12 sm:pt-36'>
          <div className='flex items-center gap-3'>
            <h1 className='text-4xl font-semibold text-gray-900'>Job Requests</h1>
            {bookings.length > 0 && (
              <span className='min-w-8 h-8 px-2 rounded-full bg-[#F5A623] text-black text-sm font-bold flex items-center justify-center'>
                {bookings.length}
              </span>
            )}
          </div>
          <p className='mt-3 text-gray-500 text-lg'>
            Manage incoming job requests and respond in real time.
          </p>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-6 py-12'>
        {error && (
          <div className='flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl px-4 py-3 mb-6'>
            <AlertCircle size={16} className='shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className="animate-spin w-8 h-8 text-gray-700" />
          </div>
        ) : bookings.length === 0 ? (
          <div className='bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm'>
            <p className='text-gray-500 text-lg'>No pending job requests.</p>
            <p className='text-gray-400 text-sm mt-2'>
              Keep this app open with location on to receive new requests.
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            <AnimatePresence initial={false}>
              {bookings.map((b) => {
                const busy = actingId === b._id
                return (
                  <motion.div
                    key={b._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition"
                  >
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>

                      <div className="flex-1 space-y-6 min-w-0">

                        <div className='flex gap-4'>
                          <div className='bg-gray-100 p-3 rounded-lg flex items-center justify-center h-fit shrink-0'>
                            <MapPin size={18} />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-xs uppercase text-gray-400 mb-1'>Work Location</p>
                            <p className='text-gray-900 font-medium break-words'>{b.workAddress}</p>
                          </div>
                        </div>

                        <div className='flex gap-4'>
                          <div className='bg-gray-100 p-3 rounded-lg flex items-center justify-center h-fit shrink-0'>
                            <HardHat size={18} />
                          </div>
                          <div>
                            <p className='text-xs uppercase text-gray-400 mb-1'>Work Type</p>
                            <p className='text-gray-900 font-medium capitalize'>
                              {(b.category || "").replace(/-/g, " ")} • {b.duration}{" "}
                              {b.pricingType === "hourly" ? "hrs" : "days"} @ ₹
                              {Number(b.ratePerUnit).toLocaleString("en-IN")}/
                              {b.pricingType === "hourly" ? "hr" : "day"}
                            </p>
                          </div>
                        </div>

                        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500'>
                          {b.distanceKm != null && (
                            <span className='inline-flex items-center gap-1.5 font-medium'>
                              <Navigation size={14} className="opacity-70" />
                              {b.distanceKm} km away
                            </span>
                          )}
                          {b.requestExpiresAt && (
                            <Countdown
                              expiresAt={b.requestExpiresAt}
                              onExpire={() => removeBooking(b._id)}
                            />
                          )}
                        </div>

                        <div className='flex items-center gap-2 text-sm text-gray-400'>
                          <span className='font-medium'>
                            Received{" "}
                            {b.createdAt &&
                              new Date(b.createdAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </span>
                        </div>
                      </div>

                      <div className='flex flex-col justify-between lg:items-end gap-6 w-full lg:w-auto'>

                        <div className='text-left lg:text-right'>
                          <p className='text-xs tracking-wide text-gray-400 uppercase mb-1'>Estimated Fare</p>
                          <div className='flex items-center gap-1 text-3xl font-bold text-gray-900 lg:justify-end'>
                            <IndianRupee size={22} />
                            {Number(b.fare).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className='flex gap-4 w-full lg:w-auto'>
                          <button
                            type="button"
                            onClick={() => handleReject(b._id)}
                            disabled={!!actingId}
                            className='flex-1 lg:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2'
                          >
                            {busy && actingType === "reject" ? (
                              <><Loader2 size={14} className="animate-spin" /> Rejecting...</>
                            ) : (
                              "Reject"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAccept(b._id)}
                            disabled={!!actingId}
                            className='flex-1 lg:flex-none px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2'
                          >
                            {busy && actingType === "accept" ? (
                              <><Loader2 size={14} className="animate-spin" /> Accepting...</>
                            ) : (
                              "Accept Job"
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default PendingRequestsPage