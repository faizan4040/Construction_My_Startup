'use client'

import { IMAGES } from '@/routes/AllImages'
import React from 'react'

const RunningClub = () => {
  return (
    <div className="w-full">

      {/* ===== Banner ===== */}
      <section className="relative h-[60vh] flex items-center justify-center text-center">
        {/* Background Image */}
        <img
          src={IMAGES.runningclub}
          alt="Running Club"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Banner Content */}
        <div className="relative z-10 text-white px-4">
          <p className="uppercase tracking-widest text-sm mb-3 flex items-center justify-center gap-3">
            <span>allspikes.com</span>
            <span className="h-4 w-px bg-white/70" />
            <span>Running Club</span>
          </p>

          <h1 className="text-4xl lg:text-5xl font-extrabold">
            Join the All Spikes Family
          </h1>
        </div>
      </section>

      {/* ===== Intro Heading ===== */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Your running club can join our All Spikes family to receive 15% off
          </h2>
        </div>
      </section>

      {/* ===== Form Section ===== */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

          <p className="text-gray-700 mb-8 text-center">
            At All Spikes we care about our running, fitness & triathlon community.
            We offer a special club discount for running & triathlon clubs in the UK,
            Germany, Spain, France and Italy. Get <strong>15% off</strong> in-season
            products for you and your members (exclusions apply).
            <br /><br />
            Please get in touch to join our family by filling in the form.
          </p>

          <h3 className="text-xl font-semibold text-center mb-6">
            Contact Us Now
          </h3>

          <form className="space-y-6">

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="* First Name"
                className="border border-gray-300 p-3 rounded-md w-full"
                required
              />
              <input
                type="text"
                placeholder="* Last Name"
                className="border border-gray-300 p-3 rounded-md w-full"
                required
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="* Email"
                className="border border-gray-300 p-3 rounded-md w-full"
                required
              />
              <input
                type="tel"
                placeholder="* Phone Number"
                className="border border-gray-300 p-3 rounded-md w-full"
                required
              />
            </div>

            {/* Club Info */}
            <input
              type="text"
              placeholder="* Club Name"
              className="border border-gray-300 p-3 rounded-md w-full"
              required
            />

            <input
              type="text"
              placeholder="Your Club's Web Address"
              className="border border-gray-300 p-3 rounded-md w-full"
            />

            <input
              type="text"
              placeholder="Link to your club's social profile"
              className="border border-gray-300 p-3 rounded-md w-full"
            />

            <input
              type="text"
              placeholder="Official contact at your club (name & email)"
              className="border border-gray-300 p-3 rounded-md w-full"
            />

            {/* How did you hear */}
            <select
              className="border border-gray-300 p-3 rounded-md w-full"
              required
            >
              <option value="">* How did you hear about us?</option>
              <option>Social Media</option>
              <option>Search Engine</option>
              <option>Friend / Club</option>
              <option>Event</option>
              <option>Other</option>
            </select>

            {/* Message */}
            <textarea
              placeholder="Message"
              rows="4"
              className="border border-gray-300 p-3 rounded-md w-full"
            />

            {/* Mandatory note */}
            <p className="text-sm text-gray-500">
              * is a mandatory field.
            </p>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-3 hover:bg-orange-500 bg-black text-white font-semibold rounded-lg hover:text-white cursor-pointer transition"
              >
                Send Message
              </button>
            </div>

          </form>
        </div>
      </section>
    </div>
  )
}

export default RunningClub
