"use client"

import React from "react"
import { IMAGES } from "@/routes/AllImages"
import Link from "next/link"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const categories = [
  {
    id: 1,
    title: "Men",
    image: IMAGES.men,
    gender: "men",   
  },
  {
    id: 2,
    title: "Women",
    image: IMAGES.womens,
    gender: "women", 
  },
  {
    id: 3,
    title: "Kids",
    image: IMAGES.kids,
    gender: "kids",  
  },
]

const Shopby = () => {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-24">
      
      <h2 className="text-3xl sm:text-4xl font-bold mb-10">
        Shop by
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`${WEBSITE_SHOP}?gender=${item.gender}`}
            className="
              relative
              h-80 sm:h-95
              rounded-2xl
              overflow-hidden
              group
              cursor-pointer
              block
            "
          >
            <img
              src={item.image}
              alt={item.title}
              className="
                w-full h-full object-cover
                transition-transform duration-700
                group-hover:scale-110
              "
            />

            <div className="absolute inset-0 bg-black/30" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-3xl font-bold mb-4">
                {item.title}
              </h3>

              <span
                className="
                  px-6 py-2
                  border border-white
                  rounded-full
                  text-sm font-medium
                  backdrop-blur-sm
                  bg-white/10
                  group-hover:bg-white group-hover:text-black
                  transition-all duration-300
                "
              >
                Shop Shoes
              </span>
            </div>
          </Link>
        ))}
      </div>

    </section>
  )
}

export default Shopby