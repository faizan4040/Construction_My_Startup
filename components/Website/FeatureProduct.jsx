"use client"

import axios from "axios"
import Link from "next/link"
import React, { useEffect, useState, useRef } from "react"
import { Bookmark } from "lucide-react"
import ProductBox from "./ProductBox"
import SaveButton from "./SaveButton"
import { useSavedProducts } from "@/hooks/useSavedProducts"

const PRODUCTS_PER_PAGE = 12

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
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
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
    <section
      id="shop"
      ref={sectionRef}
      className="w-full px-4 sm:px-8 lg:px-16 -py-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Construction Materials</h2>

        <div className="flex items-center gap-4 sm:gap-5">
          <Link
            href="/saved-products"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-orange-200 bg-orange-50 text-sm font-semibold text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all"
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

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-225">
        {loading &&
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-xl bg-gray-200 animate-pulse shadow"
            />
          ))}

        {!loading &&
          visibleProducts.map((product) => (
            <div key={product._id} className="relative">
              <ProductBox product={product} />
              <SaveButton product={product} />
            </div>
          ))}

        {!loading && visibleProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-10">
            No products found.
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-10">
          {/* Load More */}
          {currentPage < totalPages && (
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-lg border-orange-500 hover:bg-orange-500 border-2 hover:text-white transition-all duration-300 cursor-pointer font-semibold"
            >
              Load More
            </button>
          )}

          {/* Page Numbers */}
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`px-3 py-2 rounded-md border transition ${
                    currentPage === page
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-100"
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
// import ProductBox from "./ProductBox"

// const PRODUCTS_PER_PAGE = 12

// const FeatureProduct = () => {
//   const sectionRef = useRef(null)

//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [currentPage, setCurrentPage] = useState(1)


//   const fetchProducts = async () => {
//   setLoading(true)
//   try {
//     const { data } = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product`
//     )

//     console.log("API response:", data) // 👈 Add this temporarily

//     const productArray = Array.isArray(data?.data)
//       ? data.data
//       : Array.isArray(data?.data?.products)
//       ? data.data.products
//       : Array.isArray(data?.products)   // 👈 extra fallback
//       ? data.products
//       : []

//     console.log("Parsed productArray:", productArray) // 👈 And this

//     const reversedProducts = productArray.slice().reverse()
//     setProducts(reversedProducts)
//   } catch (err) {
//     console.error("Failed to fetch products:", err)
//     setProducts([])
//   } finally {
//     setLoading(false)
//   }
// }


//   useEffect(() => {
//     fetchProducts()
//   }, [])

//   const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE)

//   const visibleProducts = products.slice(
//     0,
//     currentPage * PRODUCTS_PER_PAGE
//   )

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
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl sm:text-3xl font-bold">
//           Construction Materials  
//         </h2>
//         <Link
//           href="/shop"
//           className="text-sm sm:text-base underline underline-offset-4 hover:text-primary"
//         >
//           View All
//         </Link>
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
//             <ProductBox key={product._id} product={product} />
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