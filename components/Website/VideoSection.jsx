"use client"

import React, { useRef, useState } from "react"
import {
  Play,
  Pause,
  ArrowUpRight,
  PhoneCall,
  PhoneOutgoing,
  ShieldCheck,
  Star,
  Check,
  Home,
  Building2,
  Hammer,
  PencilRuler,
  Sun,
  Sunset,
  Moon,
} from "lucide-react"
import { VIDEOS } from "@/routes/Videos"

// TODO: put the real business number here
const CALL_NUMBER = "+910000000000"

const SERVICES = [
  { id: "home", label: "New Home", icon: Home },
  { id: "commercial", label: "Commercial", icon: Building2 },
  { id: "renovation", label: "Renovation", icon: Hammer },
  { id: "design", label: "Design", icon: PencilRuler },
]

const SLOTS = [
  { id: "morning", label: "Morning", icon: Sun },
  { id: "afternoon", label: "Afternoon", icon: Sunset },
  { id: "evening", label: "Evening", icon: Moon },
]

const STATS = [
  { value: "15+", label: "Years" },
  { value: "500+", label: "Projects" },
  { value: "98%", label: "Happy Clients" },
  { value: "24/7", label: "Support" },
]

/**
 * Optional prop `onCallbackRequest({ phone, service, slot })` should send the
 * lead to your backend (API / WhatsApp / CRM) and return a Promise.
 */
