"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import {
  RiUser3Line,
  RiStarLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiPhoneLine,
  RiVerifiedBadgeLine,
  RiArrowLeftLine,
  RiCalendarCheckLine,
  RiShieldCheckLine,
  RiToolsLine,
} from "react-icons/ri"

export default function LabourProfilePage() {
  const { slug } = useParams()
  const router = useRouter()
  const [labour, setLabour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [bookingDone, setBookingDone] = useState(false)
  const [bookingForm, setBookingForm] = useState({ description: "", date: "", phone: "" })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/labor/profile/${slug}`
        )
        setLabour(data?.data?.profile || data?.data)
      } catch {
        setLabour(null)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetch()
  }, [slug])

  const handleBook = async () => {
    if (!bookingForm.description || !bookingForm.date || !bookingForm.phone) {
      setError("Please fill all fields.")
      return
    }
    setBooking(true)
    setError("")
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/labor/book/${labour._id}`,
        bookingForm,
        { withCredentials: true }
      )
      setBookingDone(true)
      setShowForm(false)
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed. Please try again.")
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!labour) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
        <p className="text-white/40 text-lg">Profile not found.</p>
        <button onClick={() => router.back()} className="text-orange-500 text-sm hover:underline">← Go back</button>
      </div>
    )
  }

  const skills = typeof labour.skills === "string"
    ? labour.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : (labour.skills || [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20" style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}>

      {/* Back */}
      <div className="px-4 sm:px-8 pt-6 mb-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
          <RiArrowLeftLine /> Back to listings
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8">

        {/* Hero Card */}
        <div className="relative bg-gradient-to-br from-orange-500/15 via-white/3 to-transparent border border-white/10 rounded-3xl p-6 sm:p-10 overflow-hidden mb-6">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center relative z-10">
            {/* Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-orange-500/30 shadow-2xl shadow-orange-500/15">
                {labour.profileImage
                  ? <img src={labour.profileImage} alt={labour.firstName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <RiUser3Line className="text-5xl text-white/20" />
                    </div>}
              </div>
              {labour.topRated && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg">
                  TOP RATED
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {labour.firstName} {labour.lastName}
                </h1>
                {labour.verified && <RiVerifiedBadgeLine className="text-orange-500 text-xl" />}
              </div>
              <p className="text-orange-400 font-semibold mb-3">{labour.profession}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40">
                <span className="flex items-center gap-1.5">
                  <RiStarLine className="text-orange-500" />
                  <span className="text-white font-bold">{labour.rating || "4.8"}</span> rating
                </span>
                <span className="flex items-center gap-1.5">
                  <RiBriefcaseLine />
                  <span className="text-white font-bold">{labour.experienceYears}</span> yrs exp
                </span>
                <span className="flex items-center gap-1.5">
                  <RiMapPinLine />
                  {labour.city}, {labour.state}
                </span>
              </div>
            </div>

            {/* Price + Book */}
            <div className="flex-shrink-0 flex flex-col gap-3 items-start sm:items-end w-full sm:w-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <p className="text-white/40 text-xs uppercase tracking-widest">Hourly Rate</p>
                <p className="text-2xl font-extrabold text-orange-500 mt-0.5">₹{labour.hourlyRate}<span className="text-sm text-white/30 font-normal">/hr</span></p>
              </div>
              {bookingDone ? (
                <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 px-5 py-3 rounded-2xl text-sm font-semibold">
                  <RiCalendarCheckLine /> Booking Sent!
                </div>
              ) : (
                <button onClick={() => setShowForm(!showForm)}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center gap-2">
                  <RiCalendarCheckLine /> Book Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        {showForm && !bookingDone && (
          <div className="bg-white/5 border border-orange-500/20 rounded-3xl p-6 mb-6 animate-in slide-in-from-top-2">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <RiCalendarCheckLine className="text-orange-500" /> Book {labour.firstName}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-semibold">Your Phone *</label>
                <input type="tel" placeholder="+91 98765 43210"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-orange-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-semibold">Preferred Date *</label>
                <input type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm outline-none focus:border-orange-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-semibold">Work Description *</label>
                <textarea
                  placeholder="Describe the work you need done..."
                  rows={3}
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-orange-500/50 transition-all resize-none" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button onClick={handleBook} disabled={booking}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200
                  ${booking ? "bg-white/10 text-white/30" : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25"}`}>
                {booking ? "Sending booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">

          {/* About */}
          {labour.bio && (
            <div className="sm:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
                <RiUser3Line /> About
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">{labour.bio}</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
                <RiToolsLine /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
              <RiBriefcaseLine /> Work Details
            </h3>
            <div className="space-y-3">
              <Row icon={<RiBriefcaseLine />} label="Profession" value={labour.profession} />
              <Row icon={<RiTimeLine />} label="Experience" value={`${labour.experienceYears} years`} />
              <Row icon={<RiMoneyDollarCircleLine />} label="Hourly Rate" value={`₹${labour.hourlyRate}`} />
              <Row icon={<RiMapPinLine />} label="Location" value={`${labour.city}, ${labour.state} - ${labour.pincode}`} />
            </div>
          </div>

          {/* Verification */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:col-span-2">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
              <RiShieldCheckLine /> Verification
            </h3>
            <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/15 rounded-xl p-4">
              <RiShieldCheckLine className="text-green-400 text-xl flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-400">Identity Verified</p>
                <p className="text-white/30 text-xs mt-0.5">
                  Document verified: {
                    labour.documentType === "aadhar" ? "Aadhar Card" :
                    labour.documentType === "pan" ? "PAN Card" :
                    labour.documentType === "driving_license" ? "Driving License" :
                    labour.documentType === "voter_id" ? "Voter ID" :
                    labour.documentType === "passport" ? "Passport" :
                    labour.documentType || "Document"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Book Now Bar (mobile) */}
      {!bookingDone && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#141414]/90 backdrop-blur-lg border-t border-white/10 px-4 py-4 sm:hidden z-40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs">Starting from</p>
              <p className="text-xl font-extrabold text-orange-500">₹{labour.hourlyRate}<span className="text-xs text-white/30 font-normal">/hr</span></p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="bg-orange-500 text-white font-bold px-8 py-3 rounded-2xl text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors">
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-orange-500/60 text-base">{icon}</span>
      <span className="text-white/40 text-xs w-24 flex-shrink-0">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  )
}