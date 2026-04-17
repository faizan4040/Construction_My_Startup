import React from "react"
import Link from "next/link"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const shopLinks = [
  { label: "Hire Mason Workers",      category: "mason" },
  { label: "Hire Carpenter Workers",  category: "carpenter" },
  { label: "Hire Electricians",       category: "electrician" },
  { label: "Hire Plumbers",           category: "plumber" },
  { label: "Hire Tile Fixers",        category: "tile-fixer" },
  { label: "Hire Painters",           category: "painter" },
]

const ProductInfo = () => {
  return (
    <section className="w-full py-1">
      <div
        className="
          max-w-7xl
          mx-auto
          px-4 sm:px-8 lg:px-20
          grid grid-cols-1 lg:grid-cols-2
          gap-10 lg:gap-52
          items-start
        "
      >
        {/* LEFT CONTENT */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 lg:text-lg">
            Hire Skilled Construction Workers for Your Next Project
          </h2>

          <p className="text-gray-700 leading-relaxed mb-5">
            Find trusted and experienced construction workers for all your building,
            renovation, and repair needs. From masons and carpenters to electricians
            and plumbers, we help you hire skilled labor quickly and easily.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            Whether you're building a new house, renovating your home, fixing plumbing,
            installing electrical wiring, or doing interior work, our platform connects
            you with professional workers for every job.
          </p>

          <p className="text-gray-700 leading-relaxed mb-5">
            We provide workers for house construction, painting, tile fixing, plumbing,
            electrical work, carpentry, welding, and general labor work. Hire workers
            for daily work, contract work, or full project work.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Our goal is to make hiring construction workers easy, fast, and reliable.
            Choose skilled workers, compare prices, and book workers for your project
            with confidence.
          </p>
        </div>

        {/* RIGHT LINKS */}
        <div className="flex flex-col gap-10 text-2xl font-medium lg:pt-12">
          {shopLinks.map((item, index) => (
            <Link
              key={index}
              href={`${WEBSITE_SHOP}?category=${item.category}`}
              className="
                w-fit
                relative
                cursor-pointer
                after:absolute
                after:left-0
                after:-bottom-1
                after:h-0.5
                after:w-0
                after:bg-black
                after:transition-all
                after:duration-300
                hover:after:w-full
              "
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductInfo