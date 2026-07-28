"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { RiArrowLeftSLine, RiArrowRightSLine, RiArrowRightLine } from "react-icons/ri"
import {
  Hammer,
  Wrench,
  PaintRoller,
  Drill,
  HardHat,
  Truck,
  Pickaxe,
  House,
  ShieldCheck,
  Construction,
  Warehouse,
  Users,
} from "lucide-react"

const LABOUR_CATEGORIES = [
  {
    title: "All Workers",
    desc: "Browse all available workers",
    Icon: Users,
    tag: "Popular",
    slug: "all",
  },
  {
    title: "Helpers",
    desc: "Loading, shifting & site assistance",
    Icon: Construction,
    tag: "Fast",
    slug: "helpers",
  },
  {
    title: "Masons",
    desc: "Brickwork, plaster & construction",
    Icon: Hammer,
    tag: "Top Rated",
    slug: "masons",
  },
  {
    title: "Electricians",
    desc: "Wiring, fittings & repairs",
    Icon: Drill,
    tag: "24×7",
    slug: "electricians",
  },
  {
    title: "Plumbers",
    desc: "Pipes, taps & bathroom work",
    Icon: Wrench,
    tag: "Quick",
    slug: "plumbers",
  },
  {
    title: "Carpenters",
    desc: "Furniture & wood work",
    Icon: Warehouse,
    tag: "Popular",
    slug: "carpenters",
  },
  {
    title: "Painters",
    desc: "Interior & exterior painting",
    Icon: PaintRoller,
    tag: "Premium",
    slug: "painters",
  },
  {
    title: "Tile Experts",
    desc: "Floor & wall tile installation",
    Icon: House,
    tag: "Trending",
    slug: "tile-experts",
  },
  {
    title: "Welders",
    desc: "Steel fabrication & gate work",
    Icon: ShieldCheck,
    tag: "Verified",
    slug: "welders",
  },
  {
    title: "JCB Operators",
    desc: "Excavation & heavy equipment",
    Icon: Truck,
    tag: "Heavy",
    slug: "jcb-operators",
  },
  {
    title: "Contractors",
    desc: "Complete construction projects",
    Icon: Pickaxe,
    tag: "Pro",
    slug: "contractors",
  },
  {
    title: "Engineers",
    desc: "Site supervision & planning",
    Icon: HardHat,
    tag: "Expert",
    slug: "engineers",
  },
]

