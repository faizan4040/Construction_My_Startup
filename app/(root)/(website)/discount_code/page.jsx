'use client'

import { IMAGES } from '@/routes/AllImages'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    title: '15% off',
    img: IMAGES.Who_are_we,
    p1: 'For running clubs in the UK',
  },
  {
    title: '12% off SS2',
    img: IMAGES.Who_are_we,
    p1: 'For Blue Light Card Holders',
  },
  {
   title: '15% off',
    img: IMAGES.Who_are_we,
    p1: 'For running clubs in the UK',
  },
  {
    title: '15% off',
    img: IMAGES.Who_are_we,
    p1: 'For running clubs in the UK',
  },
  {
    title: '15% off',
    img: IMAGES.Who_are_we,
    p1: 'For running clubs in the UK',
  },
  {
    title: '15% off',
    img: IMAGES.Who_are_we,
    p1: 'For running clubs in the UK',
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
          alt="Discount Codes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-7xl mx-auto px-6 text-white">
            <h1 className="text-5xl lg:text-6xl font-extrabold">
              DISCOUNT CODES
            </h1>
          </div>
        </div>
      </section>

      {/* ---------- INTRO ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <h2 className="text-4xl lg:text-5xl font-bold">
          Welcome to the All Spikes Discount Codes Page
        </h2>

        <p className="text-lg leading-relaxed text-gray-700">
          We all love a good deal! At AllSpikes.com we bring you the best
          vouchers & personalised discount codes for running shoes, gym wear
          and outdoor equipment.
          <br /><br />
          Students can unlock a <strong>12% Student Discount</strong> via
          Student Beans or UNiDAYS.
          <br /><br />
          We also offer special discounts for running & triathlon clubs
          across the UK.
        </p>
      </section>

      {/* ---------- ABOUT SLIDER ---------- */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* HEADER + CONTROLS */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">About Us</h2>

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

                  <div className="p-8 mt-14">
                    <h3 className="text-2xl font-bold ">
                      {item.title}
                    </h3>

                    <p className="text-gray-700 text-lg mb-3">
                      {item.p1}
                    </p>

                    <p className="text-gray-700 text-lg">
                      {item.p2}
                    </p>
                     <button className='p-2 bg-black text-white rounded-2xl hover:bg-orange-500 cursor-pointer px-15'>join</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}

export default DiscountCode
