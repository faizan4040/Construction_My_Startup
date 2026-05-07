"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  RiArrowLeftSLine, RiArrowRightSLine, RiStarFill,
  RiMapPinLine, RiTimeLine, RiUser3Line
} from "react-icons/ri"
import axios from "axios"
import Link from "next/link"

const MAX_WORKERS = 12

const LaborSlider = () => {
  const sliderRef = useRef(null)
  const [workers, setWorkers]   = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchWorkers = async () => {
    setLoading(true)
    try {
      // ✅ Correct URL — /api/labour/all
      const { data } = await axios.get(`/api/labour/all?limit=${MAX_WORKERS}`)
      const workerArray = Array.isArray(data.profiles) ? data.profiles : []
      setWorkers(workerArray.slice(0, MAX_WORKERS))
    } catch (err) {
      console.error("LaborSlider fetch error:", err)
      setWorkers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWorkers() }, [])

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -320, behavior: "smooth" })
  const scrollRight = () => sliderRef.current?.scrollBy({ left:  320, behavior: "smooth" })

  return (
    <section
      className="w-full px-4 sm:px-8 lg:px-16 py-12"
      style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-2">
            Skilled Workforce
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900">
            Featured <span className="text-orange-500">Professionals</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={scrollLeft}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200">
            <RiArrowLeftSLine size={20} />
          </button>
          <button onClick={scrollRight}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200">
            <RiArrowRightSLine size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[260px] bg-gray-100 rounded-2xl h-80 animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
          <RiUser3Line className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">No professionals listed yet.</p>
          <p className="text-gray-300 text-xs mt-1">Be the first to create a profile!</p>
        </div>
      ) : (
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {workers.map((worker) => {
            const skills = Array.isArray(worker.skills)
              ? worker.skills.slice(0, 2)
              : typeof worker.skills === "string"
              ? worker.skills.split(",").slice(0, 2).map((s) => s.trim())
              : []

            return (
              <Link
                key={worker._id}
                href={`/labour/profile/${worker.slug || worker._id}`}
                className="min-w-[260px] max-w-[260px] bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex-shrink-0 border border-gray-100 hover:border-orange-200"
              >
                <div className="relative bg-gradient-to-br from-orange-50 to-gray-50 h-44 flex items-center justify-center overflow-hidden">
                  {worker.profileImageUrl ? (
                    <img
                      src={worker.profileImageUrl}
                      alt={`${worker.firstName} ${worker.lastName}`}
                      className="h-32 w-32 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-orange-100 flex items-center justify-center">
                      <RiUser3Line className="text-4xl text-orange-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                    <RiStarFill className="text-orange-500 text-xs" />
                    <span className="text-xs font-bold text-gray-800">
                      {worker.rating > 0 ? worker.rating.toFixed(1) : "New"}
                    </span>
                  </div>
                  {worker.isVerified && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                      VERIFIED
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">
                    {worker.firstName} {worker.lastName}
                  </h3>
                  <p className="text-orange-500 text-xs font-semibold mt-0.5">{worker.profession}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {worker.city && (
                      <span className="flex items-center gap-1"><RiMapPinLine /> {worker.city}</span>
                    )}
                    <span className="flex items-center gap-1"><RiTimeLine /> {worker.experienceYears} yrs</span>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex gap-1.5 mt-2.5 flex-wrap">
                      {skills.map((s, i) => (
                        <span key={i} className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Starting</p>
                      <p className="text-base font-extrabold text-gray-900">
                        ₹{worker.hourlyRate}<span className="text-xs text-gray-400 font-normal">/hr</span>
                      </p>
                    </div>
                    <span className="bg-orange-500 group-hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200">
                      View Profile
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default LaborSlider