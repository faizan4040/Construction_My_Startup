"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  ArrowRight,
  Zap,
  Droplets,
  Hammer,
  Layers,
  Paintbrush,
  Flame,
  Snowflake,
  LayoutGrid,
} from "lucide-react"

import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

/**
 * `span` controls the bento layout (4 columns on desktop):
 *   large = 2x2, wide = 2x1, normal = 1x1
 * `desc` is a short line shown on each card, edit freely.
 */
const categories = [
  { id: 1, title: "Electrician", image: IMAGES.Electrician, icon: Zap, desc: "Wiring, fittings & repairs", size: "large" },
  { id: 2, title: "Plumber", image: IMAGES.Plumber, icon: Droplets, desc: "Pipes, leaks & fittings", size: "normal" },
  { id: 3, title: "Carpenter", image: IMAGES.Carpenter, icon: Hammer, desc: "Doors, furniture & woodwork", size: "normal" },
  { id: 4, title: "Mason", image: IMAGES.Mason, icon: Layers, desc: "Brickwork, plastering & concrete", size: "wide" },
  { id: 5, title: "Painter", image: IMAGES.Painter, icon: Paintbrush, desc: "Interior & exterior painting", size: "normal" },
  { id: 6, title: "Welder", image: IMAGES.Welder, icon: Flame, desc: "Gates, grills & fabrication", size: "normal" },
  { id: 7, title: "AC Technician", image: IMAGES.Ac_Technician, icon: Snowflake, desc: "Install, service & repair", size: "normal" },
  { id: 8, title: "Tile Fixer", image: IMAGES.Tile_Fixer, icon: LayoutGrid, desc: "Floor & wall tiling", size: "normal" },
]

const SIZE_CLASSES = {
  large: "col-span-2 row-span-2",
  wide: "col-span-2",
  normal: "",
}

