      // <div className="flex items-end justify-between mb-6">
      //   <h2 className="text-2xl sm:text-3xl lg:text-2xl font-bold leading-tight flex gap-4">
      //     New in <br />
      //     <span className="bg-black rounded-full text-white text-sm px-4 py-2 cursor-pointer transition-all duration-300">
      //       Feature Professionals
      //     </span>
      //     <Link
      //       href={WEBSITE_SHOP}
      //       className="border-2 border-orange-500 text-orange-500 rounded-full text-sm px-4 py-2 hover:bg-orange-500 hover:text-white transition-all duration-300 cursor-pointer"
      //     >
      //       Hire know
      //     </Link>
      //   </h2>

      //   {/* ARROWS (hide on mobile) */}
      //   <div className="hidden sm:flex gap-3">
      //     <button
      //       onClick={scrollLeft}
      //       className="w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
      //     >
      //       <ChevronLeft size={20} />
      //     </button>

      //     <button
      //       onClick={scrollRight}
      //       className="w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
      //     >
      //       <ChevronRight size={20} />
      //     </button>
      //   </div>
      // </div>
"use client"

import React, { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const MAX_WORKERS = 12

const LaborSlider = () => {
  const sliderRef = useRef(null)
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch workers
const fetchWorkers = async () => {
  setLoading(true)
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/labor/get-feature-labor?limit=${MAX_WORKERS}`
    
    console.log("API URL:", url)

    const { data } = await axios.get(url)
    console.log("API DATA:", data)

    const workerArray = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.data?.workers)
      ? data.data.workers
      : []

    setWorkers(workerArray.slice(0, MAX_WORKERS))
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status)
    console.log("ERROR DATA:", err.response?.data)
    console.log("FULL ERROR:", err)
    setWorkers([])
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchWorkers()
  }, [])

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -320, behavior: "smooth" })
  }

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 320, behavior: "smooth" })
  }

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10">
      
      {/* HEADER */}
      <div className="flex items-end justify-between mb-6">
       <h2 className="text-2xl sm:text-3xl lg:text-2xl font-bold leading-tight flex gap-4">
           New in <br />
           <span className="bg-black rounded-full text-white text-sm px-4 py-2 cursor-pointer transition-all duration-300">
             Feature Professionals
          </span>
          <Link
            href={WEBSITE_SHOP}
            className="border-2 border-orange-500 text-orange-500 rounded-full text-sm px-4 py-2 hover:bg-orange-500 hover:text-white transition-all duration-300 cursor-pointer"
          >
            Hire know
          </Link>
      </h2>

        <div className="hidden sm:flex gap-3">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* SLIDER */}
      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading workers...</p>
      ) : workers.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No workers found.</p>
      ) : (
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar pb-4"
        >
          {workers.map((worker) => (
            <div
              key={worker._id}
              className="min-w-65 bg-white rounded-2xl shadow-sm hover:shadow-xl transition p-4"
            >
              {/* IMAGE */}
              <div className="bg-gray-100 rounded-xl p-6 flex justify-center relative">
                <img
                  src={worker.image || "/worker.png"}
                  alt={worker.name}
                  className="h-28 object-contain"
                />

                {worker.topRated && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                    TOP RATED
                  </span>
                )}
              </div>

              {/* INFO */}
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{worker.name}</h3>
                  <span className="flex items-center gap-1 text-orange-500 text-sm">
                    <Star size={14} /> {worker.rating || "4.8"}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mt-1">
                  {worker.skill} • {worker.experience} years exp.
                </p>

                {/* PRICE + BUTTON */}
                <div className="border-t mt-4 pt-3 flex justify-between items-center">
                  <span className="font-semibold">
                    ${worker.price}/hr
                  </span>

                  <Link
                    href={`/labor/${worker.slug}`}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default LaborSlider