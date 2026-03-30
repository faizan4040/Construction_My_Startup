"use client"

import React, { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const MAX_PRODUCTS = 12

const ProductSlider = () => {
  const sliderRef = useRef(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch latest products
  const fetchLatestProducts = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product?limit=${MAX_PRODUCTS}`
      )
      
      // Reverse products so newest appear first
      const sortedProducts = (data.data || []).slice().reverse()
      // Limit to MAX_PRODUCTS
      setProducts(sortedProducts.slice(0, MAX_PRODUCTS))
    } catch (err) {
      console.error("Failed to fetch latest products:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestProducts()
  }, [])

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -340, behavior: "smooth" })
  }

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 340, behavior: "smooth" })
  }

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
      {/* HEADER */}
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-2xl font-bold leading-tight flex gap-4">
          New in <br />
          <span className="bg-black rounded-full text-white text-sm px-4 py-2 cursor-pointer transition-all duration-300">
            Footwear
          </span>
          <Link
            href={WEBSITE_SHOP}
            className="border-2 border-orange-500 text-orange-500 rounded-full text-sm px-4 py-2 hover:bg-orange-500 hover:text-white transition-all duration-300 cursor-pointer"
          >
            Shop Know
          </Link>
        </h2>

        {/* ARROWS (hide on mobile) */}
        <div className="hidden sm:flex gap-3">
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
      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No products found.</p>
      ) : (
        <div
          ref={sliderRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-visible scroll-smooth hide-scrollbar pb-4"
        >
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product.slug}`}
              className="min-w-[70%] sm:min-w-50 md:min-w-55 lg:min-w-62.5 bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
            >
              {/* IMAGE */}
              <div className="w-full h-48 sm:h-52 md:h-56 bg-gray-100 overflow-hidden">
                <img
                  src={product.media?.[0]?.secure_url || IMAGES.image_placeholder}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-3">
                <h3 className="text-base sm:text-sm font-semibold line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description || "No description available"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductSlider