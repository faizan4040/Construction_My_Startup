"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import {
  RiUser3Line, RiMapPinLine, RiTimeLine, RiStarFill,
  RiShieldCheckLine, RiPhoneLine, RiCalendarLine,
  RiCheckLine, RiArrowLeftLine, RiMoneyDollarCircleLine,
  RiToolsLine, RiLoader4Line, RiAlertLine,
  RiMessage3Line, RiBriefcaseLine, RiSendPlaneLine,
  RiCloseLine, RiFileTextLine
} from "react-icons/ri"
import Link from "next/link"

export default function LabourProfilePage() {
  const { slug } = useParams()
  const router   = useRouter()

  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")

  // Booking form
  const [form, setForm]         = useState({
    clientName: "", clientPhone: "", workDate: "", description: "", address: ""
  })
  const [booking, setBooking]   = useState(false)  // submitting
  const [booked, setBooked]     = useState(false)  // success
  const [bookError, setBookError] = useState("")

  // Map embed coords
  const mapQuery = profile
    ? encodeURIComponent(`${profile.city}, ${profile.state}, India`)
    : ""

  useEffect(() => {
    if (!slug) return
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`/api/labour/${slug}`)
        setProfile(data.profile)
      } catch (err) {
        setError(err?.response?.data?.message || "Profile not found")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [slug])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleBook = async () => {
    setBookError("")
    if (!form.clientName.trim())  return setBookError("Your name is required")
    if (!form.clientPhone.trim()) return setBookError("Phone number is required")
    if (!/^[0-9]{10}$/.test(form.clientPhone.trim())) return setBookError("Enter valid 10-digit phone")
    if (!form.workDate)           return setBookError("Select a work date")
    if (!form.description.trim()) return setBookError("Describe the work needed")

    setBooking(true)
    try {
      await axios.post(
        "/api/labour/booking",
        {
          labourSlug:  slug,
          clientName:  form.clientName.trim(),
          clientPhone: form.clientPhone.trim(),
          workDate:    form.workDate,
          description: form.description.trim(),
          address:     form.address.trim(),
        },
        { withCredentials: true }
      )
      setBooked(true)
    } catch (err) {
      const msg = err?.response?.data?.message || "Booking failed. Please try again."
      if (msg.toLowerCase().includes("not authenticated") || msg.toLowerCase().includes("login")) {
        setBookError("Please log in to book a professional.")
      } else {
        setBookError(msg)
      }
    } finally {
      setBooking(false)
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RiLoader4Line className="text-4xl text-orange-500 animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-center">
          <RiAlertLine className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">{error || "Profile not found"}</p>
          <Link href="/labour" className="mt-4 inline-block text-orange-500 font-bold hover:underline text-sm">
            ← Back to all professionals
          </Link>
        </div>
      </div>
    )
  }

  const skills = Array.isArray(profile.skills)
    ? profile.skills
    : typeof profile.skills === "string"
    ? profile.skills.split(",").map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-[#f7f5f2]" style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}>

      {/* Back bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition text-sm font-semibold">
            <RiArrowLeftLine /> Back
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 text-sm truncate">
            {profile.firstName} {profile.lastName} · {profile.profession}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ══════════════════════════════
               LEFT — Labour Profile Details
              ══════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Hero card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {/* Cover */}
              <div className="h-28 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 relative">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />
              </div>

              <div className="px-6 pb-6">
                {/* Avatar + name row */}
                <div className="flex items-end gap-4 -mt-12 mb-4">
                  <div className="relative shrink-0">
                    {profile.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-orange-100 border-4 border-white shadow-xl flex items-center justify-center">
                        <RiUser3Line className="text-3xl text-orange-400" />
                      </div>
                    )}
                    {profile.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <RiCheckLine className="text-white text-xs" />
                      </div>
                    )}
                  </div>

                  <div className="pb-1 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        {profile.isVerified && (
                          <div className="flex items-center gap-1 mb-1">
                            <RiShieldCheckLine className="text-blue-500 text-xs" />
                            <span className="text-blue-500 text-[10px] font-black uppercase tracking-wider">Verified Pro</span>
                          </div>
                        )}
                        <h1 className="text-2xl font-black text-gray-900 leading-tight">
                          {profile.firstName} {profile.lastName}
                        </h1>
                        <p className="text-orange-500 font-bold">{profile.profession}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-gray-900">₹{profile.hourlyRate || 0}</p>
                        <p className="text-xs text-gray-400">per hour</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-5 pb-4 border-b border-gray-100">
                  <span className="flex items-center gap-1.5">
                    <RiStarFill className="text-orange-500" />
                    <span className="font-black text-gray-900">
                      {profile.rating > 0 ? profile.rating.toFixed(1) : "New"}
                    </span>
                    {profile.reviewCount > 0 && (
                      <span className="text-gray-400 text-xs">({profile.reviewCount} reviews)</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <RiMapPinLine className="text-orange-400" />
                    {profile.city}, {profile.state}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <RiTimeLine className="text-orange-400" />
                    {profile.experienceYears} yrs experience
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 text-sm capitalize">
                    <RiBriefcaseLine className="text-orange-400" />
                    {profile.availability?.replace("_", " ")}
                  </span>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed mt-4">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Skills & Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <RiToolsLine className="text-orange-500" /> Skills & Expertise
              </h2>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                      <RiCheckLine className="text-xs" /> {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No skills listed</p>
              )}
              {profile.professionType && (
                <p className="mt-3 text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">Specialization:</span> {profile.professionType}
                </p>
              )}
            </div>

            {/* Details grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <RiFileTextLine className="text-orange-500" /> Work Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: RiMoneyDollarCircleLine, label: "Hourly Rate",  value: `₹${profile.hourlyRate}/hr`,              color: "text-green-500", bg: "bg-green-50" },
                  { icon: RiTimeLine,              label: "Experience",   value: `${profile.experienceYears} years`,        color: "text-blue-500",  bg: "bg-blue-50"  },
                  { icon: RiBriefcaseLine,         label: "Availability", value: profile.availability?.replace("_"," "),   color: "text-purple-500",bg: "bg-purple-50"},
                  { icon: RiTimeLine,              label: "Working Hrs",  value: profile.workingHours,                      color: "text-orange-500",bg: "bg-orange-50"},
                  { icon: RiMapPinLine,            label: "City",         value: `${profile.city}, ${profile.state}`,       color: "text-red-500",   bg: "bg-red-50"   },
                  { icon: RiStarFill,              label: "Rating",       value: profile.rating > 0 ? `${profile.rating.toFixed(1)} / 5` : "New", color: "text-yellow-500", bg: "bg-yellow-50" },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3`}>
                    <Icon className={`${color} text-xl mb-1`} />
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm font-black text-gray-800 capitalize mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                <RiMapPinLine className="text-orange-500" /> Location
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {profile.address}, {profile.city}, {profile.state} — {profile.pincode}
              </p>
              {/* Google Maps embed */}
              <div className="rounded-xl overflow-hidden border border-gray-200 h-52">
                <iframe
                  title="Labour Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=13`}
                />
              </div>
            </div>

          </div>

          {/* ══════════════════════════════
               RIGHT — Booking Form (sticky)
              ══════════════════════════════ */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-20 space-y-4">

              {/* Price summary card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500 text-sm">Starting from</span>
                  {profile.isVerified && (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                      <RiShieldCheckLine /> Verified
                    </span>
                  )}
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">
                  ₹{profile.hourlyRate || 0}
                  <span className="text-base text-gray-400 font-normal">/hr</span>
                </p>
                <p className="text-xs text-gray-400">
                  Available: <span className="font-semibold text-gray-600 capitalize">{profile.workingHours}</span>
                </p>
              </div>

              {/* Booking form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {booked ? (
                  /* ── Success state ── */
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RiCheckLine className="text-3xl text-green-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Booking Sent!</h3>
                    <p className="text-gray-500 text-sm mb-1">
                      Your request has been sent to <span className="font-bold text-gray-800">{profile.firstName}</span>.
                    </p>
                    <p className="text-gray-400 text-xs mb-6">
                      They will accept and contact you shortly.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => { setBooked(false); setForm({ clientName:"", clientPhone:"", workDate:"", description:"", address:"" }) }}
                        className="w-full border-2 border-gray-200 hover:border-orange-300 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition"
                      >
                        Book Again
                      </button>
                      <Link href="/labour"
                        className="block w-full text-center text-orange-500 font-bold py-2.5 rounded-xl text-sm hover:bg-orange-50 transition">
                        Browse More Professionals
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* ── Form ── */
                  <>
                    <h3 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
                      <RiSendPlaneLine className="text-orange-500" /> Book Now
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Your Name *</label>
                        <input
                          className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm outline-none transition"
                          placeholder="Full name"
                          value={form.clientName}
                          onChange={e => set("clientName", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
                        <div className="flex items-center border-2 border-gray-200 focus-within:border-orange-400 rounded-xl overflow-hidden transition">
                          <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 font-semibold">+91</span>
                          <input
                            className="flex-1 px-3 py-2.5 text-sm outline-none"
                            placeholder="10-digit number"
                            maxLength={10}
                            value={form.clientPhone}
                            onChange={e => set("clientPhone", e.target.value.replace(/\D/g, ""))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Work Date *</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm outline-none transition"
                          value={form.workDate}
                          onChange={e => set("workDate", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Work Address</label>
                        <input
                          className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm outline-none transition"
                          placeholder="Where is the work?"
                          value={form.address}
                          onChange={e => set("address", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Describe the Work *</label>
                        <textarea
                          rows={3}
                          className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition"
                          placeholder="e.g. Need to fix bathroom pipe leak, 2nd floor..."
                          value={form.description}
                          onChange={e => set("description", e.target.value)}
                        />
                      </div>

                      {bookError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5">
                          <RiAlertLine className="shrink-0 mt-0.5" />
                          <span>{bookError}</span>
                        </div>
                      )}

                      <button
                        onClick={handleBook}
                        disabled={booking}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black py-3 rounded-xl transition flex items-center justify-center gap-2 text-base shadow-lg shadow-orange-200"
                      >
                        {booking ? (
                          <><RiLoader4Line className="animate-spin" /> Sending...</>
                        ) : (
                          <><RiSendPlaneLine /> Send Booking Request</>
                        )}
                      </button>

                      <p className="text-center text-xs text-gray-400">
                        The professional will confirm and contact you
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Contact info teaser */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                    <RiMessage3Line className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Direct Communication</p>
                    <p className="text-xs text-gray-500 mt-0.5">After booking is accepted, you can chat directly with {profile.firstName}.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}