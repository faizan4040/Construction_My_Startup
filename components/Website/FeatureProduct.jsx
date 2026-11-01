"use client"

import axios from "axios"
import Link from "next/link"
import React, { useEffect, useState, useRef } from "react"
import { Bookmark, ImageOff } from "lucide-react"
import SaveButton from "./SaveButton"
import { useSavedProducts } from "@/hooks/useSavedProducts"

const PRODUCTS_PER_PAGE = 12

/* =====================================================================
   HELPERS
   ===================================================================== */

// Product details page route -> change if your route is different
const getHref = (product) => `/product/${product?._id}`

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""

let API_ORIGIN = ""
try {
  API_ORIGIN = new URL(API_BASE).origin
} catch (e) {
  API_ORIGIN = ""
}

const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i
const IMAGE_KEY = /(image|img|photo|thumb|picture|gallery|media)/i

// Relative path (uploads/abc.jpg) ko full URL bana deta hai
const resolveImageUrl = (src) => {
  if (!src || typeof src !== "string") return ""
  const clean = src.trim().replace(/\\/g, "/")
  if (/^(https?:)?\/\//i.test(clean) || /^(data|blob):/i.test(clean)) return clean
  if (!API_ORIGIN) return clean.startsWith("/") ? clean : `/${clean}`
  return `${API_ORIGIN}/${clean.replace(/^\.?\//, "")}`
}

// Product object me kahin bhi image ho usse dhoondh leta hai
const findImages = (product) => {
  const found = []

  const walk = (value, keyHint, depth) => {
    if (value == null || depth > 3) return
    if (typeof value === "string") {
      if (IMAGE_EXT.test(value) || (keyHint && IMAGE_KEY.test(keyHint) && value.length > 3)) {
        found.push(value)
      }
      return
    }
    if (Array.isArray(value)) {
      value.forEach((v) => walk(v, keyHint, depth + 1))
      return
    }
    if (typeof value === "object") {
      Object.entries(value).forEach(([k, v]) => {
        if (k === "_id" || k === "id") return
        const hint =
          IMAGE_KEY.test(k) || /^(url|secure_url|src|path|location)$/i.test(k)
            ? keyHint || k
            : keyHint
        walk(v, hint, depth + 1)
      })
    }
  }

  walk(product, "", 0)

  return [...new Set(found.map(resolveImageUrl).filter(Boolean))]
}

const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v)

const KNOWN_BRANDS = [
  "Ultratech",
  "Adani ACC",
  "ACC",
  "Ambuja",
  "Birla",
  "JK Lakshmi",
  "JK",
  "Dalmia",
  "Shree",
  "Ramco",
  "Wonder",
  "Jaypee",
  "Sanghi",
  "Binani",
  "Tata",
  "Jindal",
  "SAIL",
  "Kamdhenu",
  "Vizag",
  "Asian Paints",
  "Berger",
  "Nerolac",
  "Kajaria",
  "Somany",
  "Astral",
  "Supreme",
  "Finolex",
  "Polycab",
  "Havells",
]

const KNOWN_CATEGORIES = [
  ["Cement", /cement/i],
  ["TMT Bar", /tmt|saria|rebar/i],
  ["Steel", /steel|iron|angle|channel/i],
  ["Bricks", /brick|block|fly ash/i],
  ["Sand", /sand|balu|\bgrit\b/i],
  ["Aggregate", /aggregate|gitti|stone|chips/i],
  ["Paint", /paint|primer|putty/i],
  ["Tiles", /tile/i],
  ["Pipes", /pipe|cpvc|upvc/i],
  ["Electrical", /wire|cable|switch|mcb/i],
]

const getCategory = (product) => {
  const c = product?.category
  if (c && typeof c === "object" && c.name) return c.name
  if (typeof c === "string" && !isObjectId(c)) return c
  if (product?.categoryName) return product.categoryName
  if (product?.subCategory?.name) return product.subCategory.name

  const name = product?.name || product?.title || ""
  const hit = KNOWN_CATEGORIES.find(([, re]) => re.test(name))
  return hit ? hit[0] : ""
}

