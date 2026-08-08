'use client'

import React from 'react'
import { Phone, CheckCircle, Search, Zap, Shield, Award, Truck } from 'lucide-react'

const benefits = [
  { icon: Zap, text: 'We\u2019ll beat your price by £1.00' },
  { icon: Truck, text: 'Free UK Standard delivery worth £4.99' },
  { icon: Shield, text: 'Trusted, reliable company since 1982' },
  { icon: Award, text: 'Multi-award winning retailer with expert advice' },
]

const terms = [
  'This offer applies only to prices on our website or catalogue.',
  'Does not apply to graded goods, clearance, discontinued or specially discounted items.',
  'Proof of offer may be required and items must be in stock at the competing retailer.',
  'Price promise does not apply after a sale has been confirmed.',
  'Prices must be advertised at the time of checking.',
  'Only valid against UK websites and retailers.',
  'Valid for credit card transactions only.',
  'Price match quotations are valid for 48 hours.',
  'Cannot be combined with any other promotions.',
  'Does not apply to gym equipment.',
  'Item value must be over £10.00.',
  'Items must be the same model, colour, size and width fitting.',
  'UK residents and delivery addresses only.',
  'Bulk purchases are excluded.',
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

/* ── Corner-bracket frame ── */
const CornerBrackets = ({ color = '#F97316' }) => (
  <>
    <span className="absolute -top-px -left-px h-5 w-5 border-t-2 border-l-2" style={{ borderColor: color }} />
    <span className="absolute -top-px -right-px h-5 w-5 border-t-2 border-r-2" style={{ borderColor: color }} />
    <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2" style={{ borderColor: color }} />
    <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2" style={{ borderColor: color }} />
  </>
)

const PriceBeatPromise = () => {
  return (
    <div className="w-full bg-[#F5F3EF] text-[#14161A]">

      {/* ---------- HERO / BANNER ---------- */}
      <section className="relative bg-[#14161A] text-white py-24 text-center px-4 overflow-hidden">
        <BlueprintGrid />
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #F97316 0 14px, transparent 14px 28px)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[#F97316] text-xs font-mono uppercase tracking-[0.3em] mb-6">
            <Award size={16} strokeWidth={2.5} />
            Price Guarantee
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight mb-5 leading-[1.05]">
            Our Price Beat Commitment
          </h1>
          <p className="max-w-3xl mx-auto text-lg lg:text-xl text-[#C9CCD1]">
            We'll beat your price by <strong className="text-[#F97316] font-bold">£1.00</strong> and give you{' '}
            <strong className="text-[#F97316] font-bold">FREE UK Standard delivery</strong> on your order!
          </p>
        </div>
      </section>

      {/* ---------- MAIN CONTENT ---------- */}
      <section className="max-w-7xl mx-auto px-4 py-20 space-y-20">

        {/* ---------- INTRO ---------- */}
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <p className="text-[#3A3D42] text-lg leading-relaxed">
            We're absolutely committed to being the cheapest store on the web.
            If you find any price cheaper, call our price beat team now or submit
            your details and we'll call you back as soon as possible.
          </p>

          <div className="inline-flex items-center gap-3 bg-[#14161A] text-white px-6 py-3">
            <Phone size={18} className="text-[#F97316]" />
            <span className="text-lg font-mono font-semibold tracking-wide">01274 530530</span>
          </div>
        </div>

        {/* ---------- BENEFITS ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#14161A]/10">
          {benefits.map(({ icon: Icon, text }, index) => (
            <div
              key={index}
              className="bg-white p-7 flex flex-col gap-4"
            >
              <Icon size={24} className="text-[#F97316]" strokeWidth={2} />
              <p className="text-[#3A3D42] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* ---------- PRODUCT LOOK UP ---------- */}
        <div className="relative bg-[#14161A] p-8 lg:p-12 overflow-hidden">
          <BlueprintGrid opacity={0.06} />
          <div className="relative space-y-8">
            <div className="text-center">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#F97316]">Lookup Tool</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white mt-2">
                Product Look Up
              </h2>
            </div>

            {/* SKU INPUT */}
            <div className="max-w-md mx-auto">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#9098A0] mb-3">
                Finding Your Product SKU
              </label>
              <div className="flex gap-0">
                <input
                  type="text"
                  placeholder="Enter Product Code (e.g. ADI199)"
                  className="flex-1 bg-[#1B1E23] border border-white/15 px-4 py-3 text-white placeholder-[#6C7278] font-mono text-sm focus:outline-none focus:border-[#F97316]"
                />
                <button className="bg-[#F97316] text-[#14161A] px-5 hover:bg-white transition-colors">
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* HOW TO FIND SKU */}
            <div className="max-w-3xl mx-auto bg-[#1B1E23] border-l-2 border-[#F97316] p-6">
              <h3 className="font-semibold text-lg text-white mb-3">
                Find your product SKU
              </h3>
              <ul className="space-y-2.5 text-[#C9CCD1]">
                <li className="flex gap-3">
                  <span className="text-[#F97316] shrink-0">›</span>
                  Go to the product page on the allspikes.com website
                </li>
                <li className="flex gap-3">
                  <span className="text-[#F97316] shrink-0">›</span>
                  <span><strong className="text-white font-semibold">Desktop:</strong> Right-hand side below the "Add to Bag" button</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#F97316] shrink-0">›</span>
                  <span><strong className="text-white font-semibold">Mobile:</strong> Below the "Add to Bag" button</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#F97316] shrink-0">›</span>
                  <span>Copy the <strong className="text-white font-semibold">Product Code</strong> and paste it into the box above</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ---------- TERMS & CONDITIONS ---------- */}
        <div className="relative max-w-5xl mx-auto bg-white border border-black/5 p-8 lg:p-12">
          <CornerBrackets />
          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#F97316]">Fine Print</span>
            <h2 className="text-3xl font-black uppercase tracking-tight mt-2">
              Terms &amp; Conditions
            </h2>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 text-[#3A3D42] leading-relaxed">
            {terms.map((term, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-[#F97316] font-mono text-sm shrink-0 pt-0.5">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>

      </section>
    </div>
  )
}

export default PriceBeatPromise