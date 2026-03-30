"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Pause } from "lucide-react"
import { VIDEOS } from "@/routes/Videos"

const Videoads = () => {
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
    <section className="relative w-full h-150 overflow-hidden group">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover "
        src={VIDEOS.videoads}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30 rounded-3xl" />

      <button
        onClick={toggleVideo}
        className="
          absolute top-6 right-6 z-20
          w-12 h-12
          rounded-full
          bg-white/90 text-black
          flex items-center justify-center
          opacity-0 scale-90
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-300
          shadow-lg
          hover:bg-black hover:text-white cursor-pointer
        "
        aria-label="Play or Pause"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="absolute bottom-10 left-6 sm:left-10 max-w-xl text-white z-10">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
          adidas
        </h1>

        <p className="mt-1 text-lg sm:text-2xl font-medium">
          Supernova Rise 3
        </p>

        <button
          onClick={() => router.push("/shop")}
          className="
            mt-6 px-6 py-3
            bg-white text-black
            rounded-full
            text-sm sm:text-base font-semibold
            hover:bg-black hover:text-white
            transition-all duration-300
            shadow-xl cursor-pointer
          "
        >
          Shop Now
        </button>
      </div>
    </section>
  )
}

export default Videoads

