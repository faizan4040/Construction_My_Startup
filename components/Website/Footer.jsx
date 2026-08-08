"use client"

import { useState } from "react"
import { WEBSITE_ABOUT, WEBSITE_CAREERS, WEBSITE_CONSTRUCTION_CLUB, WEBSITE_CONTACT_US, 
         WEBSITE_COOKIE_POLICY, WEBSITE_DELIVERY_RETURNS, WEBSITE_DISCOUNT_CODES,
        WEBSITE_GIFT_VOUCHERS, WEBSITE_HOME_DISCOUNT, WEBSITE_ORDER_TRACKING, WEBSITE_PRICE_BEAT_PROMISE,
        WEBSITE_PRIVACY_POLICY, WEBSITE_TERMS_CONDITIONS, } from "@/routes/WebsiteRoute"
import {
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Headphones,
  Info,
  Globe,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  HardHat,
} from "lucide-react"
import Link from "next/link"
import { BsWhatsapp } from "react-icons/bs"
import { useChat } from "../Chat/ChatProvider"
import axios from "axios"

const Footer = () => {

  const { openChat } = useChat()

  // ── Newsletter state ──────────────────────────────
  const [email, setEmail]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState("")

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setError("")

    // basic client-side validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    try {
      setLoading(true)
      const { data } = await axios.post("/api/newsletter/subscribe", { email })

      if (!data.success) throw new Error(data.message)

      setSuccess(true)
      setEmail("")
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="relative bg-[#14161A] text-[#C9CCD1]">

      {/* ================= HAZARD STRIPE TOP BORDER ================= */}
      <div
        className="h-2 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #F97316 0 18px, #14161A 18px 36px)",
        }}
      />

      {/* ================= NEWSLETTER ================= */}
      <div className="relative border-b border-white/10 bg-[#1B1E23]">
        {/* subtle blueprint grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#4A7A96 1px, transparent 1px), linear-gradient(90deg, #4A7A96 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 text-[#F97316] text-xs font-bold uppercase tracking-[0.25em]">
              <HardHat size={16} strokeWidth={2.5} />
              Site Bulletin
            </div>
            <p className="mt-3 text-3xl sm:text-[2.6rem] leading-[1.05] font-extrabold uppercase text-white tracking-tight">
              Get the build<br className="hidden sm:block" /> updates first
            </p>
            <p className="mt-4 text-[#9098A0] max-w-md">
              New arrivals, trade pricing, and early access to offers — dispatched
              straight to your inbox.
            </p>
          </div>

          {/* RIGHT */}
          <div className="relative border border-white/15 bg-[#14161A] p-6">
            {/* corner brackets, blueprint annotation style */}
            <span className="absolute -top-px -left-px h-4 w-4 border-t-2 border-l-2 border-[#F97316]" />
            <span className="absolute -top-px -right-px h-4 w-4 border-t-2 border-r-2 border-[#F97316]" />
            <span className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#F97316]" />
            <span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#F97316]" />

            {success ? (
              // ── Success state ──
              <div className="flex items-center gap-3 bg-[#2E4A34] border border-[#4CAF63]/40 rounded px-5 py-4">
                <CheckCircle2 className="text-[#7FD996] shrink-0" size={24} />
                <p className="text-[#B7EFC3] font-medium">
                  You're subscribed! Thanks for signing up.
                </p>
              </div>
            ) : (
              // ── Form ──
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("") // clear error on type
                  }}
                  placeholder="Your email address"
                  disabled={loading}
                  className="
                    flex-1 px-4 py-3
                    bg-transparent
                    border border-white/20
                    rounded-none
                    text-white placeholder-[#6C7278]
                    focus:outline-none focus:border-[#F97316]
                    disabled:opacity-50
                  "
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    px-6 py-3
                    bg-[#F97316] text-[#14161A]
                    rounded-none font-bold uppercase tracking-wide text-sm
                    hover:bg-white
                    transition cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 min-w-36
                  "
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /> Subscribing...</>
                    : <>Subscribe <ArrowUpRight size={16} /></>
                  }
                </button>
              </form>
            )}

            {/* Error message */}
            {error && (
              <p className="mt-2 text-sm text-[#FF8A65]">{error}</p>
            )}

            <p className="mt-4 text-xs text-[#6C7278] leading-relaxed">
              By signing up you consent to receive updates by email about our latest
              new releases and our best special offers. We will never share your
              personal information with third parties for their marketing purposes
              and you can unsubscribe at any time. For more information please see
              our privacy statement.
            </p>
          </div>
        </div>
      </div>

      {/* ================= LINKS ================= */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-sm">

        <ul className="space-y-6">
          <li
            onClick={openChat}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <span className="flex items-center justify-center h-9 w-9 border border-white/15 group-hover:border-[#F97316] group-hover:text-[#F97316] transition-colors">
              <MessageCircle size={18} />
            </span>
            <span className="text-base font-semibold text-white group-hover:text-[#F97316] transition-colors">Chat</span>
          </li>

          <li className="flex items-center gap-3 group">
            <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <span className="flex items-center justify-center h-9 w-9 border border-white/15 group-hover:border-[#25D366] group-hover:text-[#25D366] transition-colors">
                <BsWhatsapp size={16} />
              </span>
              <span className="text-base font-semibold text-white group-hover:text-[#25D366] transition-colors">WhatsApp</span>
            </a>
          </li>

          <li className="flex items-center gap-3 group">
            <Link href={WEBSITE_CONTACT_US} className="flex items-center gap-3">
              <span className="flex items-center justify-center h-9 w-9 border border-white/15 group-hover:border-[#F97316] group-hover:text-[#F97316] transition-colors">
                <Headphones size={18} />
              </span>
              <span className="text-base font-semibold text-white group-hover:text-[#F97316] transition-colors">Contact Us</span>
            </Link>
          </li>

          <li className="flex items-center gap-3 pt-2 text-[#6C7278]">
            <Info size={16} />
            <span className="text-xs uppercase tracking-wider">Help Code: <span className="text-[#9098A0]">743163</span></span>
          </li>
        </ul>

        <ul className="space-y-4">
          <li className="flex items-center gap-3 group">
            <a href="https://www.youtube.com/channel/YourChannelID" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <Youtube size={18} className="text-[#6C7278] group-hover:text-[#FF3B30] transition-colors" />
              <span className="text-base text-white group-hover:text-[#FF3B30] transition-colors">YouTube</span>
            </a>
          </li>
          <li className="flex items-center gap-3 group">
            <a href="https://www.instagram.com/YourInstagramProfile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <Instagram size={18} className="text-[#6C7278] group-hover:text-[#E1306C] transition-colors" />
              <span className="text-base text-white group-hover:text-[#E1306C] transition-colors">Instagram</span>
            </a>
          </li>
          <li className="flex items-center gap-3 group">
            <a href="https://twitter.com/YourTwitterProfile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <Twitter size={18} className="text-[#6C7278] group-hover:text-[#4A7A96] transition-colors" />
              <span className="text-base text-white group-hover:text-[#4A7A96] transition-colors">X</span>
            </a>
          </li>
          <li className="flex items-center gap-3 group">
            <a href="https://www.facebook.com/YourFacebookProfile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <Facebook size={18} className="text-[#6C7278] group-hover:text-[#1877F2] transition-colors" />
              <span className="text-base text-white group-hover:text-[#1877F2] transition-colors">Facebook</span>
            </a>
          </li>
        </ul>

        {/* ORDER INFO */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F97316] mb-5 pb-3 border-b border-white/10">Order Info</h4>
          <ul className="space-y-3.5">
            <li><Link href={WEBSITE_ORDER_TRACKING} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Order Tracking</Link></li>
            <li><Link href={WEBSITE_DELIVERY_RETURNS} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Delivery & Returns</Link></li>
            <li><Link href={WEBSITE_GIFT_VOUCHERS} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Gift Vouchers</Link></li>
            <li><Link href={WEBSITE_CONSTRUCTION_CLUB} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Construction Club</Link></li>
            <li><Link href={WEBSITE_HOME_DISCOUNT} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Home Discount</Link></li>
          </ul>
        </div>

        {/* CUSTOMER CARE */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F97316] mb-5 pb-3 border-b border-white/10">Customer Care</h4>
          <ul className="space-y-3.5">
            <li><Link href={WEBSITE_CONTACT_US} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Contact Us</Link></li>
            <li><Link href={WEBSITE_PRICE_BEAT_PROMISE} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Price Beat Promise</Link></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F97316] mb-5 pb-3 border-b border-white/10">Company</h4>
          <ul className="space-y-3.5">
            <li><Link href={WEBSITE_ABOUT} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">About Us</Link></li>
            <li><Link href={WEBSITE_CAREERS} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Careers</Link></li>
            <li><Link href={WEBSITE_PRIVACY_POLICY} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Privacy Policy</Link></li>
            <li><Link href={WEBSITE_TERMS_CONDITIONS} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Terms & Conditions</Link></li>
            <li><Link href={WEBSITE_COOKIE_POLICY} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Cookie Policy</Link></li>
            <li><Link href={WEBSITE_DISCOUNT_CODES} className="text-base text-[#C9CCD1] hover:text-white hover:pl-1 transition-all duration-200">Discount Codes</Link></li>
          </ul>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-[#9098A0]">
            <Globe size={16} />
            <span>English</span>
            <button className="underline text-sm hover:text-white transition-colors">Change</button>
          </div>
          <div className="flex gap-4">
            <a href="https://www.youtube.com/@constructezy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 border border-white/15 hover:border-[#F97316] hover:text-[#F97316] transition-colors"><Youtube size={16} /></a>
            <a href="https://www.instagram.com/constructezy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 border border-white/15 hover:border-[#F97316] hover:text-[#F97316] transition-colors"><Instagram size={16} /></a>
            <a href="https://twitter.com/constructezy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 border border-white/15 hover:border-[#F97316] hover:text-[#F97316] transition-colors"><Twitter size={16} /></a>
            <a href="https://www.facebook.com/constructezy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 border border-white/15 hover:border-[#F97316] hover:text-[#F97316] transition-colors"><Facebook size={16} /></a>
          </div>
        </div>
        <div className="bg-[#0F1114] text-center py-4 text-xs uppercase tracking-widest text-[#6C7278]">
          © 2026 Constructezy Limited — All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer





