const ShopBySlider = () => {
  const gridRef = useRef(null)
  const [visible, setVisible] = useState(false)

  /* reveal cards once the grid scrolls into view */
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* cursor-following spotlight */
  const handleMouseMove = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`)
    el.style.setProperty("--my", `${e.clientY - rect.top}px`)
  }

  return (
    <section
      id="services"
      className="relative w-full px-4 sm:px-8 lg:px-16 py-16 sm:py-24 overflow-hidden"
    >
      {/* background decoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 25%, transparent 72%)",
        }}
      />
      <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-orange-500" />
              </span>
              {String(categories.length).padStart(2, "0")} trades, one platform
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
              Hire by{" "}
              <span className="relative inline-block bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Service
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-orange-400"
                  viewBox="0 0 120 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7 Q 30 1, 60 5 T 118 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={visible ? "animate-[svcDraw_1s_ease-out_0.4s_both]" : "opacity-0"}
                    style={{ strokeDasharray: 140, strokeDashoffset: 0 }}
                  />
                </svg>
              </span>
            </h2>

            <p className="mt-5 text-gray-500 text-base sm:text-lg max-w-xl leading-relaxed">
              Pick a trade and get skilled help for every part of your construction work.
            </p>
          </div>

          <Link
            href={WEBSITE_SHOP}
            className="group inline-flex items-center gap-3 self-start sm:self-auto h-12 pl-6 pr-2 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-xl shadow-gray-900/20 hover:bg-orange-500 hover:shadow-orange-500/30 transition-all duration-300"
          >
            Explore all
            <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white group-hover:text-orange-500 transition-colors duration-300">
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        {/* BENTO GRID */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense auto-rows-[165px] sm:auto-rows-[210px] lg:auto-rows-[240px] gap-3 sm:gap-4 lg:gap-5"
        >
          {categories.map((item, index) => {
            const Icon = item.icon
            const isBig = item.size !== "normal"

            return (
              <Link
                key={item.id}
                href={`${WEBSITE_SHOP}?category=${encodeURIComponent(item.title)}`}
                onMouseMove={handleMouseMove}
                style={{ transitionDelay: visible ? `${index * 80}ms` : "0ms" }}
                className={`group relative overflow-hidden rounded-[22px] sm:rounded-[28px] bg-gray-900 shadow-lg shadow-gray-900/10
                transition-all duration-700 ease-out motion-reduce:transition-none
                hover:shadow-2xl hover:shadow-orange-500/20
                ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}
                ${SIZE_CLASSES[item.size]}`}
              >
                {/* IMAGE */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  loading="lazy"
                  quality={75}
                  sizes={isBig ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                  className="object-cover transition-transform duration-900 ease-out group-hover:scale-110 group-hover:rotate-1 transform-gpu will-change-transform"
                />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-linear-to-t from-orange-600/70 via-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* cursor spotlight */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,200,120,0.35), transparent 65%)",
                  }}
                />

                {/* inner ring */}
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10 group-hover:ring-orange-300/70 transition-all duration-500" />

                {/* TOP ROW: number + icon */}
                <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 flex items-start justify-between z-10">
                  <span className="text-[10px] sm:text-xs font-bold tracking-widest text-white/90 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-2.5 sm:px-3 py-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white
                    group-hover:bg-orange-500 group-hover:border-orange-400 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500
                    ${isBig ? "w-11 h-11 sm:w-14 sm:h-14" : "w-9 h-9 sm:w-11 sm:h-11"}
                    ${item.size === "large" ? "animate-[svcFloat_4s_ease-in-out_infinite]" : ""}`}
                  >
                    <Icon size={isBig ? 24 : 18} strokeWidth={2} />
                  </span>
                </div>

                {/* BOTTOM: title, description, arrow */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-6 z-10 flex items-end justify-between gap-3">
                  <div className="min-w-0 transition-transform duration-500 group-hover:-translate-y-1">
                    <h3
                      className={`text-white font-bold leading-tight tracking-tight ${
                        item.size === "large"
                          ? "text-2xl sm:text-4xl"
                          : isBig
                          ? "text-xl sm:text-3xl"
                          : "text-base sm:text-xl"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`text-white/75 text-xs sm:text-sm mt-1.5 transition-all duration-500 ${
                        isBig
                          ? "opacity-100"
                          : "hidden sm:block sm:opacity-0 sm:max-h-0 sm:group-hover:opacity-100 sm:group-hover:max-h-10"
                      }`}
                    >
                      {item.desc}
                    </p>

                    {/* animated underline */}
                    <span className="mt-2.5 block h-0.5 w-8 rounded-full bg-orange-400 transition-all duration-500 group-hover:w-16 group-hover:bg-white" />
                  </div>

                  <span className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg translate-y-2 opacity-90 sm:opacity-0 sm:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                    <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-12" />
                  </span>
                </div>

                {/* shine sweep */}
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 blur-md opacity-0 group-hover:opacity-100 group-hover:left-[160%] transition-all duration-1100 ease-out" />
              </Link>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes svcFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes svcDraw {
          from { stroke-dashoffset: 140; opacity: 1; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </section>
  )
}

export default ShopBySlider



























// "use client"

// import React, { useRef } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import { ChevronLeft, ChevronRight } from "lucide-react"

// import { IMAGES } from "@/routes/AllImages"
// import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

// const categories = [
//   { id: 1, title: "Electrician", image: IMAGES.Electrician },
//   { id: 2, title: "Plumber", image: IMAGES.Plumber },
//   { id: 3, title: "Carpenter", image: IMAGES.Carpenter },
//   { id: 4, title: "Mason", image: IMAGES.Mason },
//   { id: 5, title: "Painter", image: IMAGES.Painter },
//   { id: 6, title: "Welder", image: IMAGES.Welder },
//   { id: 7, title: "AC Technician", image: IMAGES.Ac_Technician },
//   { id: 8, title: "Tile Fixer", image: IMAGES.Tile_Fixer },
// ]

// const ShopBySlider = () => {
//   const sliderRef = useRef(null)

//   const scrollLeft = () => {
//     sliderRef.current?.scrollBy({
//       left: -400,
//       behavior: "smooth",
//     })
//   }

//   const scrollRight = () => {
//     sliderRef.current?.scrollBy({
//       left: 400,
//       behavior: "smooth",
//     })
//   }

//   return (
//     <section id="services" className="w-full px-4 sm:px-8 lg:px-16 py-10">
//       {/* HEADER */}
//       <div className="flex items-center justify-between mb-8">
//         <h2 className="text-2xl sm:text-3xl font-bold text-black">
//           Hire by Service
//         </h2>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={scrollLeft}
//             className="
//               w-10 h-10
//               rounded-full
//               border border-gray-300
//               flex items-center justify-center
//               hover:bg-black hover:text-white
//               transition-all duration-300
//               cursor-pointer
//             "
//           >
//             <ChevronLeft size={20} />
//           </button>

//           <button
//             onClick={scrollRight}
//             className="
//               w-10 h-10
//               rounded-full
//               border border-gray-300
//               flex items-center justify-center
//               hover:bg-black hover:text-white
//               transition-all duration-300
//               cursor-pointer
//             "
//           >
//             <ChevronRight size={20} />
//           </button>
//         </div>
//       </div>

//       {/* SLIDER */}
//       <div
//         ref={sliderRef}
//         className="
//           flex gap-5
//           overflow-x-auto
//           scroll-smooth
//           snap-x snap-mandatory
//           hide-scrollbar
//           pb-2
//         "
//       >
//         {categories.map((item) => (
//           <Link
//             key={item.id}
//             href={`${WEBSITE_SHOP}?category=${item.title}`}
//             className="
//               relative
//               min-w-65
//               sm:min-w-[320px]
//               lg:min-w-95
//               h-85
//               sm:h-105
//               rounded-3xl
//               overflow-hidden
//               group
//               snap-start
//               shrink-0
//             "
//           >
//             {/* IMAGE */}
//             <Image
//               src={item.image}
//               alt={item.title}
//               fill
//               loading="lazy"
//               quality={75}
//               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//               className="
//                 object-cover
//                 transition-transform
//                 duration-500
//                 group-hover:scale-105
//                 transform-gpu
//                 will-change-transform
//               "
//             />

//             {/* OVERLAY */}
//             <div className="absolute inset-0 bg-black/30 z-10" />

//             {/* CONTENT */}
//             <div className="absolute bottom-5 left-5 z-20">
//               <h3 className="text-white text-xl sm:text-2xl font-semibold">
//                 {item.title}
//               </h3>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </section>
//   )
// }

// export default ShopBySlider