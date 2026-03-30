"use client"

import React, { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Play, Pause, Search, MapPin, ArrowRight } from "lucide-react"
import axios from "axios"
import { VIDEOS } from "@/routes/Videos"

const ConstructionHero = () => {
  const router = useRouter()
  const videoRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("Detecting...")

  // Toggle Video
  const toggleVideo = () => {
    if (!videoRef.current) return
    isPlaying ? videoRef.current.pause() : videoRef.current.play()
    setIsPlaying(!isPlaying)
  }

  // Get Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Location not supported")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords

        try {
          const res = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
              },
            }
          )

          const address = res.data.address

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.state ||
            "Unknown"

          const country = address.country_code?.toUpperCase() || ""

          setLocation(`${city}, ${country}`)
        } catch {
          setLocation("Location error")
        }
      },
      () => setLocation("Permission denied")
    )
  }, [])

  const handleSearch = () => {
    console.log("Search:", query, location)
    router.push(`/search?q=${query}&location=${location}`)
  }

  return (
    <section className="relative w-full h-[70vh] overflow-hidden rounded-2xl group">

      {/* VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEOS.video}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* 🌫 LIGHT OVERLAY */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      {/* PLAY BUTTON */}
      <button
        onClick={toggleVideo}
        className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">

        {/* HEADING */}
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">
          Machined for{" "}
          <span className="text-yellow-600">Reliability.</span>
        </h1>

        {/* SUBTEXT */}
        <p className="mt-4 text-gray-600 max-w-xl text-sm sm:text-base">
          The elite industrial ecosystem for sourcing raw materials and certified
          trade professionals with precision.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-8 w-full max-w-4xl px-4">

          <div className="
            w-full flex items-center
            bg-white
            rounded-2xl
            shadow-[0_10px_40px_rgba(0,0,0,0.15)]
            border border-gray-200
            overflow-hidden
          ">

            {/* SEARCH INPUT */}
            <div className="flex items-center gap-3 px-5 py-4 flex-1">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Materials, workers, or serial number"
                className="w-full outline-none text-gray-700 text-sm placeholder-gray-400 bg-transparent"
              />
            </div>

            {/* DIVIDER */}
            <div className="h-10 w-px bg-gray-200" />

            {/* LOCATION */}
            <div className="flex items-center gap-2 px-5 py-4 min-w-45">
              <MapPin size={18} className="text-gray-400" />
              <span className="text-sm text-gray-700 whitespace-nowrap">
                {location}
              </span>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleSearch}
              className="
                flex items-center gap-2
                px-8 py-4
                bg-[#C8820E]
                text-white
                text-sm font-semibold
                hover:bg-[#b7740c]
                transition-all
              "
            >
              FIND ASSETS
              <ArrowRight size={16} />
            </button>

          </div>

        </div>
      </div>
    </section>
  )
}

export default ConstructionHero






// "use client"

// import React, { useRef, useState } from "react"
// import { useRouter } from "next/navigation"
// import { Play, Pause } from "lucide-react"
// import { VIDEOS } from "@/routes/Videos"

// const ConstructionHero = () => {
//   const router = useRouter()
//   const videoRef = useRef(null) // ✅ FIXED
//   const [isPlaying, setIsPlaying] = useState(true)

//   const toggleVideo = () => {
//     if (!videoRef.current) return

//     if (isPlaying) {
//       videoRef.current.pause()
//     } else {
//       videoRef.current.play()
//     }

//     setIsPlaying(!isPlaying)
//   }

//   return (
//     <section className="relative w-full h-[65vh] sm:h-[70vh] overflow-hidden rounded-2xl group">

//       <video
//         ref={videoRef}
//         className="absolute inset-0 w-full h-full object-cover"
//         src={VIDEOS.video}
//         autoPlay
//         loop
//         muted
//         playsInline
//       />

//       <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />

//       <button
//         onClick={toggleVideo}
//         className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white/90 text-black flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg hover:bg-yellow-500"
//       >
//         {isPlaying ? <Pause size={18} /> : <Play size={18} />}
//       </button>

//       <div className="absolute inset-0 flex items-center z-10 px-6 sm:px-12">
//         <div className="max-w-2xl text-white">
//           <h1 className="text-3xl sm:text-5xl font-bold">
//             Build Your Dream Home
//           </h1>

//           <p className="mt-3 text-sm sm:text-lg text-gray-200">
//             Trusted construction services with modern design and expert craftsmanship.
//           </p>

//           <div className="mt-6 flex gap-4">
//             <button
//               onClick={() => router.push("/services")}
//               className="px-6 cursor-pointer py-3 bg-yellow-500 text-black rounded-full font-semibold hover:bg-yellow-400"
//             >
//               Our Services
//             </button>

//             <button
//               onClick={() => router.push("/contact")}
//               className="px-6 py-3 cursor-pointer border border-white rounded-full hover:bg-white hover:text-black"
//             >
//               Contact Us
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// export default ConstructionHero