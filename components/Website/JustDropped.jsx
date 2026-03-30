"use client"

import React from "react"
import { IMAGES } from "@/routes/AllImages"

const items = [
  {
    id: 1,
    title: "New Balance 1080v15",
    desc: "Maximum cushioning for daily runs",
    image: IMAGES.adidas,
  },
  {
    id: 3,
    title: "Nike Pegasus 40",
    desc: "Energy return redefined",
    image: IMAGES.nike,
  },
  {
    id: 2,
    title: "Adidas Ultraboost",
    desc: "Everyday comfort & performance",
    image: IMAGES.brooks,
  },
  
]

const JustDropped = () => {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-24">
      
      {/* HEADER */}
      <h2 className="text-3xl lg:text-2xl sm:text-4xl font-bold mb-6">
        Just Dropped
      </h2>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="
              relative
              h-105 sm:h-130
              rounded-2xl
              overflow-hidden
              group
              cursor-pointer
            "
          >
            {/* IMAGE */}
            <img
              src={item.image}
              alt={item.title}
              className="
                w-full h-full object-cover
                transition-transform duration-700
                group-hover:scale-110
              "
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/30" />

            {/* TEXT */}
            <div className="absolute bottom-8 left-6 right-6 text-white">
              <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                {item.title}
              </h3>

              <p className="mt-2 text-sm sm:text-base opacity-90">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}

export default JustDropped
