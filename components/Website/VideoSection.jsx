"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Pause } from "lucide-react"
import { VIDEOS } from "@/routes/Videos"

const ConstructionHero = () => {
  const router = useRouter()
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)

  const toggleVideo = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  return (
    <section className="relative w-full h-[65vh] sm:h-[70vh] overflow-hidden rounded-2xl group">

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEOS.video}
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />

      <button
        onClick={toggleVideo}
        className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white/90 text-black flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg hover:bg-yellow-500"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <div className="absolute inset-0 flex items-center z-10 px-6 sm:px-12">
        <div className="max-w-2xl text-white">
          <h1 className="text-3xl sm:text-5xl font-bold">
            Build Your Dream Home
          </h1>

          <p className="mt-3 text-sm sm:text-lg text-gray-200">
            Trusted construction services with modern design and expert craftsmanship.
          </p>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push("/services")}
              className="px-6 cursor-pointer py-3 bg-yellow-500 text-black rounded-full font-semibold hover:bg-yellow-400"
            >
              Our Services
            </button>

            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-3 cursor-pointer border border-white rounded-full hover:bg-white hover:text-black"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ConstructionHero