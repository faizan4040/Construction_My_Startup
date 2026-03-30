'use client'

import React from 'react'
import { Phone, CheckCircle, Search } from 'lucide-react'

const PriceBeatPromise = () => {
  return (
    <div className="w-full">

      {/* ---------- HERO / BANNER ---------- */}
      <section className="bg-black text-white py-20 text-center px-4">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">
          OUR PRICE BEAT COMMITMENT
        </h1>
        <p className="max-w-3xl mx-auto text-lg lg:text-xl">
          We'll beat your price by <strong>£1.00</strong> and give you
          <strong> FREE UK Standard delivery</strong> on your order!
        </p>
      </section>

      {/* ---------- MAIN CONTENT ---------- */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-16">

        {/* ---------- INTRO ---------- */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-gray-700 text-lg">
            We're absolutely committed to being the cheapest store on the web.
            If you find any price cheaper, call our price beat team now or submit
            your details and we’ll call you back as soon as possible.
          </p>

          <div className="flex justify-center items-center gap-2 text-lg font-semibold">
            <Phone size={20} />
            <span>01274 530530</span>
          </div>
        </div>

        {/* ---------- BENEFITS ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            'We’ll beat your price by £1.00',
            'Free UK Standard delivery worth £4.99',
            'Trusted, reliable company since 1982',
            'Multi-award winning retailer with expert advice',
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white border rounded-xl p-6 shadow-sm flex gap-3"
            >
              <CheckCircle className="text-green-600 mt-1" />
              <p className="text-gray-700">{item}</p>
            </div>
          ))}
        </div>

        {/* ---------- PRODUCT LOOK UP ---------- */}
        <div className="bg-gray-100 rounded-2xl p-10 space-y-8">
          <h2 className="text-3xl font-bold text-center">
            PRODUCT LOOK UP
          </h2>

          {/* SKU INPUT */}
          <div className="max-w-md mx-auto">
            <label className="block font-semibold mb-2">
              Finding Your Product SKU
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Product Code (e.g. ADI199)"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              />
              <button className="bg-black text-white px-4 rounded-lg hover:bg-gray-800 transition">
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* HOW TO FIND SKU */}
          <div className="max-w-3xl mx-auto text-gray-700 space-y-3">
            <h3 className="font-semibold text-xl">
              Find your product SKU
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Go to the product page on the allspikes.com website
              </li>
              <li>
                <strong>Desktop:</strong> Right-hand side below the “Add to Bag” button
              </li>
              <li>
                <strong>Mobile:</strong> Below the “Add to Bag” button
              </li>
              <li>
                Copy the <strong>Product Code</strong> and paste it into the box above
              </li>
            </ul>
          </div>
        </div>

        {/* ---------- TERMS & CONDITIONS ---------- */}
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center">
            Terms & Conditions
          </h2>

          <ul className="list-disc list-inside text-gray-700 space-y-3 leading-relaxed">
            <li>This offer applies only to prices on our website or catalogue.</li>
            <li>Does not apply to graded goods, clearance, discontinued or specially discounted items.</li>
            <li>Proof of offer may be required and items must be in stock at the competing retailer.</li>
            <li>Price promise does not apply after a sale has been confirmed.</li>
            <li>Prices must be advertised at the time of checking.</li>
            <li>Only valid against UK websites and retailers.</li>
            <li>Valid for credit card transactions only.</li>
            <li>Price match quotations are valid for 48 hours.</li>
            <li>Cannot be combined with any other promotions.</li>
            <li>Does not apply to gym equipment.</li>
            <li>Item value must be over £10.00.</li>
            <li>Items must be the same model, colour, size and width fitting.</li>
            <li>UK residents and delivery addresses only.</li>
            <li>Bulk purchases are excluded.</li>
          </ul>
        </div>

      </section>
    </div>
  )
}

export default PriceBeatPromise