const getBrand = (product) => {
  const b = product?.brand
  if (b && typeof b === "object" && b.name) return b.name
  if (typeof b === "string" && b && !isObjectId(b)) return b

  const name = (product?.name || product?.title || "").toLowerCase()
  const hit = KNOWN_BRANDS.find((br) => name.includes(br.toLowerCase()))
  return hit || ""
}

const getName = (product) => product?.name || product?.title || "Product"

const toNum = (v) => {
  if (v === undefined || v === null || v === "") return NaN
  const n = Number(String(v).replace(/[^0-9.]/g, ""))
  return Number.isNaN(n) ? NaN : n
}

const firstNum = (product, keys) => {
  for (const k of keys) {
    const n = toNum(product?.[k])
    if (!Number.isNaN(n) && n > 0) return n
  }
  return NaN
}

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`

// Selling price + original (cut) price + discount %
// Field names yahan se change kar sakte ho agar API me alag hain
const getPriceInfo = (product) => {
  const selling = firstNum(product, [
    "sellingPrice",
    "offerPrice",
    "discountPrice",
    "discountedPrice",
    "salePrice",
    "finalPrice",
    "price",
  ])

  const original = firstNum(product, [
    "mrp",
    "MRP",
    "originalPrice",
    "oldPrice",
    "actualPrice",
    "regularPrice",
    "price",
  ])

  if (Number.isNaN(selling)) {
    return { selling: "", original: "", off: 0 }
  }

  const hasCut = !Number.isNaN(original) && original > selling
  const off = hasCut ? Math.round(((original - selling) / original) * 100) : 0

  return {
    selling: fmt(selling),
    original: hasCut ? fmt(original) : "",
    off,
  }
}

/* =====================================================================
   PRODUCT CARD
   ===================================================================== */

const ProductCard = ({ product }) => {
  const images = findImages(product)
  const [activeImg, setActiveImg] = useState(0)
  const [broken, setBroken] = useState({})

  const category = getCategory(product)
  const brand = getBrand(product)
  const { selling, original, off } = getPriceInfo(product)
  const href = getHref(product)

  const currentSrc = images[activeImg]
  const showImage = currentSrc && !broken[currentSrc]

  return (
    <div className="group bg-white rounded-[22px] sm:rounded-[30px] overflow-hidden border border-gray-100 shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* ---------- IMAGE (edge to edge, curved with the card) ---------- */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden shrink-0">
        <Link href={href} className="absolute inset-0 block">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentSrc}
              alt={getName(product)}
              loading="lazy"
              onError={() => setBroken((p) => ({ ...p, [currentSrc]: true }))}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400">
              <ImageOff size={26} />
              <span className="text-[10px] sm:text-xs">No image</span>
            </div>
          )}
        </Link>

        {/* Discount badge */}
        {off > 0 && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full shadow pointer-events-none">
            {off}% OFF
          </span>
        )}

        {/* Save button: sirf icon (text hide kar diya) */}
        <div
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur shadow text-[0px] leading-none overflow-hidden
          [&_span]:hidden [&_p]:hidden
          [&_button]:w-full! [&_button]:!h-full [&_button]:!p-0 [&_button]:!m-0 [&_button]:!bg-transparent [&_button]:!border-0 [&_button]:!shadow-none [&_button]:!rounded-full [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:!static
          [&_svg]:w-[17px] [&_svg]:h-4.25 sm:[&_svg]:w-[18px] sm:[&_svg]:h-[18px]"
        >
          <SaveButton product={product} />
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActiveImg(i)}
                className={`rounded-full transition-all ${
                  activeImg === i
                    ? "w-3 h-1.5 sm:w-4 sm:h-2 bg-white"
                    : "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------- DETAILS ---------- */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        {/* Category + Brand row (fixed height so cards always align) */}
        <div className="h-5 sm:h-6 flex items-center gap-1.5 overflow-hidden">
          {category && (
            <span className="shrink-0 text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {category}
            </span>
          )}
          {brand && (
            <span className="truncate text-[11px] sm:text-sm text-gray-500">{brand}</span>
          )}
        </div>

        {/* Title (always 2 lines tall -> card height never changes) */}
        <Link href={href} title={getName(product)}>
          <h3 className="mt-1.5 text-[13px] sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2 h-[2.5rem] sm:h-[2.9rem] hover:text-emerald-700 transition-colors">
            {getName(product)}
          </h3>
        </Link>

        {/* Footer pinned to bottom */}
        <div className="mt-auto pt-2.5 sm:pt-3">
          {/* Price row: selling + cut price */}
          <div className="h-7 sm:h-8 flex items-baseline gap-1.5 sm:gap-2 overflow-hidden">
            <span className="text-base sm:text-xl font-bold text-emerald-700">
              {selling || "—"}
            </span>
            {original && (
              <span className="text-[11px] sm:text-sm text-gray-400 line-through">
                {original}
              </span>
            )}
          </div>

          {/* Buy Now (full width) */}
          <Link
            href={href}
            className="mt-1 block w-full text-center bg-[#2a2a2a] hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-full transition-colors"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   SECTION
   ===================================================================== */

const FeatureProduct = () => {
  const sectionRef = useRef(null)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { count: savedCount, ready: savedReady } = useSavedProducts()

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product`
      )

      const productArray = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.products)
        ? data.data.products
        : Array.isArray(data?.products)
        ? data.products
        : []

      setProducts(productArray.slice().reverse())
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE)
  const visibleProducts = products.slice(0, currentPage * PRODUCTS_PER_PAGE)

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handlePageClick = (page) => {
    setCurrentPage(page)
    scrollToSection()
  }

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1)
    scrollToSection()
  }

  return (
    <section id="shop" ref={sectionRef} className="w-full px-3 sm:px-8 lg:px-16 py-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-3 mb-6">
        <h2 className="text-xl sm:text-3xl font-bold">Construction Materials</h2>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/saved-products"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-full border border-orange-200 bg-orange-50 text-sm font-semibold text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all"
          >
            <Bookmark size={15} />
            <span className="hidden sm:inline">Saved</span>
            {savedReady && savedCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </Link>

          <Link
            href="/shop"
            className="text-sm sm:text-base underline underline-offset-4 hover:text-primary"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Grid: mobile 2 | md 3 | lg 4 (items-stretch => saare cards same height) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[22px] sm:rounded-[30px] overflow-hidden border border-gray-100 shadow animate-pulse"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-3">
                <div className="h-4 w-1/3 bg-gray-200 rounded-full" />
                <div className="h-10 w-full bg-gray-200 rounded mt-2" />
                <div className="h-8 w-full bg-gray-200 rounded-full mt-3" />
              </div>
            </div>
          ))}

        {!loading &&
          visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}

        {!loading && visibleProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-10">No products found.</p>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-wrap justify-between items-center gap-4 mt-10">
          {currentPage < totalPages ? (
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-full border-orange-500 hover:bg-orange-500 border-2 hover:text-white transition-all duration-300 cursor-pointer font-semibold"
            >
              Load More
            </button>
          ) : (
            <span />
          )}

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`px-3 py-2 rounded-lg border transition ${
                    currentPage === page ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export default FeatureProduct















// "use client"

// import axios from "axios"
// import Link from "next/link"
// import React, { useEffect, useState, useRef } from "react"
// import { Bookmark } from "lucide-react"
// import ProductBox from "./ProductBox"
// import SaveButton from "./SaveButton"
// import { useSavedProducts } from "@/hooks/useSavedProducts"

// const PRODUCTS_PER_PAGE = 12

// const FeatureProduct = () => {
//   const sectionRef = useRef(null)

//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [currentPage, setCurrentPage] = useState(1)

//   const { count: savedCount, ready: savedReady } = useSavedProducts()

//   const fetchProducts = async () => {
//     setLoading(true)
//     try {
//       const { data } = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product`
//       )

//       const productArray = Array.isArray(data?.data)
//         ? data.data
//         : Array.isArray(data?.data?.products)
//         ? data.data.products
//         : Array.isArray(data?.products)
//         ? data.products
//         : []

//       setProducts(productArray.slice().reverse())
//     } catch (err) {
//       console.error("Failed to fetch products:", err)
//       setProducts([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchProducts()
//   }, [])

//   const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE)

//   const visibleProducts = products.slice(0, currentPage * PRODUCTS_PER_PAGE)

//   const scrollToSection = () => {
//     sectionRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   const handlePageClick = (page) => {
//     setCurrentPage(page)
//     scrollToSection()
//   }

//   const handleLoadMore = () => {
//     setCurrentPage((prev) => prev + 1)
//     scrollToSection()
//   }

//   return (
//     <section
//       id="shop"
//       ref={sectionRef}
//       className="w-full px-4 sm:px-8 lg:px-16 -py-4"
//     >
//       {/* Header */}
//       <div className="flex justify-between items-center gap-3 mb-6">
//         <h2 className="text-2xl sm:text-3xl font-bold">Construction Materials</h2>

//         <div className="flex items-center gap-4 sm:gap-5">
//           <Link
//             href="/saved-products"
//             className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-orange-200 bg-orange-50 text-sm font-semibold text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all"
//           >
//             <Bookmark size={15} />
//             <span className="hidden sm:inline">Saved</span>
//             {savedReady && savedCount > 0 && (
//               <span className="min-w-5 h-5 px-1.5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
//                 {savedCount}
//               </span>
//             )}
//           </Link>

//           <Link
//             href="/shop"
//             className="text-sm sm:text-base underline underline-offset-4 hover:text-primary"
//           >
//             View All
//           </Link>
//         </div>
//       </div>

//       {/* Product Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-225">
//         {loading &&
//           Array.from({ length: 12 }).map((_, i) => (
//             <div
//               key={i}
//               className="h-72 rounded-xl bg-gray-200 animate-pulse shadow"
//             />
//           ))}

//         {!loading &&
//           visibleProducts.map((product) => (
//             <div key={product._id} className="relative">
//               <ProductBox product={product} />
//               <SaveButton product={product} />
//             </div>
//           ))}

//         {!loading && visibleProducts.length === 0 && (
//           <p className="col-span-full text-center text-gray-500 py-10">
//             No products found.
//           </p>
//         )}
//       </div>

//       {/* Pagination Controls */}
//       {!loading && totalPages > 1 && (
//         <div className="flex justify-between items-center mt-10">
//           {/* Load More */}
//           {currentPage < totalPages && (
//             <button
//               onClick={handleLoadMore}
//               className="px-6 py-2 rounded-lg border-orange-500 hover:bg-orange-500 border-2 hover:text-white transition-all duration-300 cursor-pointer font-semibold"
//             >
//               Load More
//             </button>
//           )}

//           {/* Page Numbers */}
//           <div className="flex gap-2">
//             {Array.from({ length: totalPages }).map((_, index) => {
//               const page = index + 1
//               return (
//                 <button
//                   key={page}
//                   onClick={() => handlePageClick(page)}
//                   className={`px-3 py-2 rounded-md border transition ${
//                     currentPage === page
//                       ? "bg-black text-white"
//                       : "bg-white hover:bg-gray-100"
//                   }`}
//                 >
//                   {page}
//                 </button>
//               )
//             })}
//           </div>
//         </div>
//       )}
//     </section>
//   )
// }

// export default FeatureProduct








