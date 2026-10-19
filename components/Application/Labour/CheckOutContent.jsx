'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle, ArrowRight, CheckCircle, Clock, CreditCard, HardHat,
  IndianRupee, Loader2, MapPin, Shield, XCircle,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { connectSocket, getSocket } from '@/lib/socket-client'

const POLL_MS = 8000
const IN_PROGRESS = ["arrived", "started", "work_completed"]

const DURATION_LABEL = {
  day: "1 Day",
  week: "7 Days",
  month: "1 Month",
  year: "1 Year",
}

function Countdown({ expiresAt }) {
  const calc = () =>
    Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
  const [left, setLeft] = useState(calc)

  useEffect(() => {
    setLeft(calc())
    const t = setInterval(() => setLeft(calc()), 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  const m = Math.floor(left / 60)
  const s = String(left % 60).padStart(2, "0")
  return (
    <span className="text-xs font-bold text-zinc-500">
      Request expires in {m}:{s}
    </span>
  )
}

function CheckOutContent() {
  const router = useRouter()
  const params = useSearchParams()
  const auth = useSelector((store) => store.authStore.auth)
  const myId = auth?._id ?? auth?.id

  const address = params.get("address") || ""
  const siteDetails = params.get("siteDetails") || ""
  const mobile = params.get("mobile") || ""
  const lat = Number(params.get("lat"))
  const lon = Number(params.get("lon"))
  const category = params.get("category") || ""
  const labourId = params.get("labourId") || ""
  const duration = params.get("duration") || "day"
  const pricingType = params.get("pricingType") || "daily"
  const fare = params.get("fare") || ""
  const ratePerUnit = params.get("ratePerUnit") || ""

  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  // idle | requested | confirmed | rejected | expired
  const [status, setStatus] = useState("idle")
  const [booking, setBooking] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")

  // once a booking exists the server's fare wins over the URL's display value
  const shownFare = booking?.fare ?? fare
  const shownCategory = booking?.category || category

  const applyBooking = useCallback((b) => {
    setBooking(b)
    setStatus(b?.bookingStatus ?? "idle")
  }, [])

  const fetchActiveBooking = useCallback(
    async ({ markExpiredIfNone = false } = {}) => {
      try {
        const { data } = await axios.get("/api/booking/active")
        const b = data.booking
        if (b) {
          if (IN_PROGRESS.includes(b.bookingStatus)) {
            router.replace(`/user/booking/${b._id}`)
            return
          }
          applyBooking(b)
        } else {
          // no active booking on server
          setBooking(null)
          setStatus((prev) =>
            markExpiredIfNone && prev === "requested" ? "expired" : prev === "requested" ? "idle" : prev
          )
        }
      } catch (error) {
        if (error.response?.status === 401) router.push("/auth/login")
        else console.log(error)
      }
    },
    [applyBooking, router]
  )

  const handleRequestBooking = async () => {
    if (loading) return
    if (!labourId || !category || !mobile || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      setErrorMsg("Booking details are incomplete. Please go back and select again.")
      return
    }
    setLoading(true)
    setErrorMsg("")
    try {
      const { data } = await axios.post("/api/booking/create", {
        labourId,
        category,
        pricingType,
        durationKey: duration,
        workAddress: address,
        siteDetails,
        workLocation: { latitude: lat, longitude: lon },
        mobileNumber: mobile,
      })
      applyBooking(data.booking)
    } catch (error) {
      const res = error.response
      if (res?.status === 401) {
        router.push("/auth/login")
        return
      }
      if (res?.status === 409 && res.data?.booking) {
        applyBooking(res.data.booking) // an active booking already exists
      } else {
        setErrorMsg(res?.data?.message || "Could not send the request. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // NOTE: cancel route abhi GET hai (file dekhi nahi). File bhejo, POST bana dunga.
  const handleCancel = async () => {
    if (!booking?._id || cancelling) return
    setCancelling(true)
    setErrorMsg("")
    try {
      await axios.post(`/api/booking/${booking._id}/cancel`)
      setBooking(null)
      setStatus("idle")
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Could not cancel. Please try again.")
      fetchActiveBooking()
    } finally {
      setCancelling(false)
    }
  }

  // customer's own socket: connect + identity (GeoUpdater only runs for labour)
  useEffect(() => {
    if (!myId) return
    const socket = connectSocket({ userId: myId })
    const sendIdentity = () => socket.emit("identity", myId)
    socket.on("connect", sendIdentity)
    if (socket.connected) sendIdentity()
    return () => {
      socket.off("connect", sendIdentity)
    }
  }, [myId])

  // live events (named handlers: off() removes only OUR listeners)
  useEffect(() => {
    const socket = getSocket()
    const onAccept = (payload) => {
      if (payload?.booking) applyBooking(payload.booking)
      else fetchActiveBooking()
    }
    const onReject = () => {
      setBooking(null)
      setStatus("rejected")
    }
    socket.on("accept-booking", onAccept)
    socket.on("reject-booking", onReject)
    return () => {
      socket.off("accept-booking", onAccept)
      socket.off("reject-booking", onReject)
    }
  }, [applyBooking, fetchActiveBooking])

  // initial load: resume an existing active booking if there is one
  useEffect(() => {
    fetchActiveBooking()
  }, [fetchActiveBooking])

  // fallback if a socket event is missed: poll while waiting for labour
  useEffect(() => {
    if (status !== "requested") return
    const t = setInterval(() => {
      if (document.visibilityState === "visible") fetchActiveBooking({ markExpiredIfNone: true })
    }, POLL_MS)
    return () => clearInterval(t)
  }, [status, fetchActiveBooking])

  // request timed out on the server -> reflect it in the UI
  useEffect(() => {
    if (status !== "requested" || !booking?.requestExpiresAt) return
    const ms = new Date(booking.requestExpiresAt).getTime() - Date.now() + 1500
    const t = setTimeout(() => fetchActiveBooking({ markExpiredIfNone: true }), Math.max(ms, 0))
    return () => clearTimeout(t)
  }, [status, booking?.requestExpiresAt, fetchActiveBooking])

  return (
    <div className='min-h-screen bg-zinc-100 px-4 py-12'>
      <div className='relative max-w-6xl mx-auto z-10'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className='flex items-center gap-2 mb-2'>
            <div className='h-px w-8 bg-zinc-900' />
            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400'>Booking</span>
          </div>
          <h1 className='text-4xl font-black tracking-tight text-zinc-900'>Checkout</h1>
          <p className='text-zinc-400 text-sm mt-1.5 font-medium'>Review your labour booking and confirm</p>
        </motion.div>

        <div className='grid lg:grid-cols-2 gap-6'>
          {/* ───────── Summary card ───────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
          >
            <div className='h-1 bg-zinc-900' />
            <div className='p-8 sm:p-10'>

              <div className='flex items-center justify-between mb-8'>
                <div>
                  <div className='text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1'>Category</div>
                  <div className='text-3xl font-black tracking-tight text-zinc-900 capitalize'>
                    {shownCategory.replace(/-/g, " ")}
                  </div>
                </div>
                <div className='w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg'>
                  <HardHat size={28} className="text-white" />
                </div>
              </div>

              <div className='bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-8'>
                <div className='flex gap-4 px-5 py-4'>
                  <div className='flex flex-col items-center flex-shrink-0 pt-0.5'>
                    <div className='w-3 h-3 rounded-full bg-zinc-900 border-2 border-white ring-1 ring-zinc-300' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5'>Work Site</div>
                    <div className='text-sm font-semibold text-zinc-900 leading-snug'>
                      {(booking?.siteDetails ?? siteDetails) ? `${booking?.siteDetails ?? siteDetails}, ` : ""}
                      {booking?.workAddress ?? address}
                    </div>
                  </div>
                  <MapPin size={14} className="text-zinc-400 flex-shrink-0 mt-1" />
                </div>
              </div>

              <div className='bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-8 flex items-center justify-between px-5 py-4'>
                <div>
                  <div className='text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5'>Duration</div>
                  <div className='text-sm font-semibold text-zinc-900'>
                    {DURATION_LABEL[duration] || duration}
                  </div>
                </div>
                <Clock size={16} className="text-zinc-400" />
              </div>

              <div className='flex items-end justify-between pt-6 border-t border-zinc-100'>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1'>Total Fare</p>
                  <p className='text-zinc-400 text-xs font-medium'>
                    {ratePerUnit
                      ? `₹${Number(ratePerUnit).toLocaleString("en-IN")} × ${DURATION_LABEL[duration] || duration}`
                      : "Includes applicable discount"}
                  </p>
                  <p className='text-zinc-400 text-[10px] font-medium mt-1'>Payable after the work is completed</p>
                </div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="flex items-baseline gap-1"
                >
                  <IndianRupee size={22} className="text-zinc-400 self-center" strokeWidth={2.5} />
                  <span className='text-zinc-900 text-5xl font-black tracking-tight leading-none'>
                    {shownFare !== "" && shownFare != null ? Number(shownFare).toLocaleString("en-IN") : "—"}
                  </span>
                </motion.div>
              </div>

            </div>
          </motion.div>

          {/* ───────── Status card ───────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] flex flex-col"
          >
            <div className='h-1 bg-zinc-900' />
            <div className='flex-1 p-8 sm:p-10 flex flex-col'>
              <AnimatePresence mode="wait">

                {/* idle / rejected / expired */}
                {["idle", "rejected", "expired"].includes(status) && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col flex-1 justify-between"
                  >
                    <div>
                      {status === "rejected" && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl px-3 py-2 mb-4">
                          <AlertCircle size={14} /> Labour is not available right now. Please pick another one.
                        </div>
                      )}
                      {status === "expired" && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl px-3 py-2 mb-4">
                          <AlertCircle size={14} /> No response in time. You can try again or choose another labour.
                        </div>
                      )}

                      <p className='text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1'>Ready to go?</p>
                      <h3 className='text-2xl font-black text-zinc-900 mb-6'>Confirm Your Booking</h3>
                      <div className='bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-3'>
                        {[
                          { icon: <Clock size={14} />, text: "Labour will respond within 2 minutes" },
                          { icon: <Shield size={14} />, text: "Verified & approved workers only" },
                          { icon: <CreditCard size={14} />, text: "Pay after the work is completed" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className='w-7 h-7 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-600 flex-shrink-0'>{item.icon}</div>
                            <p className='text-zinc-500 text-xs font-medium'>{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      {errorMsg && (
                        <p className="text-red-500 text-xs font-semibold mt-6">{errorMsg}</p>
                      )}
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        whileHover={loading ? {} : { scale: 1.02 }}
                        disabled={loading}
                        onClick={handleRequestBooking}
                        className="w-full h-14 mt-8 bg-zinc-900 hover:bg-black disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-md"
                      >
                        {loading ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <><span>Request Booking</span><ArrowRight size={15} /></>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* waiting for labour */}
                {status === "requested" && (
                  <motion.div
                    key="requested"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col flex-1 items-center justify-center gap-6 text-center"
                  >
                    <div className='relative'>
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-zinc-900"
                      />
                      <div className='relative w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center'>
                        <Loader2 size={28} className='text-zinc-900 animate-spin' />
                      </div>
                    </div>
                    <div>
                      <h3 className='text-xl font-black text-zinc-900 mb-1'>Finding Your Labour</h3>
                      <p className='text-zinc-400 text-sm font-medium mb-1'>Waiting for labour to accept…</p>
                      {booking?.requestExpiresAt && <Countdown expiresAt={booking.requestExpiresAt} />}
                    </div>
                    {errorMsg && <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>}
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 disabled:opacity-50 transition-colors border border-zinc-200 hover:border-zinc-400 px-4 py-2.5 rounded-xl"
                    >
                      {cancelling ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                      Cancel Request
                    </button>
                  </motion.div>
                )}

                {/* labour accepted */}
                {status === "confirmed" && (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col flex-1 items-center justify-center gap-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.1 }}
                      className="relative"
                    >
                      <div className='w-24 h-24 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center'>
                        <CheckCircle size={44} className="text-zinc-900" />
                      </div>
                      {[0, 1].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 2.2 + i * 0.6, opacity: 0 }}
                          transition={{ duration: 0.9, delay: 0.2 + i * 0.15 }}
                          className="absolute inset-0 rounded-full border-2 border-zinc-900"
                        />
                      ))}
                    </motion.div>

                    <div className="w-full">
                      <motion.h3
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="text-2xl font-black text-zinc-900 mb-1"
                      >
                        Labour Accepted!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="text-zinc-400 text-sm font-medium max-w-xs mx-auto mb-4"
                      >
                        Your labour is on the way. Track live from the booking screen.
                      </motion.p>

                      {/* name + photo only — phone number is never sent to the customer */}
                      {booking?.labour && (
                        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 max-w-xs mx-auto">
                          {booking.labour.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={booking.labour.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center">
                              <HardHat size={18} className="text-zinc-500" />
                            </div>
                          )}
                          <div className="text-left min-w-0">
                            <p className="text-sm font-bold text-zinc-900 truncate">{booking.labour.name}</p>
                            <p className="text-xs text-zinc-400 capitalize">
                              {(booking.category || "").replace(/-/g, " ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => booking?._id && router.push(`/user/booking/${booking._id}`)}
                      className="flex items-center gap-2.5 bg-zinc-900 hover:bg-black text-white font-black text-sm px-8 py-4 rounded-2xl transition-colors shadow-md"
                    >
                      Track Booking <ArrowRight size={16} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CheckOutContent