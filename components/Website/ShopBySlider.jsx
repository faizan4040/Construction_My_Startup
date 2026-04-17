"use client"

import React, { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { IMAGES } from "@/routes/AllImages"
import Link from "next/link"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const categories = [
  { id: 1, title: "Electrician", image: IMAGES.Electrician },
  { id: 2, title: "Plumber", image: IMAGES.Plumber },
  { id: 3, title: "Carpenter", image: IMAGES.Carpenter },
  { id: 4, title: "Mason", image: IMAGES.Mason },
  { id: 5, title: "Painter", image: IMAGES.Painter },
  { id: 6, title: "Welder", image: IMAGES.Welder },
  { id: 7, title: "AC Technician", image: IMAGES.Ac_Technician },
  { id: 8, title: "Tile Fixer", image: IMAGES.Tile_Fixer },
]

const ShopBySlider = () => {
  const sliderRef = useRef(null)

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -420, behavior: "smooth" })
  }

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 420, behavior: "smooth" })
  }

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-1">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">Hire by Service</h2>

        <div className="flex gap-3">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={scrollRight}
            className="w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* SLIDER */}
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar"
      >
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`${WEBSITE_SHOP}?category=${item.title}`}
            className="
              min-w-65 sm:min-w-85 lg:min-w-105
              h-85 sm:h-105
              rounded-2xl
              overflow-hidden
              relative
              cursor-pointer
              group
            "
          >
            {/* IMAGE */}
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/30" />

            {/* TEXT */}
            <div className="absolute bottom-6 left-6">
              <h3 className="text-white text-xl sm:text-2xl font-semibold">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default ShopBySlider