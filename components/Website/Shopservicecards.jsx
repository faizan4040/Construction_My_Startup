"use client"

import React from "react"
import {
  ShoppingBag,
  HardHat,
  ArrowUpRight,
  Award,
  BadgeIndianRupee,
  Truck,
  BadgeCheck,
  ReceiptText,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react"

/**
 * The image fills the entire left side of each card (object-cover).
 * For your own photos, put them in /public and use "/images/xyz.jpg".
 * Landscape photos (4:3 or wider) work best.
 */
const CARDS = [
  {
    id: "products",
    theme: "light",
    icon: ShoppingBag,
    title: "Shop Products",
    text: "High quality construction materials from trusted brands.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&h=600&q=80",
    imageAlt: "Stacked construction materials at a building site",
    badge: { icon: Star, text: "Trusted brands" },
    features: [
      { icon: Award, label: "Top Brands" },
      { icon: BadgeIndianRupee, label: "Competitive Prices" },
      { icon: Truck, label: "Fast Delivery" },
    ],
    cta: "Browse Products",
    href: "https://nextzabiirconstructezy.vercel.app/#products-section",
  },
  {
    id: "services",
    theme: "dark",
    icon: HardHat,
    title: "Book Services",
    text: "Verified professionals for all your construction needs.",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&h=600&q=80",
    imageAlt: "Construction professionals reviewing plans on site",
    badge: { icon: BadgeCheck, text: "Verified Professionals" },
    features: [
      { icon: ReceiptText, label: "Upfront Pricing" },
      { icon: Clock, label: "On-time Service" },
      { icon: ShieldCheck, label: "Quality Assurance" },
    ],
    cta: "Browse Services",
    href: "https://nextzabiirconstructezy.vercel.app/#services-section",
  },
]

const ShopServiceCards = () => {
  return (
    <section id="shop-services" className="w-full bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
      <style>{`
        @keyframes ssRise { from { opacity:0; transform:translateY(26px) } to { opacity:1; transform:none } }
        .ss-rise { animation:ssRise .85s cubic-bezier(.22,1,.36,1) both }
        @media (prefers-reduced-motion:reduce){ .ss-rise { animation:none!important } }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl text-3xl font-black leading-tight tracking-tight text-black sm:text-5xl">
            What do you need{" "}
            <span className="relative inline-block">
              <span className="relative z-10">today?</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-3 -skew-x-6 bg-orange-500/40 sm:h-4" />
            </span>
          </h2>
          <p className="max-w-sm border-l-4 border-orange-500 pl-4 text-sm text-neutral-600 sm:text-base">
            Buy materials or hire a professional. Pick one to get started.
          </p>
        </div>

        {/* Horizontal cards */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {CARDS.map((c, i) => {
            const dark = c.theme === "dark"
            const Icon = c.icon
            const Badge = c.badge.icon
            return (
              <article
                key={c.id}
                className={`ss-rise group relative flex flex-col overflow-hidden rounded-[1.75rem] border sm:flex-row ${
                  dark
                    ? "border-black bg-black text-white shadow-xl shadow-black/20"
                    : "border-neutral-200 bg-white text-black shadow-xl shadow-neutral-300/60"
                }`}
                style={{ animationDelay: `${0.1 + i * 0.15}s` }}
              >
                {/* Image side */}
                <div className="relative shrink-0 overflow-hidden bg-neutral-200 sm:w-[42%]">
                  {/* Image fills the whole left side, edge to edge */}
                  <div className="aspect-[4/3] w-full sm:absolute sm:inset-0 sm:aspect-auto">
                    <img
                      src={c.image}
                      alt={c.imageAlt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* soft shade so the badge is always readable */}
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/45 via-transparent to-black/25" />

                  {/* orange edge between image and content */}
                  <div className="absolute bottom-0 left-0 h-1.5 w-full bg-orange-500 sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-1.5" />

                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-[11px] font-bold text-white shadow-lg sm:text-xs">
                    <Badge size={13} className="text-orange-400" />
                    {c.badge.text}
                  </div>
                </div>

                {/* Content side */}
                <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-7">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          dark ? "bg-orange-500 text-white" : "bg-black text-orange-400"
                        }`}
                      >
                        <Icon size={24} />
                      </span>
                      <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                        {c.title}
                      </h3>
                    </div>

                    <p
                      className={`mt-3 text-sm leading-relaxed sm:text-base ${
                        dark ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      {c.text}
                    </p>

                    <ul className="mt-5 flex flex-wrap gap-2">
                      {c.features.map(({ icon: F, label }) => (
                        <li
                          key={label}
                          className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-xs font-bold sm:text-sm ${
                            dark
                              ? "border-white/20 bg-white/5 text-white"
                              : "border-neutral-200 bg-neutral-50 text-neutral-800"
                          }`}
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                            <F size={13} />
                          </span>
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={c.href}
                    className={`group/btn flex w-full cursor-pointer items-center justify-between rounded-full py-1.5 pl-6 pr-1.5 text-sm font-extrabold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 ${
                      dark
                        ? "bg-orange-500 text-white hover:bg-white hover:text-black"
                        : "bg-black text-white hover:bg-orange-500"
                    }`}
                  >
                    {c.cta}
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover/btn:rotate-45 ${
                        dark ? "bg-black text-white" : "bg-orange-500 text-white"
                      }`}
                    >
                      <ArrowUpRight size={18} />
                    </span>
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ShopServiceCards


