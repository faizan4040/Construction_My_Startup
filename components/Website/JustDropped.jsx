"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Building2, Home, Wrench, Sparkles } from "lucide-react"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const items = [
  {
    id: 1,
    title: "House Construction",
    desc: "Complete house construction from foundation to finishing",
    image: IMAGES.House_Construction,
    link: `${WEBSITE_SHOP}?service=construction`,
    icon: Building2,
    tags: ["Foundation", "Structure", "Finishing"],
  },
  {
    id: 2,
    title: "Home Renovation",
    desc: "Upgrade, remodel and renovate your home professionally",
    image: IMAGES.Home_Renovation,
    link: `${WEBSITE_SHOP}?service=renovation`,
    icon: Home,
    tags: ["Upgrade", "Remodel", "Renovate"],
  },
  {
    id: 3,
    title: "Repair & Maintenance",
    desc: "Electric, plumbing, tiles, paint and general repairs",
    image: IMAGES.Repair_Maintenance,
    link: `${WEBSITE_SHOP}?service=repair`,
    icon: Wrench,
    tags: ["Electric", "Plumbing", "Tiles", "Paint"],
  },
]

const JustDropped = () => {
  const gridRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(0)

  /* reveal on scroll */
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
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* cursor spotlight */
  const handleMouseMove = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`)
    el.style.setProperty("--my", `${e.clientY - rect.top}px`)
  }

  return (
    <section className="relative w-full px-4 sm:px-8 lg:px-16 py-14 sm:py-20 lg:py-28 overflow-hidden bg-linear-to-b from-white via-orange-50/40 to-white">
      {/* decoration */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full bg-orange-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-amber-300/25 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-5">
            <Sparkles size={13} />
            Book in minutes
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
            Special{" "}
            <span className="relative inline-block bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Services
              <span className="absolute left-0 right-0 -bottom-1.5 h-1 rounded-full bg-linear-to-r from-orange-500/70 to-amber-400/70" />
            </span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed">
            From the first brick to the final coat of paint, choose the service you need.
          </p>
        </div>

        {/* CARDS */}
        <div
          ref={gridRef}
          className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:h-135"
          onMouseLeave={() => setActive(0)}
        >
          {items.map((item, index) => {
            const Icon = item.icon
            const isActive = active === index

            return (
              <Link
                key={item.id}
                href={item.link}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onMouseMove={handleMouseMove}
                style={{
                  flexGrow: isActive ? 2.3 : 1,
                  transitionDelay: visible ? `${index * 100}ms, 0ms, 0ms` : "0ms",
                }}
                className={`group relative block overflow-hidden rounded-[28px] bg-gray-900 h-105 sm:h-115 lg:h-auto lg:basis-0 min-w-0
                shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-orange-500/20
                transition-[opacity,transform,flex-grow,box-shadow] duration-700 ease-out motion-reduce:transition-none
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              >
                {/* IMAGE */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority={false}
                  loading="lazy"
                  quality={75}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className={`object-cover transition-transform duration-1200 ease-out transform-gpu will-change-transform ${
                    isActive ? "lg:scale-110" : "lg:scale-100"
                  } group-hover:scale-110`}
                />

                {/* overlays */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-black/10" />
                <div
                  className={`absolute inset-0 bg-linear-to-t from-orange-600/60 via-transparent to-transparent transition-opacity duration-700 ${
                    isActive ? "lg:opacity-100" : "lg:opacity-0"
                  } opacity-0 group-hover:opacity-100`}
                />

                {/* spotlight */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(255,200,120,0.30), transparent 65%)",
                  }}
                />

                {/* ring */}
                <div
                  className={`pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset transition-all duration-500 ${
                    isActive ? "ring-orange-300/70" : "ring-white/10"
                  }`}
                />

                {/* TOP: icon + outlined number */}
                <div className="absolute top-5 left-5 right-5 sm:top-6 sm:left-6 sm:right-6 z-10 flex items-start justify-between">
                  <span
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border transition-all duration-500 ${
                      isActive
                        ? "bg-orange-500 border-orange-300 rotate-6 scale-110 shadow-lg shadow-orange-500/40"
                        : "bg-white/15 border-white/25"
                    }`}
                  >
                    <Icon size={24} strokeWidth={2} />
                  </span>

                  <span
                    className="text-6xl sm:text-7xl font-black leading-none text-transparent select-none"
                    style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.55)" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* BOTTOM CONTENT */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-7 text-white">
                  <h3
                    className={`font-extrabold leading-[1.05] tracking-tight transition-all duration-700 ${
                      isActive ? "lg:text-4xl" : "lg:text-2xl"
                    } text-3xl sm:text-4xl`}
                  >
                    {item.title}
                  </h3>

                  <span
                    className={`mt-3 block h-1 rounded-full bg-orange-400 transition-all duration-700 ${
                      isActive ? "w-20 bg-white lg:w-24" : "w-10"
                    } group-hover:w-24`}
                  />

                  {/* details (always visible on mobile, revealed on the active desktop panel) */}
                  <div
                    className={`transition-all duration-700 ${
                      isActive
                        ? "lg:opacity-100 lg:translate-y-0 lg:max-h-60"
                        : "lg:opacity-0 lg:translate-y-4 lg:max-h-0 lg:overflow-hidden lg:pointer-events-none"
                    }`}
                  >
                    <p className="mt-4 text-sm sm:text-base text-white/85 max-w-md leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="mt-6 inline-flex items-center gap-3 h-12 pl-6 pr-1.5 rounded-full bg-white text-gray-900 text-sm font-bold shadow-xl transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                      Book Service
                      <span className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-orange-500">
                        <ArrowUpRight
                          size={17}
                          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </span>
                  </div>
                </div>

                {/* shine sweep */}
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 blur-md opacity-0 group-hover:opacity-100 group-hover:left-[160%] transition-all duration-1200 ease-out" />
              </Link>
            )
          })}
        </div>

        {/* desktop indicator dots */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-8">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${item.title}`}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                active === i ? "w-10 bg-orange-500" : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default JustDropped