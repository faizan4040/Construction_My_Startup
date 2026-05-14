"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { IMAGES } from "@/routes/AllImages"
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
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8">
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
              block
              h-[360px]
              sm:h-[420px]
              lg:h-[460px]
              rounded-2xl
              overflow-hidden
              group
              cursor-pointer
            "
          >

            {/* IMAGE */}
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={false}
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

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/40 z-10" />

            {/* TEXT */}
            <div className="absolute bottom-6 left-5 right-5 z-20 text-white">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {item.title}
              </h3>

              <p className="mt-2 text-sm sm:text-base opacity-90">
                {item.desc}
              </p>

              <div className="mt-5">
                <span className="
                  inline-block
                  px-5 py-2
                  border border-white
                  rounded-full
                  text-sm
                  transition
                  group-hover:bg-white
                  group-hover:text-black
                ">
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