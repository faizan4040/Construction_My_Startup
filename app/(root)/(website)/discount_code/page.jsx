'use client'

import { IMAGES } from '@/routes/AllImages'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    <div>

      {/* ---------- HERO BANNER ---------- */}
      <section className="relative h-[60vh] w-full">
        <img
          src={IMAGES.discount_code}
          alt="BuildRush Offers & Discounts"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-7xl mx-auto px-6 text-white">
            <h1 className="text-5xl lg:text-6xl font-extrabold">
              OFFERS & DISCOUNTS
            </h1>
          </div>
        </div>
      </section>

      {/* ---------- INTRO ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <h2 className="text-4xl lg:text-5xl font-bold">
          Save on Every Build with BuildRush Exclusive Offers
        </h2>

        <p className="text-lg leading-relaxed text-gray-700">
          We know that keeping project costs down matters. That's why BuildRush
          offers a range of exclusive discounts for contractors, site managers
          and construction businesses across the UK.
          <br /><br />
          New customers can unlock a{' '}
          <strong>10% discount on their first delivery</strong> — and returning
          customers can take advantage of bulk order savings, labour hire
          discounts and our Refer & Earn programme.
          <br /><br />
          All offers are applied automatically or via simple codes at checkout.
          No hoops to jump through — just great value, delivered in 30 minutes.
        </p>
      </section>

      {/* ---------- OFFERS SLIDER ---------- */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* HEADER + CONTROLS */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Current Offers</h2>

            <div className="flex gap-3">
              <button
                onClick={prev}
                disabled={index === 0}
                className="p-2 rounded-full border bg-white hover:bg-black hover:text-white disabled:opacity-30 transition"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={next}
                disabled={index >= slides.length - visibleCards}
                className="p-2 rounded-full border bg-white hover:bg-black hover:text-white disabled:opacity-30 transition"
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
                  className="min-w-full lg:min-w-[31%] bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />

                  <div className="p-8 mt-6">
                    <h3 className="text-2xl font-bold mb-2">
                      {item.title}
                    </h3>

                    <p className="text-gray-900 font-semibold text-lg mb-3">
                      {item.p1}
                    </p>

                    <p className="text-gray-700 text-base mb-6">
                      {item.p2}
                    </p>

                    <button className="p-2 bg-black text-white rounded-2xl hover:bg-orange-500 cursor-pointer px-15 transition">
                      Claim Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-10 text-center">How to Redeem Your Discount</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div className="text-center">
            <div className="text-5xl font-extrabold text-orange-500 mb-4">01</div>
            <h3 className="text-xl font-semibold mb-2">Register Your Account</h3>
            <p className="text-gray-700">
              Create a free BuildRush business account. Verified contractors and
              site managers unlock additional exclusive rates automatically.
            </p>
          </div>

          <div className="text-center">
            <div className="text-5xl font-extrabold text-orange-500 mb-4">02</div>
            <h3 className="text-xl font-semibold mb-2">Place Your Order</h3>
            <p className="text-gray-700">
              Add materials or book labour hire through the platform. Eligible
              discounts are applied at checkout — no manual codes needed in
              most cases.
            </p>
          </div>

          <div className="text-center">
            <div className="text-5xl font-extrabold text-orange-500 mb-4">03</div>
            <h3 className="text-xl font-semibold mb-2">Delivered in 30 Minutes</h3>
            <p className="text-gray-700">
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