const ConstructionHero = ({ onCallbackRequest }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)

  const [service, setService] = useState("home")
  const [slot, setSlot] = useState("morning")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const toggleVideo = () => {
    if (!videoRef.current) return
    if (isPlaying) videoRef.current.pause()
    else videoRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const handlePhone = (e) => {
    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
    setError("")
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number")
      return
    }
    try {
      setLoading(true)
      if (onCallbackRequest) {
        await onCallbackRequest({ phone: `+91${phone}`, service, slot })
      }
      setDone(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setDone(false)
    setPhone("")
  }

  return (
    <section className="relative isolate flex min-h-[720px] w-full flex-col overflow-hidden rounded-2xl bg-neutral-950 group">
      <style>{`
        @keyframes cUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:none } }
        @keyframes cZoom { from { transform:scale(1) } to { transform:scale(1.1) } }
        @keyframes cRing { 0% { transform:scale(.8); opacity:.8 } 100% { transform:scale(2.1); opacity:0 } }
        @keyframes cWiggle { 0%,100% { transform:rotate(0) } 10%,30%,50% { transform:rotate(-14deg) } 20%,40% { transform:rotate(14deg) } 60% { transform:rotate(0) } }
        @keyframes cDot { 0%,100% { opacity:1 } 50% { opacity:.3 } }
        @keyframes cMarq { to { transform:translateX(-50%) } }
        @keyframes cPop { 0% { transform:scale(.4); opacity:0 } 70% { transform:scale(1.15) } 100% { transform:scale(1); opacity:1 } }
        .c-up    { animation:cUp .9s cubic-bezier(.22,1,.36,1) both }
        .c-zoom  { animation:cZoom 22s ease-in-out infinite alternate }
        .c-ring  { animation:cRing 2s ease-out infinite }
        .c-wig   { animation:cWiggle 3s ease-in-out infinite }
        .c-dot   { animation:cDot 1.4s ease-in-out infinite }
        .c-marq  { animation:cMarq 28s linear infinite }
        .c-pop   { animation:cPop .5s cubic-bezier(.22,1,.36,1) both }
        .c-stroke{ -webkit-text-stroke:2px #facc15; color:transparent }
        @media (max-width:640px){ .c-stroke{ -webkit-text-stroke:1.5px #facc15 } }
        @media (prefers-reduced-motion:reduce){
          .c-up,.c-zoom,.c-ring,.c-wig,.c-dot,.c-marq,.c-pop{ animation:none!important }
        }
      `}</style>

      {/* Background video */}
      <video
        ref={videoRef}
        className="c-zoom absolute inset-0 h-full w-full object-cover"
        src={VIDEOS.video}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-black/40" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-yellow-500/25 blur-3xl" />

      {/* Play / pause */}
      <button
        onClick={toggleVideo}
        aria-label={isPlaying ? "Pause background video" : "Play background video"}
        className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-all duration-300 hover:bg-yellow-400 sm:right-5 sm:top-5 sm:scale-90 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      {/* Main row */}
      <div className="relative z-10 flex flex-1 flex-col justify-center gap-10 px-5 pb-8 pt-16 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:pt-10">
        {/* LEFT */}
        <div className="max-w-2xl text-white">
          <div
            className="c-up inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300 backdrop-blur-md sm:text-xs"
            style={{ animationDelay: ".05s" }}
          >
            <span className="c-dot h-2 w-2 rounded-full bg-green-400" />
            Engineers available now
          </div>

          <h1
            className="c-up mt-5 text-[2.7rem] font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: ".18s" }}
          >
            Let&apos;s Build
            <span className="mt-1 block">
              Your <span className="c-stroke">Dream</span>
            </span>
            <span className="block bg-linear-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Home Together.
            </span>
          </h1>

          <p
            className="c-up mt-6 max-w-lg text-sm leading-relaxed text-gray-200 sm:text-lg"
            style={{ animationDelay: ".32s" }}
          >
            Tell us what you want to build. An expert calls you back, listens,
            and shares a clear plan and estimate. No pressure, no hidden costs.
          </p>

          <div
            className="c-up mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
            style={{ animationDelay: ".46s" }}
          >
            <a
              href="#services"
              className="group/btn inline-flex cursor-pointer items-center gap-2 rounded-full bg-yellow-400 px-7 py-3.5 font-bold text-black shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              Our Services
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-yellow-400 transition-transform duration-300 group-hover/btn:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </a>
            <a
              href="#shop"
              className="cursor-pointer rounded-full border border-white/70 px-7 py-3.5 font-semibold backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black"
            >
              Shop Now
            </a>
          </div>

          {/* Direct call */}
          <a
            href={`tel:${CALL_NUMBER}`}
            className="c-up mt-7 inline-flex items-center gap-3 text-white"
            style={{ animationDelay: ".58s" }}
          >
            <span className="relative flex h-12 w-12 items-center justify-center">
              <span className="c-ring absolute inset-0 rounded-full bg-yellow-400/60" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black">
                <PhoneCall size={20} className="c-wig" />
              </span>
            </span>
            <span className="text-left leading-tight">
              <span className="block text-xs text-gray-300">Prefer to talk now?</span>
              <span className="block text-lg font-bold">Call us directly</span>
            </span>
          </a>
        </div>

        {/* RIGHT: callback card */}
        <div
          className="c-up relative w-full shrink-0 lg:w-[390px]"
          style={{ animationDelay: ".7s" }}
        >
          <div className="rounded-2xl bg-white p-5 text-neutral-900 shadow-2xl shadow-black/40 sm:p-6">
            {done ? (
              <div className="py-6 text-center">
                <div className="c-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h3 className="mt-4 text-xl font-extrabold">Request received!</h3>
                <p className="mx-auto mt-2 max-w-[260px] text-sm text-neutral-600">
                  Our expert will call{" "}
                  <span className="font-semibold text-neutral-900">+91 {phone}</span>{" "}
                  in your{" "}
                  <span className="font-semibold text-neutral-900">
                    {SLOTS.find((s) => s.id === slot)?.label.toLowerCase()}
                  </span>{" "}
                  slot.
                </p>
                <button
                  onClick={reset}
                  className="mt-5 cursor-pointer rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold transition-colors hover:bg-neutral-100"
                >
                  Request another call
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                      <span className="ml-1.5 text-xs font-semibold text-neutral-700">
                        4.9 rated
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-xl font-extrabold sm:text-2xl">
                      Get a Free Call Back
                    </h3>
                    <p className="mt-0.5 text-sm text-neutral-600">
                      Free estimate. We call you in 30 minutes.
                    </p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black">
                    <PhoneOutgoing size={20} />
                  </span>
                </div>

                {/* Service */}
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  I need
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SERVICES.map(({ id, label, icon: Icon }) => {
                    const active = service === id
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => setService(id)}
                        aria-pressed={active}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                          active
                            ? "border-yellow-400 bg-yellow-400 text-black shadow-md shadow-yellow-400/40"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-yellow-400"
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    )
                  })}
                </div>

                {/* Time slot */}
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Best time to call
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {SLOTS.map(({ id, label, icon: Icon }) => {
                    const active = slot === id
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => setSlot(id)}
                        aria-pressed={active}
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border py-2.5 text-xs font-semibold transition-all duration-200 ${
                          active
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-900"
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    )
                  })}
                </div>

                {/* Phone */}
                <div
                  className={`mt-4 flex items-center overflow-hidden rounded-full border bg-neutral-50 transition-colors focus-within:border-neutral-900 ${
                    error ? "border-red-500" : "border-neutral-300"
                  }`}
                >
                  <span className="border-r border-neutral-300 px-4 py-3 text-sm font-bold text-neutral-700">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={handlePhone}
                    placeholder="Mobile number"
                    aria-invalid={!!error}
                    className="w-full bg-transparent px-4 py-3 text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
                  />
                </div>
                {error && (
                  <p role="alert" className="mt-1.5 px-2 text-xs font-medium text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-black hover:shadow-lg disabled:opacity-60"
                >
                  <PhoneCall size={16} className="text-yellow-400" />
                  {loading ? "Sending..." : "Request Call Back"}
                </button>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
                  <ShieldCheck size={13} className="text-green-600" />
                  Your number is safe. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 px-4 pb-3 sm:px-12">
        <div
          className="c-up grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 backdrop-blur-xl sm:grid-cols-4"
          style={{ animationDelay: ".85s" }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="bg-black/40 px-4 py-4 text-center text-white">
              <p className="text-2xl font-extrabold text-yellow-400 sm:text-3xl">{s.value}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-gray-200 sm:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Services ticker */}
      <div className="relative z-10 overflow-hidden border-t border-white/15 bg-yellow-400 py-2.5 text-black">
        <div className="c-marq flex w-max gap-10 whitespace-nowrap text-xs font-extrabold uppercase tracking-[0.2em] sm:text-sm">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10">
              {[
                "Residential Construction",
                "Commercial Buildings",
                "Interior Design",
                "Renovation",
                "Architecture Planning",
                "Project Management",
              ].map((t) => (
                <span key={t + k} className="flex items-center gap-10">
                  {t}
                  <span className="h-1.5 w-1.5 rounded-full bg-black" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ConstructionHero