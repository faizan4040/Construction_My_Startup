"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const categories = [
  { id: 1, title: "Steel", image: IMAGES.steel, gender: "men" },
  { id: 2, title: "Non-Ferrous", image: IMAGES.non_ferrous, gender: "women" },
  { id: 3, title: "PVC", image: IMAGES.pvc, gender: "kids" },
  { id: 4, title: "Cement", image: IMAGES.cement, gender: "kids" },
  { id: 5, title: "Bricks", image: IMAGES.bricks, gender: "men" },
  { id: 6, title: "Tiles", image: IMAGES.tiles, gender: "men" }
]

const Shopby = () => {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-24">

      {/* HEADER */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10">
        Explore Our Categories
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {categories.map((item) => (
          <Link
            key={item.id}
            href={`${WEBSITE_SHOP}?gender=${item.gender}`}
            className="
              relative
              block
              h-[300px]
              sm:h-[360px]
              lg:h-[420px]
              rounded-2xl
              overflow-hidden
              group
            "
          >

            {/* IMAGE */}
            <Image
              src={item.image}
              alt={item.title}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 33vw"
              className="
                object-cover
                transition-transform duration-500
                group-hover:scale-105
                transform-gpu
                will-change-transform
              "
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/30 z-10" />

            {/* CENTER CONTENT */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-4">

              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                {item.title}
              </h3>

              <span
                className="
                  px-6 py-2
                  border border-white
                  rounded-full
                  text-sm font-medium
                  bg-white/10
                  backdrop-blur-sm
                  transition-all duration-300
                  group-hover:bg-white
                  group-hover:text-black
                "
              >
                Shop Now
              </span>

            </div>

          </Link>
        ))}

      </div>

    </section>
  )
}

export default Shopby