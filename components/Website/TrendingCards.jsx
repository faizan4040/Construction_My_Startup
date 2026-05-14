"use client"

import React from "react"
import Image from "next/image"
import { IMAGES } from "@/routes/AllImages"

const items = [
  {
    id: 1,
    title: "Aggregator",
    desc: "Enabling buyers and suppliers to access the best raw materials across global supply chains.",
    image: IMAGES.aggregator,
  },
  {
    id: 2,
    title: "Manufacturer",
    desc: "30+ world class manufacturing & processing plants in Steel, Aluminium, Energy, Chemicals and Agri.",
    image: IMAGES.manufacturer,
  },
  {
    id: 3,
    title: "Importer & Exporter",
    desc: "One of India's largest importers & exporters in Steel, Agri and other product categories.",
    image: IMAGES.importer_exporter,
  },
  {
    id: 4,
    title: "SaaS & AI",
    desc: "Industry-first SME B2B SaaS platforms including AI tools, bidding and credit systems.",
    image: IMAGES.construction,
  },
]

const TrendingCards = () => {
  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-14">

      {/* ABOUT TEXT */}
      <div className="max-w-4xl mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          About OfBusiness Group
        </h2>

        <p className="text-gray-600 leading-relaxed">
          We are India's leading B2B Raw Materials procurement and credit platform,
          dedicated to revolutionising the SME sector. As a dynamic player in over
          7 supply chains including Steel, Aluminium, Agriculture, Petroleum,
          Energy, Polymers and Chemicals, we provide high quality raw materials
          at competitive prices along with access to business credit.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {items.map((item) => (
          <div
            key={item.id}
            className="
              relative
              h-[320px]
              sm:h-[360px]
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
              sizes="(max-width: 768px) 100vw, 25vw"
              className="
                object-cover
                transition-transform duration-500
                group-hover:scale-105
                transform-gpu
                will-change-transform
              "
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition z-10" />

            {/* TEXT */}
            <div className="absolute bottom-5 left-5 right-5 text-white z-20">

              <h3 className="text-xl sm:text-2xl font-bold">
                {item.title}
              </h3>

              <p className="mt-2 text-sm opacity-90 leading-relaxed">
                {item.desc}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  )
}

export default TrendingCards