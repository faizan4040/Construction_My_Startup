'use client'

import { IMAGES } from '@/routes/AllImages'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Tag, ArrowUpRight } from 'lucide-react'

const slides = [
  {
    title: '10% off First Order',
    img: IMAGES.Who_are_we,
    p1: 'New to BuildRush?',
    p2: 'Get 10% off your first material delivery order when you register a business account. Use code FIRST10 at checkout.',
  },
  {
    title: 'Free Delivery',
    img: IMAGES.Who_are_we,
    p1: 'On orders over £150',
    p2: 'Place a single material order over £150 and get free 30-minute delivery to your site — no code needed, applied automatically.',
  },
  {
    title: '15% off Labour Hire',
    img: IMAGES.Who_are_we,
    p1: 'For registered contractors',
    p2: 'Verified construction contractors and principal contractors get 15% off their first labour hire booking. Apply via your account dashboard.',
  },
  {
    title: 'Bulk Order Discount',
    img: IMAGES.Who_are_we,
    p1: 'Save more when you order more',
    p2: 'Order materials worth £500 or more in a single delivery and receive an automatic 8% bulk discount. Ideal for large site restocks.',
  },
  {
    title: 'Site Manager Deal',
    img: IMAGES.Who_are_we,
    p1: 'For site managers & foremen',
    p2: 'Verified site managers get a dedicated account manager, priority dispatch and an exclusive 12% discount on recurring material orders.',
  },
  {
    title: 'Refer & Earn',
    img: IMAGES.Who_are_we,
    p1: 'Refer a business, earn £50 credit',
    p2: 'Refer another contractor or construction business to BuildRush and earn £50 platform credit when they complete their first order.',
  },
]

/* ── Blueprint grid overlay ── */
const BlueprintGrid = ({ opacity = 0.1 }) => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      opacity,
      backgroundImage:
        'linear-gradient(#4A7A96 1px, transparent 1px), linear-gradient(90deg, #4A7A96 1px, transparent 1px)',
      backgroundSize: '36px 36px',
    }}
  />
)

/* ── Scrolling hazard ticker ── */
const Ticker = () => {
  const items = ['CODE: FIRST10', 'FREE DELIVERY OVER £150', 'BULK ORDER SAVINGS', 'REFER & EARN £50']
  const row = (
    <>
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-4 mx-4">
          <span>{t}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#14161A]/60" />
        </span>
      ))}
    </>
  )
  return (
    <div className="relative overflow-hidden bg-[#F97316] text-[#14161A] py-3 whitespace-nowrap">
      <div className="offers-marquee flex text-sm font-bold uppercase tracking-[0.2em]">
        <div className="flex shrink-0">{row}{row}</div>
        <div className="flex shrink-0" aria-hidden="true">{row}{row}</div>
      </div>
      <style>{`
        .offers-marquee { animation: offers-scroll 20s linear infinite; width: max-content; }
        @keyframes offers-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .offers-marquee { animation: none; }
        }
      `}</style>
    </div>
  )
}

