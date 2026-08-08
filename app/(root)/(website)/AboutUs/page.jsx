'use client'

import { IMAGES } from '@/routes/AllImages'
import React from 'react'
import { ShieldCheck, Tag, Zap, ArrowUpRight } from 'lucide-react'

/* ── Signature motif: architectural dimension line ── */
const RulerLine = ({ label, dark = false }) => (
  <div className="flex items-center gap-3 px-6 lg:px-10">
    <span
      className="text-[10px] font-mono uppercase tracking-[0.3em] shrink-0"
      style={{ color: dark ? '#6C7278' : '#9098A0' }}
    >
      {label}
    </span>
    <span
      className="flex-1 h-px"
      style={{
        backgroundImage: `repeating-linear-gradient(90deg, ${
          dark ? '#3A3D42' : '#C9CCD1'
        } 0 6px, transparent 6px 12px)`,
      }}
    />
  </div>
)

/* ── Signature motif: scrolling hazard ticker ── */
const Ticker = () => {
  const items = [
    'VERIFIED PROFESSIONALS',
    'FAIR PRICING',
    'FAST RESPONSE',
    'TRUSTED SERVICE',
  ]
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
      <div className="marquee-track flex text-sm font-bold uppercase tracking-[0.2em]">
        <div className="flex shrink-0">{row}{row}</div>
        <div className="flex shrink-0" aria-hidden="true">{row}{row}</div>
      </div>
      <style>{`
        .marquee-track { animation: marquee-scroll 22s linear infinite; width: max-content; }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  )
}

/* ── Blueprint grid overlay ── */
const BlueprintGrid = ({ opacity = 0.05 }) => (
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

const AboutUs = () => {
  return (
    <div className="w-full bg-[#F5F3EF] text-[#14161A]">

      {/* ---------- HERO ---------- */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-[#0F1114]">
        <img
          src={IMAGES.aboutus}
          alt="About Constructezy"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1114] via-[#0F1114]/60 to-[#0F1114]/10" />
        <BlueprintGrid opacity={0.1} />

        <div className="relative h-full flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-14 w-full">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-2 w-2 bg-[#F97316] rounded-full" />
              <span className="text-xs font-mono uppercase tracking-[0.35em] text-[#F97316]">
                Est. Constructezy — Registry No. 001
              </span>
            </div>

            <h1 className="font-black uppercase leading-[0.9] tracking-tight text-white text-[15vw] sm:text-[10vw] lg:text-[6.5vw]">
              Built on trust.
              <br />
              <span className="text-[#F97316]">Wired</span> for reliability.
            </h1>

            <p className="mt-8 max-w-xl text-[#C9CCD1] text-lg">
              The platform that connects you to verified labor, plumbers, and
              home service professionals — without the guesswork.
            </p>
          </div>
        </div>
      </section>

      <Ticker />

      {/* ---------- MISSION ---------- */}
      <section className="relative py-24">
        <RulerLine label="Sec. 01 / Mission" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.03] tracking-tight">
              A modern platform connecting you with trusted labor,
              plumbers, and home service professionals.
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pt-4">
            <div className="border-l-2 border-[#F97316] pl-6">
              <p className="text-lg leading-relaxed text-[#3A3D42]">
                Our mission is to make it simple and affordable to hire
                skilled workers for construction, repairs, and daily home
                needs. We help customers find reliable professionals
                quickly while ensuring quality service and fair pricing.
              </p>
            </div>
          </div>
        </div>

        {/* ---------- VALUE PILLARS ---------- */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-20 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#14161A]/10">
          {[
            { icon: ShieldCheck, title: 'Verified professionals', desc: 'Every worker on the platform is checked before they reach your door.' },
            { icon: Tag, title: 'Fair pricing', desc: 'Transparent rates with no hidden call-out fees or surprise markups.' },
            { icon: Zap, title: 'Fast response', desc: 'Get matched with an available pro without the back-and-forth.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="bg-[#F5F3EF] p-8 flex flex-col gap-4">
              <Icon size={26} className="text-[#F97316]" strokeWidth={2} />
              <h3 className="text-lg font-extrabold uppercase tracking-tight">{title}</h3>
              <p className="text-[#6C7278] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- OUR HISTORY ---------- */}
      <section className="relative bg-white py-24 border-y border-black/5">
        <RulerLine label="Sec. 02 / Origin" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ---------- CARD 1 : WHO ARE WE ---------- */}
          <div className="relative bg-[#F5F3EF] flex flex-col group">
            <div className="relative overflow-hidden">
              <img
                src={IMAGES.Who_are_we}
                alt="Who are we"
                className="w-full h-72 object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700"
              />
              <div className="absolute top-4 left-4 bg-[#14161A] text-[#F97316] text-[10px] font-mono uppercase tracking-[0.25em] px-3 py-1.5">
                Identity
              </div>
            </div>

            <div className="p-8 border-t-2 border-[#F97316]">
              <h2 className="text-2xl font-extrabold mb-4 uppercase tracking-tight">Who are we?</h2>
              <p className="text-[#3A3D42] text-lg mb-4 leading-relaxed">
                Constructezy is a one-stop solution for all your construction
                and home service needs.
              </p>
              <p className="text-[#3A3D42] text-lg leading-relaxed">
                From skilled labor to plumbing and household support, we
                connect you with verified professionals who deliver reliable
                and efficient services at your convenience.
              </p>
            </div>
          </div>

          {/* ---------- CARD 2 : OUR HISTORY ---------- */}
          <div className="relative bg-[#F5F3EF] flex flex-col group">
            <div className="relative overflow-hidden">
              <img
                src={IMAGES.Our_history}
                alt="Our history"
                className="w-full h-72 object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700"
              />
              <div className="absolute top-4 left-4 bg-[#14161A] text-[#F97316] text-[10px] font-mono uppercase tracking-[0.25em] px-3 py-1.5">
                Timeline
              </div>
            </div>

            <div className="p-8 border-t-2 border-[#F97316]">
              <h2 className="text-2xl font-extrabold mb-4 uppercase tracking-tight">Our journey</h2>
              <p className="text-[#3A3D42] text-lg mb-4 leading-relaxed">
                Constructezy started with a simple goal — to solve the
                everyday problem of finding reliable workers.
              </p>
              <p className="text-[#3A3D42] text-lg leading-relaxed">
                We are building a platform where customers can easily hire
                trusted professionals without delays, confusion, or high
                costs.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ---------- EXPERTS BANNER ---------- */}
      <section className="relative bg-[#14161A] text-white py-28 overflow-hidden">
        <BlueprintGrid opacity={0.06} />
        <RulerLine label="Sec. 03 / Craft" dark />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-6 leading-[1.02]">
              Experts in
              <br />
              what we do
            </h2>
            <p className="text-lg leading-relaxed text-[#C9CCD1]">
              We work with experienced and verified professionals who
              specialize in construction, plumbing, and home services. Our
              focus is on delivering quality work, reliable service, and
              complete customer satisfaction every time.
            </p>
          </div>

          <div className="relative border border-white/15 p-3">
            <CornerBrackets />
            <img
              src={IMAGES.Repair_Maintenance}
              alt="Experts"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---------- PRODUCTS + TRUST ---------- */}
      <section className="relative bg-white py-24">
        <RulerLine label="Sec. 04 / Service" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ---------- CARD 1 : SERVICES ---------- */}
          <div className="relative bg-[#F5F3EF] flex flex-col group">
            <div className="relative overflow-hidden">
              <img
                src={IMAGES.product}
                alt="Services"
                className="w-full h-72 object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700"
              />
              <div className="absolute top-4 left-4 bg-[#14161A] text-[#F97316] text-[10px] font-mono uppercase tracking-[0.25em] px-3 py-1.5">
                One Platform
              </div>
            </div>

            <div className="p-8 border-t-2 border-[#F97316]">
              <h2 className="text-2xl font-extrabold mb-4 uppercase tracking-tight">All services in one place</h2>
              <p className="text-[#3A3D42] text-lg mb-4 leading-relaxed">
                From construction labor to plumbing and daily home services,
                we provide everything you need on a single platform.
              </p>
              <p className="text-[#3A3D42] text-lg leading-relaxed">
                Our goal is to save your time and effort by giving you quick
                access to the right professionals whenever you need them.
              </p>
            </div>
          </div>

          {/* ---------- CARD 2 : TRUST ---------- */}
          <div className="relative bg-[#F5F3EF] flex flex-col group">
            <div className="relative overflow-hidden">
              <img
                src={IMAGES.Repair_Maintenance}
                alt="Trust"
                className="w-full h-72 object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700"
              />
              <div className="absolute top-4 left-4 bg-[#14161A] text-[#F97316] text-[10px] font-mono uppercase tracking-[0.25em] px-3 py-1.5">
                Verified
              </div>
            </div>

            <div className="p-8 border-t-2 border-[#F97316]">
              <h2 className="text-2xl font-extrabold mb-4 uppercase tracking-tight">Trusted & Reliable</h2>
              <p className="text-[#3A3D42] text-lg mb-4 leading-relaxed">
                We focus on building trust by connecting customers with
                verified and skilled workers.
              </p>
              <p className="text-[#3A3D42] text-lg leading-relaxed">
                With affordable pricing, transparent service, and reliable
                professionals, we aim to make your experience smooth and
                hassle-free.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ---------- SUSTAINABILITY / CLOSING ---------- */}
      <section className="relative bg-[#0F1114] text-white py-28 overflow-hidden">
        <BlueprintGrid opacity={0.06} />
        <RulerLine label="Sec. 05 / Forward" dark />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-6 leading-[1.02]">
              Building a
              <br />
              better future
            </h2>
            <p className="text-lg leading-relaxed text-[#C9CCD1] mb-4">
              We believe in creating opportunities for skilled workers while
              making services accessible for everyone.
            </p>
            <p className="text-lg leading-relaxed text-[#C9CCD1] mb-8">
              Constructezy is committed to improving the way people connect
              with service providers — making it faster, easier, and more
              reliable.
            </p>

            <a
              href="#"
              className="inline-flex items-center gap-2 bg-[#F97316] text-[#14161A] font-bold uppercase tracking-wide text-sm px-6 py-3 hover:bg-white transition-colors"
            >
              Join the platform <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="relative border border-white/15 p-3">
            <CornerBrackets />
            <img
              src={IMAGES.laber}
              alt="Future"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      <Ticker />

    </div>
  )
}

export default AboutUs