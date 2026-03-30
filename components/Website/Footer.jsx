"use client"

import { useState } from "react"
import { WEBSITE_ABOUT, WEBSITE_CAREERS, WEBSITE_CONTACT_US, WEBSITE_COOKIE_POLICY, WEBSITE_DELIVERY_RETURNS, WEBSITE_DISCOUNT_CODES, WEBSITE_GIFT_VOUCHERS, WEBSITE_ORDER_TRACKING, WEBSITE_PRICE_BEAT_PROMISE, WEBSITE_PRIVACY_POLICY, WEBSITE_RUNNING_CLUB, WEBSITE_STUDENT_DISCOUNT, WEBSITE_TERMS_CONDITIONS, } from "@/routes/WebsiteRoute"
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
    <footer className="bg-gray-800 text-gray-200">

      {/* ================= NEWSLETTER ================= */}
      <div className="border-b bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* LEFT */}
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-400">
              Newsletter
            </h3>
            <p className="mt-2 text-3xl sm:text-4xl font-bold text-white">
              Sign up for our newsletter
            </p>
            <p className="mt-4 text-gray-100 max-w-md">
              Get exclusive updates, early access to offers, and the latest releases
              delivered straight to your inbox.
            </p>
          </div>

          {/* RIGHT */}
          <div>
            {success ? (
              // ── Success state ──
              <div className="flex items-center gap-3 bg-green-800/40 border border-green-600 rounded-xl px-5 py-4">
                <CheckCircle2 className="text-green-400 shrink-0" size={24} />
                <p className="text-green-300 font-medium">
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
                    border border-gray-600
                    rounded-xl
                    text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-white
                    disabled:opacity-50
                  "
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    px-6 py-3
                    bg-white text-gray-900
                    rounded-xl font-semibold
                    hover:bg-orange-500 hover:text-white
                    transition cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 min-w-[120px]
                  "
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /> Subscribing...</>
                    : "Subscribe"
                  }
                </button>
              </form>
            )}

            {/* Error message */}
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}

            <p className="mt-4 text-xs text-gray-400 leading-relaxed">
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
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-18 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-sm">

        <ul className="space-y-8">
          <div>
            <li
              onClick={openChat}
              className="flex text-lg items-center gap-2 cursor-pointer hover:text-orange-500"
            >
              <MessageCircle size={20} /> Chat
            </li>
          </div>

          <li className="flex items-center gap-2 text-lg hover:text-green-500 cursor-pointer">
            <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <BsWhatsapp size={20} /> WhatsApp
            </a>
          </li>

          <li>
            <Link href={WEBSITE_CONTACT_US} className="flex items-center gap-2 text-lg hover:text-white cursor-pointer">
              <Headphones size={20} /> Contact Us
            </Link>
          </li>

          <li className="flex text-lg items-center gap-2">
            <Info size={20} /> Help Code: 743163
          </li>
        </ul>

        <ul className="space-y-4">
          <li className="flex items-center text-lg gap-2 hover:text-red-500 cursor-pointer">
            <a href="https://www.youtube.com/channel/YourChannelID" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Youtube size={20} /> YouTube
            </a>
          </li>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-2 text-lg hover:text-pink-500 cursor-pointer">
              <a href="https://www.instagram.com/YourInstagramProfile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Instagram size={20} /> Instagram
              </a>
            </li>
            <li className="flex items-center text-lg gap-2 hover:text-blue-500 cursor-pointer">
              <a href="https://twitter.com/YourTwitterProfile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Twitter size={20} /> X
              </a>
            </li>
            <li className="flex text-lg items-center gap-2 hover:text-blue-700 cursor-pointer">
              <a href="https://www.facebook.com/YourFacebookProfile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Facebook size={20} /> Facebook
              </a>
            </li>
          </ul>
        </ul>

        {/* ORDER INFO */}
        <div>
          <h4 className="text-2xl font-bold mb-4 text-white">Order Info</h4>
          <ul className="space-y-4">
            <li><Link href={WEBSITE_ORDER_TRACKING} className="text-lg text-white hover:underline transition-all duration-300">Order Tracking</Link></li>
            <li><Link href={WEBSITE_DELIVERY_RETURNS} className="text-lg text-white hover:underline transition-all duration-300">Delivery & Returns</Link></li>
            <li><Link href={WEBSITE_GIFT_VOUCHERS} className="text-lg text-white hover:underline transition-all duration-300">Gift Vouchers</Link></li>
            <li><Link href={WEBSITE_RUNNING_CLUB} className="text-lg text-white hover:underline transition-all duration-300">SportShoes Running Club</Link></li>
            <li><Link href={WEBSITE_STUDENT_DISCOUNT} className="text-lg text-white hover:underline transition-all duration-300">Student Discount</Link></li>
          </ul>
        </div>

        {/* CUSTOMER CARE */}
        <div>
          <h4 className="text-2xl font-bold mb-4 text-white">Customer Care</h4>
          <ul className="space-y-4">
            <li><Link href={WEBSITE_CONTACT_US} className="text-lg text-white hover:underline transition-all duration-300">Contact Us</Link></li>
            <li><Link href={WEBSITE_PRICE_BEAT_PROMISE} className="text-lg text-white hover:underline transition-all duration-300">Price Beat Promise</Link></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h4 className="text-2xl font-bold mb-4 text-white">Company</h4>
          <ul className="space-y-4">
            <li><Link href={WEBSITE_ABOUT} className="text-lg text-white hover:underline transition-all duration-300">About Us</Link></li>
            <li><Link href={WEBSITE_CAREERS} className="text-lg text-white hover:underline transition-all duration-300">Careers</Link></li>
            <li><Link href={WEBSITE_PRIVACY_POLICY} className="text-lg text-white hover:underline transition-all duration-300">Privacy Policy</Link></li>
            <li><Link href={WEBSITE_TERMS_CONDITIONS} className="text-lg text-white hover:underline transition-all duration-300">Terms & Conditions</Link></li>
            <li><Link href={WEBSITE_COOKIE_POLICY} className="text-lg text-white hover:underline transition-all duration-300">Cookie Policy</Link></li>
            <li><Link href={WEBSITE_DISCOUNT_CODES} className="text-lg text-white hover:underline transition-all duration-300">Discount Codes</Link></li>
          </ul>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span>English</span>
            <button className="underline text-sm">Change</button>
          </div>
          <div className="flex gap-5">
            <a href="https://www.youtube.com/@allspikes" target="_blank" rel="noopener noreferrer"><Youtube className="hover:opacity-70 cursor-pointer" /></a>
            <a href="https://www.instagram.com/allspikes" target="_blank" rel="noopener noreferrer"><Instagram className="hover:opacity-70 cursor-pointer" /></a>
            <a href="https://twitter.com/allspikes" target="_blank" rel="noopener noreferrer"><Twitter className="hover:opacity-70 cursor-pointer" /></a>
            <a href="https://www.facebook.com/allspikes" target="_blank" rel="noopener noreferrer"><Facebook className="hover:opacity-70 cursor-pointer" /></a>
          </div>
        </div>
        <div className="bg-gray-900 text-center py-4 text-lg text-gray-400">
          © 2026 All Spikes Limited | All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer