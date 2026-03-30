"use client"

import React from "react"
import { IMAGES } from "@/routes/AllImages"
import Link from "next/link"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const items = [
  {
    id: 1,
    title: "ASICS",
    desc: "Gel-Nimbus 28",
    image: IMAGES.trending_1,
  },
  {
    id: 3,
    title: "Nike",
    desc: "structure plus",
    image: IMAGES.trending_2,
  },
  {
    id: 2,
    title: "HOKA",
    desc: "Gaviota 6",
    image: IMAGES.trending_3,
  },
  
]

const TrendingCards = () => {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-1">
      
      {/* HEADER */}
      <h2 className="text-3xl lg:text-2xl sm:text-4xl font-bold mb-6">
        Trending Now
      </h2>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={WEBSITE_SHOP}
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

           

            {/* TEXT */}
            <div className="absolute bottom-8 left-6 right-6 text-black">
              <h3 className="text-3xl lg:text-xl sm:text-4xl font-bold leading-tight">
                {item.title}
              </h3>

              <p className="mt-2 lg:text-2xl text-sm sm:text-base opacity-90">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

    </section>
  )
}

export default TrendingCards
