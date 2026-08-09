'use client'

import { IMAGES } from '@/routes/AllImages'
import React from 'react'
import { Users, Send } from 'lucide-react'

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

const inputClass =
  "bg-[#F5F3EF] border border-black/10 p-3 w-full text-[#14161A] placeholder-[#9098A0] focus:outline-none focus:border-[#F97316] transition-colors"

const RunningClub = () => {
  return (
    <div className="w-full bg-[#F5F3EF] text-[#14161A]">

      {/* ===== Banner ===== */}
      <section className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden bg-[#0F1114]">
        {/* Background Image */}
        <img
          src={IMAGES.constructezy_family}
          alt="Running Club"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1114] via-[#0F1114]/50 to-[#0F1114]/20" />
        <BlueprintGrid />
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #F97316 0 14px, transparent 14px 28px)',
          }}
        />

        {/* Banner Content */}
        <div className="relative z-10 text-white px-4">
          <p className="uppercase tracking-[0.3em] text-xs font-mono mb-4 flex items-center justify-center gap-3 text-[#F97316]">
            <span>Constructezy.com</span>
            <span className="h-4 w-px bg-[#F97316]/50" />
            <span>Running Club</span>
          </p>

          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.05]">
            Join the Constructezy Family
          </h1>
        </div>
      </section>

      {/* ===== Intro Heading ===== */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-[#F97316] text-xs font-mono uppercase tracking-[0.3em] mb-5">
            <Users size={16} strokeWidth={2.5} />
            Club Partnership
          </div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-[1.15]">
            Your running club can join our Constructezy family to receive{' '}
            <span className="text-[#F97316]">15% off</span>
          </h2>
        </div>
      </section>

      {/* ===== Form Section ===== */}
      <section className="pb-24 px-4">
        <div className="relative max-w-3xl mx-auto bg-white border border-black/5 p-8 lg:p-12">
          <CornerBrackets />

          <p className="text-[#3A3D42] mb-10 text-center leading-relaxed">
            At ConstructEzy we care about our running, fitness &amp; triathlon community.
            We offer a special club discount for running &amp; triathlon clubs in the UK,
            Germany, Spain, France and Italy. Get <strong className="text-[#14161A] font-semibold">15% off</strong> in-season
            products for you and your members (exclusions apply).
            <br /><br />
            Please get in touch to join our family by filling in the form.
          </p>

          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#F97316]">Get In Touch</span>
            <h3 className="text-2xl font-extrabold tracking-tight mt-2">
              Contact Us Now
            </h3>
          </div>

          <form className="space-y-5">

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="* First Name"
                className={inputClass}
                required
              />
              <input
                type="text"
                placeholder="* Last Name"
                className={inputClass}
                required
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="* Email"
                className={inputClass}
                required
              />
              <input
                type="tel"
                placeholder="* Phone Number"
                className={inputClass}
                required
              />
            </div>

            {/* Club Info */}
            <input
              type="text"
              placeholder="* Club Name"
              className={inputClass}
              required
            />

            <input
              type="text"
              placeholder="Your Club's Web Address"
              className={inputClass}
            />

            <input
              type="text"
              placeholder="Link to your club's social profile"
              className={inputClass}
            />

            <input
              type="text"
              placeholder="Official contact at your club (name & email)"
              className={inputClass}
            />

            {/* How did you hear */}
            <select
              className={inputClass}
              required
              defaultValue=""
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
              className={inputClass}
            />

            {/* Mandatory note */}
            <p className="text-xs font-mono uppercase tracking-wider text-[#9098A0]">
              * is a mandatory field.
            </p>

            {/* Submit */}
            <div className="text-center pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#14161A] hover:bg-[#F97316] text-white font-bold uppercase tracking-wide text-sm cursor-pointer transition-colors"
              >
                Send Message <Send size={16} />
              </button>
            </div>

          </form>
        </div>
      </section>
    </div>
  )
}

export default RunningClub