const DiscountCode = () => {
  const [index, setIndex] = useState(0)
  const visibleCards = 2

  const next = () => {
    if (index < slides.length - visibleCards) {
      setIndex(index + 1)
    }
  }

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1)
    }
  }

  return (
    <div className="w-full bg-[#F5F3EF] text-[#14161A]">

      {/* ---------- HERO BANNER ---------- */}
      <section className="relative h-[60vh] w-full overflow-hidden bg-[#0F1114]">
        <img
          src={IMAGES.discount_code}
          alt="BuildRush Offers & Discounts"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1114] via-[#0F1114]/60 to-[#0F1114]/10" />
        <BlueprintGrid />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-14 w-full">
            <div className="inline-flex items-center gap-2 text-[#F97316] text-xs font-mono uppercase tracking-[0.3em] mb-5">
              <Tag size={16} strokeWidth={2.5} />
              Exclusive Rates
            </div>
            <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[0.95]">
              Offers &amp; Discounts
            </h1>
          </div>
        </div>
      </section>

      <Ticker />

      {/* ---------- INTRO ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.05]">
          Save on Every Build with BuildRush Exclusive Offers
        </h2>

        <div className="border-l-2 border-[#F97316] pl-6">
          <p className="text-lg leading-relaxed text-[#3A3D42]">
            We know that keeping project costs down matters. That's why BuildRush
            offers a range of exclusive discounts for contractors, site managers
            and construction businesses across the UK.
            <br /><br />
            New customers can unlock a{' '}
            <strong className="text-[#14161A] font-semibold">10% discount on their first delivery</strong> — and returning
            customers can take advantage of bulk order savings, labour hire
            discounts and our Refer &amp; Earn programme.
            <br /><br />
            All offers are applied automatically or via simple codes at checkout.
            No hoops to jump through — just great value, delivered in 30 minutes.
          </p>
        </div>
      </section>

      {/* ---------- OFFERS SLIDER ---------- */}
      <section className="bg-[#14161A] py-20 relative overflow-hidden">
        <BlueprintGrid opacity={0.06} />
        <div className="relative max-w-7xl mx-auto px-6">

          {/* HEADER + CONTROLS */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#F97316]">Live Now</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white mt-2">Current Offers</h2>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prev}
                disabled={index === 0}
                className="p-2.5 border border-white/20 text-white hover:bg-[#F97316] hover:border-[#F97316] hover:text-[#14161A] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={next}
                disabled={index >= slides.length - visibleCards}
                className="p-2.5 border border-white/20 text-white hover:bg-[#F97316] hover:border-[#F97316] hover:text-[#14161A] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* SLIDER */}
          <div className="overflow-hidden">
            <div
              className="flex gap-8 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${index * 50}%)`,
              }}
            >
              {slides.map((item, i) => (
                <div
                  key={i}
                  className="min-w-full lg:min-w-[31%] bg-[#F5F3EF] overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-64 object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[#14161A] text-[#F97316] text-[10px] font-mono uppercase tracking-[0.25em] px-3 py-1.5">
                      Offer
                    </div>
                  </div>

                  <div className="p-8 border-t-2 border-[#F97316]">
                    <h3 className="text-2xl font-extrabold mb-2 uppercase tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-[#14161A] font-semibold text-lg mb-3">
                      {item.p1}
                    </p>

                    <p className="text-[#3A3D42] text-base mb-6 leading-relaxed">
                      {item.p2}
                    </p>

                    <button className="inline-flex items-center gap-2 bg-[#14161A] text-white font-bold uppercase tracking-wide text-sm px-6 py-3 hover:bg-[#F97316] hover:text-[#14161A] cursor-pointer transition-colors">
                      Claim Offer <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#F97316]">The Process</span>
          <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mt-2">How to Redeem Your Discount</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#14161A]/10">

          <div className="bg-[#F5F3EF] p-8 text-center flex flex-col items-center">
            <div className="text-5xl font-black text-[#F97316] mb-4 font-mono">01</div>
            <h3 className="text-xl font-extrabold uppercase tracking-tight mb-3">Register Your Account</h3>
            <p className="text-[#3A3D42] leading-relaxed">
              Create a free BuildRush business account. Verified contractors and
              site managers unlock additional exclusive rates automatically.
            </p>
          </div>

          <div className="bg-[#F5F3EF] p-8 text-center flex flex-col items-center">
            <div className="text-5xl font-black text-[#F97316] mb-4 font-mono">02</div>
            <h3 className="text-xl font-extrabold uppercase tracking-tight mb-3">Place Your Order</h3>
            <p className="text-[#3A3D42] leading-relaxed">
              Add materials or book labour hire through the platform. Eligible
              discounts are applied at checkout — no manual codes needed in
              most cases.
            </p>
          </div>

          <div className="bg-[#F5F3EF] p-8 text-center flex flex-col items-center">
            <div className="text-5xl font-black text-[#F97316] mb-4 font-mono">03</div>
            <h3 className="text-xl font-extrabold uppercase tracking-tight mb-3">Delivered in 30 Minutes</h3>
            <p className="text-[#3A3D42] leading-relaxed">
              Sit back while we handle the rest. Your materials arrive on site
              within 30 minutes — saving you time and keeping your project on
              schedule.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}

export default DiscountCode