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
  Clock,
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
    <section className="group relative isolate flex min-h-[480px] w-full flex-col overflow-hidden rounded-3xl bg-black">
      <style>{`
        @keyframes hUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:none } }
        @keyframes hZoom { from { transform:scale(1) } to { transform:scale(1.1) } }
        @keyframes hRing { 0% { transform:scale(.8); opacity:.8 } 100% { transform:scale(2.2); opacity:0 } }
        @keyframes hWiggle { 0%,100% { transform:rotate(0) } 10%,30%,50% { transform:rotate(-14deg) } 20%,40% { transform:rotate(14deg) } 60% { transform:rotate(0) } }
        @keyframes hDot { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:.35; transform:scale(.8) } }
        @keyframes hPop { 0% { transform:scale(.4); opacity:0 } 70% { transform:scale(1.15) } 100% { transform:scale(1); opacity:1 } }
        @keyframes hSweep { from { transform:scaleX(0) } to { transform:scaleX(1) } }
        .h-up    { animation:hUp .9s cubic-bezier(.22,1,.36,1) both }
        .h-zoom  { animation:hZoom 24s ease-in-out infinite alternate }
        .h-ring  { animation:hRing 2s ease-out infinite }
        .h-wig   { animation:hWiggle 3s ease-in-out infinite }
        .h-dot   { animation:hDot 1.4s ease-in-out infinite }
        .h-pop   { animation:hPop .5s cubic-bezier(.22,1,.36,1) both }
        .h-sweep { transform-origin:left; animation:hSweep 1s .9s cubic-bezier(.22,1,.36,1) both }
        .h-stroke{ -webkit-text-stroke:2px #fff; color:transparent }
        .h-grid  {
          background-image:
            linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size:64px 64px;
          mask-image:linear-gradient(to bottom, black 0%, transparent 85%);
          -webkit-mask-image:linear-gradient(to bottom, black 0%, transparent 85%);
        }
        @media (max-width:640px){ .h-stroke{ -webkit-text-stroke:1.5px #fff } }
        @media (prefers-reduced-motion:reduce){
          .h-up,.h-zoom,.h-ring,.h-wig,.h-dot,.h-pop,.h-sweep{ animation:none!important }
        }
      `}</style>

      {/* Background video */}
      <video
        ref={videoRef}
        className="h-zoom absolute inset-0 h-full w-full object-cover"
        src={VIDEOS.video}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlays: black fade + blueprint grid + orange glow */}
      <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-black/50" />
      <div className="h-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-orange-600/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-orange-500/20 blur-[120px]" />

      {/* Orange top edge */}
      <div className="h-sweep absolute left-0 top-0 z-20 h-1.5 w-full bg-linear-to-r from-orange-600 via-orange-500 to-orange-400" />

      {/* Play / pause */}
      <button
        onClick={toggleVideo}
        aria-label={isPlaying ? "Pause background video" : "Play background video"}
        className="absolute right-4 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all duration-300 hover:bg-orange-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 sm:right-6 sm:top-6 sm:scale-90 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100 sm:focus-visible:scale-100 sm:focus-visible:opacity-100"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      {/* Main row */}
       <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 px-5 pb-8 pt-12 sm:px-10 sm:py-8 lg:flex-row lg:items-center lg:justify-between">        {/* LEFT */}
        <div className="max-w-2xl text-white">
          <div
            className="h-up inline-flex items-center gap-2.5 rounded-full border border-orange-500/50 bg-black/50 py-1.5 pl-3 pr-4 text-xs font-semibold text-orange-300 backdrop-blur-md sm:text-sm"
            style={{ animationDelay: ".05s" }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="h-ring absolute inset-0 rounded-full bg-orange-500" />
              <span className="h-dot relative h-2.5 w-2.5 rounded-full bg-orange-500" />
            </span>
            Engineers available now
          </div>

          <h1
            className="h-up mt-6 text-[2.8rem] font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: ".18s" }}
          >
            Let&apos;s Build
            <span className="mt-1 block">
              Your <span className="h-stroke">Dream</span>
            </span>
            <span className="mt-3 inline-block -skew-x-6 bg-orange-500 px-4 py-1 text-black shadow-[8px_8px_0_0_rgba(255,255,255,0.9)]">
              <span className="block skew-x-6">Home Together.</span>
            </span>
          </h1>

          <p
            className="h-up mt-8 max-w-lg border-l-4 border-orange-500 pl-4 text-sm leading-relaxed text-gray-200 sm:text-lg"
            style={{ animationDelay: ".32s" }}
          >
            Tell us what you want to build. An expert calls you back, listens,
            and shares a clear plan and estimate. No pressure, no hidden costs.
          </p>

          <div
            className="h-up mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
            style={{ animationDelay: ".46s" }}
          >
            <a
              href="#services"
              className="group/btn inline-flex cursor-pointer items-center gap-3 rounded-full bg-orange-500 py-2 pl-7 pr-2 font-bold text-white shadow-xl shadow-orange-600/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Our Services
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover/btn:rotate-45">
                <ArrowUpRight size={18} />
              </span>
            </a>
            <a
              href="#shop"
              className="cursor-pointer rounded-full border-2 border-white px-7 py-3.5 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
            >
              Shop Now
            </a>
          </div>

          {/* Direct call */}
          <a
            href={`tel:${CALL_NUMBER}`}
            className="h-up mt-8 inline-flex items-center gap-4 rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400"
            style={{ animationDelay: ".58s" }}
          >
            <span className="relative flex h-14 w-14 items-center justify-center">
              <span className="h-ring absolute inset-0 rounded-full bg-orange-500/60" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-orange-600 ring-4 ring-orange-500/40">
                <PhoneCall size={22} className="h-wig" />
              </span>
            </span>
            <span className="text-left leading-tight">
              <span className="block text-xs text-gray-300">Prefer to talk now?</span>
              <span className="block text-xl font-extrabold">Call us directly</span>
            </span>
          </a>
        </div>

        {/* RIGHT: callback card */}
        <div
          className="h-up relative w-full shrink-0 lg:w-[410px]"
          style={{ animationDelay: ".7s" }}
        >
          {/* Offset orange plate behind the card */}
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-orange-500 sm:translate-x-4 sm:translate-y-4"
          />

          <div className="relative overflow-hidden rounded-3xl bg-white p-5 text-neutral-900 shadow-2xl shadow-black/50 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-black" />

            {done ? (
              <div className="py-8 text-center">
                <div className="h-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white ring-8 ring-orange-100">
                  <Check size={38} strokeWidth={3} />
                </div>
                <h3 className="mt-5 text-2xl font-extrabold">Request received!</h3>
                <p className="mx-auto mt-2 max-w-[270px] text-sm text-neutral-600">
                  Our expert will call{" "}
                  <span className="font-bold text-neutral-900">+91 {phone}</span> in your{" "}
                  <span className="font-bold text-orange-600">
                    {SLOTS.find((s) => s.id === slot)?.label.toLowerCase()}
                  </span>{" "}
                  slot.
                </p>
                <button
                  onClick={reset}
                  className="mt-6 cursor-pointer rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  Request another call
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <div className="flex items-center gap-1 text-orange-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                      <span className="ml-1.5 text-xs font-bold text-neutral-700">
                        4.9 rated
                      </span>
                    </div>
                    <h3 className="mt-2 text-2xl font-black leading-tight sm:text-[1.7rem]">
                      Get a Free Call Back
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600">
                      <Clock size={14} className="text-orange-500" />
                      Free estimate. We call in 30 minutes.
                    </p>
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/40">
                    <PhoneOutgoing size={22} />
                  </span>
                </div>

                {/* Service */}
                <p className="mt-6 text-sm font-bold text-neutral-900">I need</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SERVICES.map(({ id, label, icon: Icon }) => {
                    const active = service === id
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => setService(id)}
                        aria-pressed={active}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3.5 py-2.5 text-sm font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                          active
                            ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/40"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-orange-500 hover:text-orange-600"
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    )
                  })}
                </div>

                {/* Time slot */}
                <p className="mt-5 text-sm font-bold text-neutral-900">Best time to call</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {SLOTS.map(({ id, label, icon: Icon }) => {
                    const active = slot === id
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => setSlot(id)}
                        aria-pressed={active}
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-xs font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                          active
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-black"
                        }`}
                      >
                        <Icon size={17} className={active ? "text-orange-400" : ""} />
                        {label}
                      </button>
                    )
                  })}
                </div>

                {/* Phone */}
                <div
                  className={`mt-5 flex items-center overflow-hidden rounded-xl border-2 bg-white transition-colors focus-within:border-orange-500 ${
                    error ? "border-red-500" : "border-neutral-300"
                  }`}
                >
                  <span className="self-stretch bg-black px-4 py-3 text-sm font-bold text-white">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={handlePhone}
                    placeholder="Mobile number"
                    aria-label="Mobile number"
                    aria-invalid={!!error}
                    className="w-full bg-transparent px-4 py-3 text-base font-semibold text-neutral-900 outline-none placeholder:font-medium placeholder:text-neutral-400"
                  />
                </div>
                {error && (
                  <p role="alert" className="mt-1.5 px-1 text-xs font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group/sub mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-linear-to-r from-orange-600 to-orange-500 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-black hover:to-black hover:shadow-xl disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  <PhoneCall size={17} />
                  {loading ? "Sending..." : "Request Call Back"}
                </button>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
                  <ShieldCheck size={14} className="text-orange-500" />
                  Your number is safe. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom orange edge */}
      <div className="relative z-10 h-1.5 w-full bg-linear-to-r from-orange-400 via-orange-500 to-orange-600" />
    </section>
  )
}

export default ConstructionHero