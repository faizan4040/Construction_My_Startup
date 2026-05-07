"use client"

import { useState, useRef } from "react"
import axios from "axios"
import {
  RiUser3Line,
  RiMapPinLine,
  RiFileTextLine,
  RiBriefcaseLine,
  RiCheckLine,
  RiUploadCloud2Line,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiImageLine,
  RiToolsLine,
  RiErrorWarningLine,
} from "react-icons/ri"

const STEPS = [
  { id: 1, label: "Personal Info", icon: RiUser3Line },
  { id: 2, label: "Location", icon: RiMapPinLine },
  { id: 3, label: "Document", icon: RiFileTextLine },
  { id: 4, label: "Work Profile", icon: RiBriefcaseLine },
  { id: 5, label: "Profile Photo", icon: RiImageLine },
]

const PROFESSION_TYPES = [
  "Mistri (Mason)", "Plumber", "Electrician", "Carpenter", "Painter",
  "Welder", "Mechanic", "Gardener", "House Helper", "Security Guard",
  "Cook / Chef", "Driver", "AC Technician", "Tiler", "Roofer",
  "Glass Worker", "Fabricator", "Cleaner", "Pest Control", "Other",
]

const DOCUMENT_TYPES = [
  { value: "aadhar", label: "Aadhar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
  { value: "passport", label: "Passport" },
]

export default function ProfileSetup({ onComplete }) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [errorDetail, setErrorDetail] = useState("")

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    documentType: "aadhar",
    documentNumber: "",
    documentFile: null,
    documentFilePreview: null,
    profession: "",
    customProfession: "",
    experienceYears: "",
    skills: "",
    hourlyRate: "",
    bio: "",
    profileImage: null,
    profileImagePreview: null,
  })

  const profileImageRef = useRef(null)
  const documentFileRef = useRef(null)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleFile = (key, previewKey, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => set(previewKey, e.target.result)
    reader.readAsDataURL(file)
    set(key, file)
  }

  const isStepValid = () => {
    if (step === 1) return form.firstName && form.lastName && form.phone
    if (step === 2) return form.address && form.city && form.state && form.pincode
    if (step === 3) return form.documentType && form.documentNumber && form.documentFile
    if (step === 4) return (form.profession || form.customProfession) && form.experienceYears && form.hourlyRate
    if (step === 5) return true  // photo is optional — don't block save
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    setErrorDetail("")

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    // const endpoint = `${baseUrl}/labour/create-profile`
    // const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/labor/create-profile`
    const endpoint = `/api/labour/create-profile`



    console.log("=== PROFILE SUBMIT START ===")
    console.log("API URL:", endpoint)
    console.log("Form data:", {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      profession: form.profession,
      experienceYears: form.experienceYears,
      hourlyRate: form.hourlyRate,
      hasProfileImage: !!form.profileImage,
      hasDocumentFile: !!form.documentFile,
    })

    try {
      const fd = new FormData()
      fd.append("firstName", form.firstName)
      fd.append("lastName", form.lastName)
      fd.append("phone", form.phone)
      fd.append("email", form.email || "")
      fd.append("address", form.address)
      fd.append("city", form.city)
      fd.append("state", form.state)
      fd.append("pincode", form.pincode)
      fd.append("documentType", form.documentType)
      fd.append("documentNumber", form.documentNumber)
      fd.append("profession", form.profession === "Other" ? form.customProfession : form.profession)
      fd.append("experienceYears", form.experienceYears)
      fd.append("skills", form.skills || "")
      fd.append("hourlyRate", form.hourlyRate)
      fd.append("bio", form.bio || "")
      if (form.documentFile) fd.append("documentFile", form.documentFile)
      if (form.profileImage) fd.append("profileImage", form.profileImage)

      const { data } = await axios.post(endpoint, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })

      console.log("=== SUCCESS ===", data)
      const profile = data?.data?.profile || data?.data || data
      onComplete(profile)

    } catch (err) {
      console.error("=== ERROR ===", err)

      const status = err?.response?.status
      const responseData = err?.response?.data

      console.log("Status:", status)
      console.log("Response data:", responseData)
      console.log("Error message:", err?.message)

      // ── Friendly message + detail for each case ──
      if (!err?.response) {
        // No response = network error / CORS / backend not running
        setError("Cannot connect to server.")
        setErrorDetail(
          `Network error: ${err?.message}. ` +
          `Check: (1) your backend server is running, ` +
          `(2) NEXT_PUBLIC_API_BASE_URL is set correctly in .env.local — current value: "${process.env.NEXT_PUBLIC_API_BASE_URL || "NOT SET"}"`
        )
      } else if (status === 401) {
        setError("Not logged in.")
        setErrorDetail("Your session expired or cookie is missing. Please log out and log in again.")
      } else if (status === 403) {
        setError("Access denied (403).")
        setErrorDetail("Your account role may not be 'laber'. Check your JWT token role field.")
      } else if (status === 404) {
        setError("API route not found (404).")
        setErrorDetail(`The backend route POST /labour/create-profile does not exist. Check your backend routes file.`)
      } else if (status === 409) {
        setError("Profile already exists.")
        setErrorDetail("A profile is already linked to your account. Refresh the page.")
      } else if (status === 413) {
        setError("File too large (413).")
        setErrorDetail("Your image or document file is too big. Try a smaller file under 2MB.")
      } else if (status === 400 || status === 422) {
        const msg = responseData?.message || responseData?.error || JSON.stringify(responseData)
        setError(`Validation error (${status}).`)
        setErrorDetail(`Server says: ${msg}`)
      } else if (status === 500) {
        const msg = responseData?.message || responseData?.error || JSON.stringify(responseData)
        setError("Server error (500).")
        setErrorDetail(`Backend crashed. Server says: ${msg}. Check your backend terminal/logs.`)
      } else {
        setError(`Unexpected error (${status}).`)
        setErrorDetail(JSON.stringify(responseData))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-start py-10 px-4"
      style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-4">
          <RiToolsLine /> Labour Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Build Your <span className="text-orange-500">Professional Profile</span>
        </h1>
        <p className="text-white/40 mt-2 text-sm">Complete all steps to start receiving job bookings</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-10 w-full max-w-2xl">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = step > s.id
          const active = step === s.id
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-lg
                  ${done ? "bg-orange-500 border-orange-500 text-white" :
                    active ? "bg-orange-500/10 border-orange-500 text-orange-500" :
                    "bg-white/5 border-white/10 text-white/30"}`}>
                  {done ? <RiCheckLine /> : <Icon />}
                </div>
                <span className={`text-[10px] font-semibold hidden sm:block tracking-wide
                  ${active ? "text-orange-400" : done ? "text-white/60" : "text-white/20"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded transition-all duration-300
                  ${done ? "bg-orange-500" : "bg-white/10"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Form Card */}
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-sm shadow-2xl">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <StepTitle icon={<RiUser3Line />} title="Personal Information" subtitle="Tell clients who you are" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name *" value={form.firstName} onChange={(v) => set("firstName", v)} placeholder="Ramesh" />
              <Field label="Last Name *" value={form.lastName} onChange={(v) => set("lastName", v)} placeholder="Kumar" />
            </div>
            <Field label="Phone Number *" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210" type="tel" />
            <Field label="Email (optional)" value={form.email} onChange={(v) => set("email", v)} placeholder="ramesh@example.com" type="email" />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <StepTitle icon={<RiMapPinLine />} title="Your Location" subtitle="Help clients find you nearby" />
            <Field label="Full Address *" value={form.address} onChange={(v) => set("address", v)} placeholder="Street / Colony / House No." />
            <div className="grid grid-cols-2 gap-4">
              <Field label="City *" value={form.city} onChange={(v) => set("city", v)} placeholder="Jaipur" />
              <Field label="State *" value={form.state} onChange={(v) => set("state", v)} placeholder="Rajasthan" />
            </div>
            <Field label="Pincode *" value={form.pincode} onChange={(v) => set("pincode", v)} placeholder="302001" type="number" />
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <StepTitle icon={<RiFileTextLine />} title="Identity Document" subtitle="For verification — kept secure & private" />
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Document Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DOCUMENT_TYPES.map((d) => (
                  <button key={d.value} type="button" onClick={() => set("documentType", d.value)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200
                      ${form.documentType === d.value
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-orange-500/50 hover:text-white/80"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Document Number *" value={form.documentNumber} onChange={(v) => set("documentNumber", v)}
              placeholder={form.documentType === "aadhar" ? "XXXX XXXX XXXX" : "Enter number"} />
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Upload Document *</label>
              <input ref={documentFileRef} type="file" accept="image/*,application/pdf" className="hidden"
                onChange={(e) => handleFile("documentFile", "documentFilePreview", e.target.files[0])} />
              <button type="button" onClick={() => documentFileRef.current?.click()}
                className="w-full border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-2xl p-6 flex flex-col items-center gap-2 transition-all duration-200 group">
                {form.documentFilePreview ? (
                  <img src={form.documentFilePreview} alt="doc" className="h-24 object-contain rounded-lg" />
                ) : (
                  <>
                    <RiUploadCloud2Line className="text-3xl text-white/30 group-hover:text-orange-500 transition-colors" />
                    <p className="text-white/40 text-sm">Click to upload image or PDF</p>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-5">
            <StepTitle icon={<RiBriefcaseLine />} title="Work Profile" subtitle="Showcase your expertise to clients" />
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Profession *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {PROFESSION_TYPES.map((p) => (
                  <button key={p} type="button" onClick={() => set("profession", p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all duration-200 text-left
                      ${form.profession === p
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-orange-500/50 hover:text-white/80"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {form.profession === "Other" && (
              <Field label="Specify Profession" value={form.customProfession}
                onChange={(v) => set("customProfession", v)} placeholder="Your trade" />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Experience (Years) *" value={form.experienceYears}
                onChange={(v) => set("experienceYears", v)} placeholder="5" type="number" />
              <Field label="Hourly Rate (₹) *" value={form.hourlyRate}
                onChange={(v) => set("hourlyRate", v)} placeholder="200" type="number" />
            </div>
            <Field label="Skills (comma separated)" value={form.skills}
              onChange={(v) => set("skills", v)} placeholder="Brickwork, Plastering, Tiling" />
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">About You</label>
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                placeholder="Tell clients about your work style, past projects, specialties..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-orange-500/50 transition-all duration-200 resize-none" />
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="space-y-5">
            <StepTitle icon={<RiImageLine />} title="Profile Photo" subtitle="A great photo gets more bookings (optional)" />
            <input ref={profileImageRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFile("profileImage", "profileImagePreview", e.target.files[0])} />
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-orange-500/30 shadow-2xl">
                  {form.profileImagePreview ? (
                    <img src={form.profileImagePreview} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <RiUser3Line className="text-5xl text-white/20" />
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => profileImageRef.current?.click()}
                  className="absolute bottom-2 right-2 w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors">
                  <RiUploadCloud2Line className="text-white text-lg" />
                </button>
              </div>
              <button type="button" onClick={() => profileImageRef.current?.click()}
                className="border border-dashed border-white/20 hover:border-orange-500/50 rounded-2xl px-8 py-4 text-white/40 hover:text-orange-400 text-sm transition-all duration-200">
                {form.profileImagePreview ? "Change photo" : "Click to upload a profile photo"}
              </button>
              <p className="text-white/20 text-xs">You can skip this — photo can be added later</p>
            </div>
          </div>
        )}

        {/* ── Error Block ── */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <RiErrorWarningLine className="text-red-400 text-lg flex-shrink-0" />
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </div>
            {errorDetail && (
              <p className="text-red-300/70 text-xs leading-relaxed pl-6 border-l border-red-500/20 ml-1">
                {errorDetail}
              </p>
            )}
            <p className="text-white/30 text-xs pl-6">
              Open browser DevTools (F12) → Console tab for full error details.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button type="button"
              onClick={() => { setError(""); setErrorDetail(""); setStep(step - 1) }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all duration-200 text-sm font-medium">
              <RiArrowLeftLine /> Back
            </button>
          ) : <div />}

          {step < STEPS.length ? (
            <button type="button"
              onClick={() => { setError(""); setErrorDetail(""); setStep(step + 1) }}
              disabled={!isStepValid()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                ${isStepValid()
                  ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                  : "bg-white/5 text-white/20 cursor-not-allowed"}`}>
              Continue <RiArrowRightLine />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
                ${!submitting
                  ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                  : "bg-white/5 text-white/20 cursor-not-allowed"}`}>
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <><RiCheckLine /> Save Profile</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-orange-500/50 transition-all duration-200" />
    </div>
  )
}

function StepTitle({ icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-orange-500 text-xl">{icon}</span>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="text-white/30 text-sm pl-9">{subtitle}</p>
    </div>
  )
}