const LaborSlider = () => {
  const sliderRef = useRef(null)

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" })
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" })

  return (
    <section
      className="w-full bg-white py-16 px-4 sm:px-8 lg:px-16 overflow-hidden"
      style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex items-end justify-between mb-10"
        >
          <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-0.5 w-8 bg-zinc-900 rounded-full" />

            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <span className="bg-black text-white px-3 py-1 rounded-full">
                Book Now
              </span>
              <span>Skilled Workforce</span>
            </p>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900">
            Labour <span className="text-orange-500">Categories</span>
          </h2>
        </div>

          <div className="flex items-center gap-3">
            <Link
              href="/labour"
              className="hidden sm:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all"
            >
              See All <RiArrowRightLine />
            </Link>
            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
            >
              <RiArrowLeftSLine size={20} />
            </button>
            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
            >
              <RiArrowRightSLine size={20} />
            </button>
          </div>
        </motion.div>

        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {LABOUR_CATEGORIES.map(({ title, desc, Icon, tag, slug }, i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: "easeOut" }}
              className="shrink-0"
            >
              <Link
                href={slug === "all" ? "/labour" : `/labour?category=${slug}`}
                className="group block min-w-56 max-w-56 h-full bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 p-5"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                    <Icon
                      size={26}
                      strokeWidth={1.75}
                      className="text-orange-500 group-hover:text-white transition-colors duration-300"
                    />
                  </div>
                  <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base leading-tight">{title}</h3>
                <p className="text-gray-400 text-xs mt-1.5 leading-snug">{desc}</p>

                <div className="border-t border-gray-100 mt-5 pt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 group-hover:text-orange-500 transition-colors">
                    Browse
                  </span>
                  <span className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-orange-500 flex items-center justify-center transition-colors duration-300">
                    <RiArrowRightLine className="text-gray-400 group-hover:text-white text-sm transition-colors duration-300" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/labour"
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-3 rounded-full text-sm"
          >
            See All Categories <RiArrowRightLine />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LaborSlider























// "use client"

// import React, { useEffect, useRef, useState } from "react"
// import {
//   RiArrowLeftSLine, RiArrowRightSLine, RiStarFill,
//   RiMapPinLine, RiTimeLine, RiUser3Line, RiArrowRightLine
// } from "react-icons/ri"
// import axios from "axios"
// import Link from "next/link"

// const MAX_WORKERS = 12

// const LaborSlider = () => {
//   const sliderRef = useRef(null)
//   const [workers, setWorkers] = useState([])
//   const [loading, setLoading] = useState(true)

//   const fetchWorkers = async () => {
//     setLoading(true)
//     try {
//       const { data } = await axios.get(`/api/labour/all?limit=${MAX_WORKERS}`)
//       const workerArray = Array.isArray(data.profiles) ? data.profiles : []
//       setWorkers(workerArray.slice(0, MAX_WORKERS))
//     } catch (err) {
//       console.error("LaborSlider fetch error:", err)
//       setWorkers([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { fetchWorkers() }, [])

//   const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -320, behavior: "smooth" })
//   const scrollRight = () => sliderRef.current?.scrollBy({ left:  320, behavior: "smooth" })

//   return (
//     <section className="w-full px-4 sm:px-8 lg:px-16 py-12"
//       style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}>

//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-2">Skilled Workforce</p>
//           <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-gray-900">
//             Available <span className="text-orange-500">Workers</span>
//           </h2>
//         </div>
//         <div className="flex items-center gap-3">
//           <Link href="/labour"
//             className="hidden sm:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all">
//             See All <RiArrowRightLine />
//           </Link>
//           <button onClick={scrollLeft}
//             className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200">
//             <RiArrowLeftSLine size={20} />
//           </button>
//           <button onClick={scrollRight}
//             className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200">
//             <RiArrowRightSLine size={20} />
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex gap-5">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="min-w-65 bg-gray-100 rounded-2xl h-80 animate-pulse shrink-0" />
//           ))}
//         </div>
//       ) : workers.length === 0 ? (
//         <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
//           <RiUser3Line className="text-4xl text-gray-300 mx-auto mb-3" />
//           <p className="text-gray-400 text-sm font-medium">No professionals listed yet.</p>
//           <p className="text-gray-300 text-xs mt-1">Be the first to create a profile!</p>
//         </div>
//       ) : (
//         <>
//           <div ref={sliderRef}
//             className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
//             style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>

//             {workers.map((worker) => {
//               const skills = Array.isArray(worker.skills)
//                 ? worker.skills.slice(0, 2)
//                 : typeof worker.skills === "string"
//                 ? worker.skills.split(",").slice(0, 2).map((s) => s.trim())
//                 : []
//               return (
//                 <Link key={worker._id}
//                   href={`/labour/profile/${worker.slug || worker._id}`}
//                   className="min-w-65 max-w-65 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group shrink-0 border border-gray-100 hover:border-orange-200">
//                   <div className="relative bg-linear-to-br from-orange-50 to-gray-50 h-44 flex items-center justify-center overflow-hidden">
//                     {worker.profileImageUrl ? (
//                       <img src={worker.profileImageUrl} alt={`${worker.firstName} ${worker.lastName}`}
//                         className="h-32 w-32 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-300" />
//                     ) : (
//                       <div className="w-24 h-24 rounded-2xl bg-orange-100 flex items-center justify-center">
//                         <RiUser3Line className="text-4xl text-orange-400" />
//                       </div>
//                     )}
//                     <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
//                       <RiStarFill className="text-orange-500 text-xs" />
//                       <span className="text-xs font-bold text-gray-800">
//                         {worker.rating > 0 ? worker.rating.toFixed(1) : "New"}
//                       </span>
//                     </div>
//                     {worker.isVerified && (
//                       <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">VERIFIED</span>
//                     )}
//                   </div>
//                   <div className="p-4">
//                     <h3 className="font-bold text-gray-900 text-base leading-tight">{worker.firstName} {worker.lastName}</h3>
//                     <p className="text-orange-500 text-xs font-semibold mt-0.5">{worker.profession}</p>
//                     <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
//                       {worker.city && <span className="flex items-center gap-1"><RiMapPinLine />{worker.city}</span>}
//                       <span className="flex items-center gap-1"><RiTimeLine />{worker.experienceYears} yrs</span>
//                     </div>
//                     {skills.length > 0 && (
//                       <div className="flex gap-1.5 mt-2.5 flex-wrap">
//                         {skills.map((s, i) => (
//                           <span key={i} className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">{s}</span>
//                         ))}
//                       </div>
//                     )}
//                     <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
//                       <div>
//                         <p className="text-[10px] text-gray-400 font-medium">Starting</p>
//                         <p className="text-base font-extrabold text-gray-900">
//                           ₹{worker.hourlyRate}<span className="text-xs text-gray-400 font-normal">/hr</span>
//                         </p>
//                       </div>
//                       <span className="bg-orange-500 group-hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200">
//                         View Profile
//                       </span>
//                     </div>
//                   </div>
//                 </Link>
//               )
//             })}

//             {/* See All card */}
//             <Link href="/labour"
//               className="min-w-45 bg-linear-to-br from-orange-500 to-amber-500 rounded-3xl flex flex-col items-center justify-center gap-3 shrink-0 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg group">
//               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                 <RiArrowRightLine className="text-2xl" />
//               </div>
//               <div className="text-center">
//                 <p className="font-black text-base">See All</p>
//                 <p className="text-orange-100 text-xs mt-0.5">Professionals</p>
//               </div>
//             </Link>
//           </div>

//           <div className="sm:hidden mt-4 text-center">
//             <Link href="/labour"
//               className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-3 rounded-full text-sm">
//               See All Professionals <RiArrowRightLine />
//             </Link>
//           </div>
//         </>
//       )}
//     </section>
//   )
// }

// export default LaborSlider
