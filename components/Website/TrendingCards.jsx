"use client"

import React from "react"
import { IMAGES } from "@/routes/AllImages"
import Link from "next/link"

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
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          About OfBusiness Group
        </h2>

        <p className="text-gray-600 leading-relaxed">
          We are India's leading B2B Raw Materials procurement and credit platform,
          dedicated to revolutionising the SME sector. As a dynamic player in over
          7 supply chains including Steel, Aluminium, Agriculture, Petroleum,
          Energy, Polymers and Chemicals, we provide high quality raw materials
          at competitive prices along with access to business credit. Our dual
          role as both Supplier and Manufacturer positions us uniquely in the market.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="
              relative
              h-87.5
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

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition"></div>

            {/* TEXT */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="text-2xl font-bold">
                {item.title}
              </h3>

              <p className="mt-2 text-sm opacity-90">
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