"use client"

import React, { useState } from "react"
import {
  IndianRupee,
  Handshake,
  Globe2,
  Boxes,
  TrendingUp,
  Banknote,
  Layers,
  Truck,
  ShoppingCart,
  Store,
  ArrowUpRight,
} from "lucide-react"

const TABS = {
  buyer: {
    label: "Buyer",
    icon: ShoppingCart,
    title: "Why Buyers Choose Us",
    highlight: "Buyers",
    subtitle: "Better prices, flexible credit and every construction service on one platform.",
    items: [
      {
        title: "Get Lowest Price",
        desc: "Get rates lower than the existing market prices",
        icon: IndianRupee,
      },
      {
        title: "Get Credit",
        desc: "No need to worry about working capital",
        icon: Handshake,
      },
      {
        title: "Pan India & Global",
        desc: "Access services across India and globally",
        icon: Globe2,
      },
      {
        title: "Multiple Services",
        desc: "All construction services in one place",
        icon: Boxes,
      },
    ],
  },
  supplier: {
    label: "Supplier",
    icon: Store,
    title: "Why Suppliers Choose Us",
    highlight: "Suppliers",
    subtitle: "Reach more customers, get paid faster and let us handle the heavy lifting.",
    items: [
      {
        title: "Grow Your Business",
        desc: "Reach more customers and increase earnings",
        icon: TrendingUp,
      },
      {
        title: "Advance Payments",
        desc: "Get paid quickly without delays",
        icon: Banknote,
      },
      {
        title: "High Order Volume",
        desc: "Get regular and bulk work opportunities",
        icon: Layers,
      },
      {
        title: "Full Support",
        desc: "We manage logistics and support your work",
        icon: Truck,
      },
    ],
  },
}

const BuyerSupplierSection = () => {
  const [activeTab, setActiveTab] = useState("buyer")
  const current = TABS[activeTab]

  return (
    <section className="relative w-full px-4 sm:px-8 lg:px-16 py-20 sm:py-28 overflow-hidden bg-linear-to-b from-gray-50 via-white to-orange-50/40">
      {/* decorative background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-amber-300/25 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* HEADING */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Built for everyone in construction
          </span>

          <h2
            key={`title-${activeTab}`}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight animate-[bsFade_0.45s_ease-out]"
          >
            Why{" "}
            <span className="relative inline-block bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {current.highlight}
              <span className="absolute left-0 right-0 -bottom-1 h-1 rounded-full bg-linear-to-r from-orange-500/70 to-amber-400/70" />
            </span>{" "}
            Choose Us
          </h2>

          <p
            key={`sub-${activeTab}`}
            className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed animate-[bsFade_0.55s_ease-out]"
          >
            {current.subtitle}
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex justify-center mb-14">
          <div
            role="tablist"
            aria-label="Buyer or supplier"
            className="relative grid grid-cols-2 p-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-xl shadow-gray-900/5"
          >
            {/* sliding indicator */}
            <span
              className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-full bg-linear-to-r from-gray-900 to-gray-800 shadow-lg shadow-gray-900/25 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                activeTab === "supplier" ? "translate-x-full" : "translate-x-0"
              }`}
            />

            {Object.entries(TABS).map(([key, tab]) => {
              const Icon = tab.icon
              const active = activeTab === key
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(key)}
                  className={`relative z-10 flex items-center justify-center gap-2 px-7 sm:px-10 py-2.5 rounded-full font-semibold text-sm sm:text-base cursor-pointer transition-colors duration-300 ${
                    active ? "text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon size={17} className={active ? "text-orange-400" : ""} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* CARDS */}
        <div
          key={activeTab}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {current.items.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                style={{ animationDelay: `${index * 90}ms` }}
                className="group relative opacity-0 animate-[bsRise_0.6s_ease-out_forwards]"
              >
                {/* glow behind card on hover */}
                <div className="pointer-events-none absolute -inset-px rounded-[28px] bg-linear-to-br from-orange-500 via-amber-400 to-orange-600 opacity-0 blur-md group-hover:opacity-60 transition-opacity duration-500" />

                <div className="relative h-full overflow-hidden rounded-3xl bg-white border border-gray-100 p-7 shadow-lg shadow-gray-900/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-transparent group-hover:shadow-2xl">
                  {/* top accent line */}
                  <span className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-orange-500 to-amber-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                  {/* watermark number */}
                  <span className="absolute -top-2 right-4 text-7xl font-black text-gray-900/4 group-hover:text-orange-500/15 transition-colors duration-500 select-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* icon */}
                  <div className="relative mb-6 w-16 h-16">
                    <span className="absolute inset-0 rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500" />
                    <div className="relative w-full h-full flex items-center justify-center rounded-2xl bg-linear-to-br from-gray-900 to-gray-700 text-white shadow-lg group-hover:from-orange-500 group-hover:to-amber-500 group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                      <Icon size={26} strokeWidth={2} />
                    </div>
                  </div>

                  <h3 className="relative text-xl font-bold text-gray-900 mb-2.5 group-hover:text-orange-600 transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="relative text-gray-500 text-[15px] leading-relaxed">
                    {item.desc}
                  </p>

                  {/* corner arrow */}
                  <span className="relative mt-6 inline-flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all duration-300">
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes bsFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bsRise {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </section>
  )
}

export default BuyerSupplierSection