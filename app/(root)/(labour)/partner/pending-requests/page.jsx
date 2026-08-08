'use client'
import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import axios from 'axios'
import { Clock, IndianRupee, Loader2, MapPin, HardHat } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSocket } from '@/lib/socket-client'

function PendingRequestsPage() {

    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [actingId, setActingId] = useState(null) // tracks which booking's accept/reject is in-flight
    const router = useRouter()

    const fetchPendingRequests = async () => {
        try {
            setLoading(true)
            // NOTE: adjust this path if your actual pending-requests endpoint is named differently
            const { data } = await axios.get("/api/partner/bookings/pending-requests")
            setBookings(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (id) => {
        try {
            setActingId(id)
            await axios.get(`/api/partner/bookings/${id}/accept`)
            router.push("/partner/bookings")
        } catch (error) {
            console.log(error)
            setActingId(null)
        }
    }

    const handleReject = async (id) => {
        try {
            setActingId(id)
            await axios.get(`/api/partner/bookings/${id}/reject`)
            setBookings((prev) => prev.filter((b) => b._id !== id))
        } catch (error) {
            console.log(error)
        } finally {
            setActingId(null)
        }
    }

    useEffect(() => {
        fetchPendingRequests()
    }, [])

    useEffect(() => {
        const socket = getSocket()
        socket.on("new-booking", (data) => {
            setBookings((prev) => [...prev, data])
        })
        return () => {
            socket.off("new-booking")
        }
    }, [])

    return (
        <div className='min-h-screen bg-[#f4f5f7]'>
            <div className='bg-white border-b border-gray-200'>
                <div className='max-w-6xl mx-auto px-6 py-16'>
                    <h1 className='text-4xl font-semibold text-gray-900'>Job Requests</h1>
                    <p className='mt-3 text-gray-500 text-lg'>Manage incoming job requests and respond in real time.</p>
                </div>
            </div>

            <div className='max-w-6xl mx-auto px-6 py-12'>
                {loading ? (
                    <div className='flex justify-center py-20'>
                        <Loader2 className="animate-spin w-8 h-8 text-gray-700" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className='bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm'>
                        <p className='text-gray-500 text-lg'>No pending job requests.</p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {bookings.map((b) => (
                            <motion.div
                                key={b._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.25 }}
                                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition"
                            >
                                <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>

                                    <div className="flex-1 space-y-6">

                                        <div className='flex gap-4'>
                                            <div className='bg-gray-100 p-3 rounded-lg flex items-center justify-center'>
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className='text-xs uppercase text-gray-400 mb-1'>Work Location</p>
                                                <p className='text-gray-900 font-medium'>{b.workAddress}</p>
                                            </div>
                                        </div>

                                        <div className='flex gap-4'>
                                            <div className='bg-gray-100 p-3 rounded-lg flex items-center justify-center'>
                                                <HardHat size={18} />
                                            </div>
                                            <div>
                                                <p className='text-xs uppercase text-gray-400 mb-1'>Work Type</p>
                                                <p className='text-gray-900 font-medium capitalize'>
                                                    {b.category} • {b.duration} {b.pricingType === "hourly" ? "hrs" : "days"} @ ₹{b.ratePerUnit}/{b.pricingType === "hourly" ? "hr" : "day"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-2 text-sm text-gray-500 mt-2'>
                                            <Clock size={14} className="opacity-70" />
                                            <span className='font-medium'>
                                                {b.createdAt && new Date(b.createdAt).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='flex flex-col justify-between lg:items-end gap-6 w-full lg:w-auto'>

                                        <div className='text-left lg:text-right'>
                                            <p className='text-xs tracking-wide text-gray-400 uppercase mb-1'>Estimated Fare</p>
                                            <div className='flex items-center gap-2 text-3xl font-bold text-gray-900 lg:justify-end'>
                                                <IndianRupee size={20} />
                                                {b.fare}
                                            </div>
                                        </div>

                                        <div className='flex gap-4 w-full lg:w-auto'>
                                            <button
                                                onClick={() => handleReject(b._id)}
                                                disabled={actingId === b._id}
                                                className='flex-1 lg:flex-none
                                                    px-6 py-3
                                                    rounded-xl
                                                    border border-gray-300
                                                    bg-white
                                                    text-gray-700
                                                    text-sm font-semibold
                                                    hover:bg-gray-100
                                                    transition-all duration-200
                                                    active:scale-[0.98]
                                                    disabled:opacity-50'
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleAccept(b._id)}
                                                disabled={actingId === b._id}
                                                className='flex-1 lg:flex-none
                                                    px-8 py-3
                                                    rounded-xl
                                                    bg-black
                                                    text-white
                                                    text-sm font-semibold
                                                    shadow-md
                                                    hover:bg-gray-900
                                                    hover:shadow-lg
                                                    transition-all duration-200
                                                    active:scale-[0.98]
                                                    disabled:opacity-50
                                                    flex items-center justify-center'
                                            >
                                                {actingId === b._id ? "Accepting..." : "Accept Job"}
                                            </button>
                                        </div>

                                    </div>

                                </div>

                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}

export default PendingRequestsPage