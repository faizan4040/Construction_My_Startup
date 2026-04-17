"use client"

import React from "react"
import { IMAGES } from "@/routes/AllImages"
import Link from "next/link"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const items = [
  {
    id: 1,
    title: "House Construction",
    desc: "Complete house construction from foundation to finishing",
    image: IMAGES.House_Construction,
    link: `${WEBSITE_SHOP}?service=construction`,
  },
  {
    id: 2,
    title: "Home Renovation",
    desc: "Upgrade, remodel and renovate your home professionally",
    image: IMAGES.Home_Renovation,
    link: `${WEBSITE_SHOP}?service=renovation`,
  },
  {
    id: 3,
    title: "Repair & Maintenance",
    desc: "Electric, plumbing, tiles, paint and general repairs",
    image: IMAGES.Repair_Maintenance,
    link: `${WEBSITE_SHOP}?service=repair`,
  },
]

const JustDropped = () => {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-24">
      
      {/* HEADER */}
      <h2 className="text-3xl lg:text-2xl sm:text-4xl font-bold mb-6">
        Special Services
      </h2>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="
              relative
              h-105 sm:h-130
              rounded-2xl
              overflow-hidden
              group
              cursor-pointer
              block
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
            <div className="absolute inset-0 bg-black/40" />

            {/* TEXT */}
            <div className="absolute bottom-8 left-6 right-6 text-white">
              <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                {item.title}
              </h3>

              <p className="mt-2 text-sm sm:text-base opacity-90">
                {item.desc}
              </p>

              <div className="mt-4">
                <span className="px-5 py-2 border border-white rounded-full text-sm group-hover:bg-white group-hover:text-black transition">
                  Book Service
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </section>
  )
}

export default JustDropped