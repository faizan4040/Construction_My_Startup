'use client'
import { useEffect, useRef, useState, useCallback } from "react"
import {
  X, User, MapPin, ChevronDown, Navigation, Truck, Clock, Shield, Store,
  Search, CheckCircle2, AlertCircle, Loader2, Star, Info, LayoutDashboard,
  LogIn, UserPlus, ArrowRight, Zap, Bookmark, ChevronRight,
} from "lucide-react"
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Card from '@/components/Website/Cart'
import Link from "next/link"
import { useSelector } from "react-redux"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { IMAGES } from "@/routes/AllImages"
import { useRouter } from "next/navigation"
import LanguageSwitcher from "@/components/Website/LanguageSwitcher"
import { useSavedProducts } from "@/hooks/useSavedProducts"

const WEBSITE_SAVED = "/saved-products"

function getStaticRoleIcon(role) {
  const normalized = String(role || "").trim().toLowerCase()
  if (normalized === "admin") {
    return { bgClass: "bg-gradient-to-br from-orange-500 to-red-500", Icon: Shield }
  }
  if (normalized === "shop owner") {
    return { bgClass: "bg-gradient-to-br from-blue-500 to-indigo-600", Icon: Store }
  }
  return null // customer / everyone else -> normal avatar image flow
}

export default function Header() {
  const router = useRouter()
  const auth = useSelector(store => store.authStore.auth)
  const { count: savedCount, ready: savedReady } = useSavedProducts()

  // Search (always open)
  const [query, setQuery] = useState("")

  // Profile
  const [profileOpen, setProfileOpen] = useState(false)

  // Location state
  const [locationModal, setLocationModal] = useState(false)
  const [locationName, setLocationName] = useState("")
  const [manualInput, setManualInput] = useState("")
  const [locStatus, setLocStatus] = useState({ msg: "", type: "" })
  const [nearestLabor, setNearestLabor] = useState(null)
  const [deliveryTime, setDeliveryTime] = useState("60 mins")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Avatar image load-failure fallback
  const [avatarFailed, setAvatarFailed] = useState(false)

  const profileRef = useRef(null)
  const locationModalRef = useRef(null)

  /* Click outside handler */
  useEffect(() => {
    const handler = (e) => {
      if (!(e.target instanceof Node)) return
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (locationModalRef.current && !locationModalRef.current.contains(e.target)) setLocationModal(false)
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  useEffect(() => {
    setAvatarFailed(false)
  }, [auth?.avatar?.url])

  const handleSearch = () => {
    if (query.trim()) router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(query.trim())}`)
  }

  /* ── Fetch Nearest Labor ── */
  const fetchNearestLabor = useCallback(async (latitude, longitude, city) => {
    try {
      const response = await fetch("/api/labor/nearest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude, city })
      })

      if (response.ok) {
        const data = await response.json()
        setNearestLabor(data)
        if (data.distance) {
          const time = Math.ceil(data.distance / 2) + 10
          setDeliveryTime(`${Math.max(time, 60)} mins`)
        }
      }
    } catch (error) {
      console.log("Error fetching nearest labor:", error)
    }
  }, [])

  /* ── Location Handlers ── */
  const applyLocation = useCallback((name, latitude, longitude, city) => {
    setLocationName(name)
    setLocationModal(false)
    setManualInput("")
    setLocStatus({ msg: "", type: "" })
    setIsLoadingLocation(false)

    if (latitude && longitude) {
      fetchNearestLabor(latitude, longitude, city)
    }
  }, [fetchNearestLabor])

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocStatus({ msg: "Geolocation is not supported by your browser.", type: "error" })
      return
    }

    setIsLoadingLocation(true)
    setLocStatus({ msg: "Detecting your location...", type: "loading" })

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setLocStatus({ msg: "Fetching address...", type: "loading" })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const addr = data.address
          const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || "Your Area"
          const city = addr.city || addr.town || addr.state_district || ""
          const label = city ? `${area}, ${city}` : area

          setLocStatus({ msg: "Location detected!", type: "success" })
          setTimeout(() => applyLocation(label, latitude, longitude, city), 800)
        } catch (error) {
          console.error("Geocoding error:", error)
          setLocStatus({ msg: "Could not fetch address. Please enter manually.", type: "error" })
          setIsLoadingLocation(false)
        }
      },
      (err) => {
        console.error("Geolocation error code:", err.code, "Message:", err.message)
        const msgs = {
          1: "Location permission denied. Please enable location access in your browser settings and try again.",
          2: "Location is unavailable. Please check your device settings and try again.",
          3: "Location request timed out. Please try again or enter manually.",
        }
        setLocStatus({ msg: msgs[err.code] || "Error detecting location. Please try again.", type: "error" })
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }, [applyLocation])

  const confirmManual = useCallback(() => {
    if (!manualInput.trim()) {
      setLocStatus({ msg: "Please enter a location first.", type: "error" })
      return
    }
    applyLocation(manualInput.trim(), null, null, null)
  }, [manualInput, applyLocation])

  if (auth?.role === "laber") return null

  const avatarSrc = !avatarFailed && auth?.avatar?.url ? auth.avatar.url : IMAGES.profile
  const staticRoleIcon = getStaticRoleIcon(auth?.role)

  /* Saved products link (used inside the profile dropdown) */
  const savedLink = (spacing = "") => (
    <Link
      href={WEBSITE_SAVED}
      onClick={() => setProfileOpen(false)}
      className={`group/saved flex items-center gap-3 w-full p-3 rounded-xl border-2 border-orange-100 bg-orange-50/70
      hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 ${spacing}`}
    >
      <span className="w-9 h-9 rounded-lg bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
        <Bookmark size={17} className="text-white" />
      </span>
      <span className="flex-1 text-left min-w-0">
        <span className="block text-sm font-semibold text-gray-900">Saved Products</span>
        <span className="block text-[11px] text-gray-500">Buy later list</span>
      </span>
      {savedReady && savedCount > 0 && (
        <span className="min-w-6 h-6 px-1.5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
          {savedCount}
        </span>
      )}
      <ChevronRight size={17} className="text-gray-400 shrink-0 transition-transform group-hover/saved:translate-x-0.5" />
    </Link>
  )

  const statusStyles =
    locStatus.type === "success"
      ? { wrap: "bg-green-50 border-green-100", text: "text-green-700", Icon: CheckCircle2 }
      : locStatus.type === "error"
        ? { wrap: "bg-red-50 border-red-100", text: "text-red-700", Icon: AlertCircle }
        : { wrap: "bg-blue-50 border-blue-100", text: "text-blue-700", Icon: Loader2 }

  /* ── Reusable search input ── */
  const SearchBox = ({ className = "" }) => (
    <div
      className={`group flex items-stretch w-full h-12 rounded-2xl overflow-hidden bg-white/10 border border-white/10 backdrop-blur
      focus-within:bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/20
      transition-all duration-300 ${className}`}
    >
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
        placeholder="Search for items, brands and more..."
        className="flex-1 min-w-0 h-full bg-transparent pl-5 pr-3 text-sm text-white placeholder-gray-400
        group-focus-within:text-gray-900 group-focus-within:placeholder-gray-400 focus:outline-none transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="self-center mr-3 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-gray-400 bg-white/10 group-focus-within:bg-gray-100 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X size={13} />
        </button>
      )}
      <button
        type="button"
        onClick={handleSearch}
        aria-label="Search"
        className="relative overflow-hidden h-full px-5 sm:px-7 shrink-0 flex items-center justify-center gap-2
        bg-linear-to-br from-orange-500 via-orange-500 to-amber-500 text-white text-sm font-bold tracking-wide
        hover:from-orange-600 hover:via-orange-500 hover:to-amber-400 active:brightness-90
        transition-all duration-300 cursor-pointer group/btn"
      >
        {/* shine sweep on hover */}
        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/30 blur-sm transition-all duration-700 group-hover/btn:left-[150%]" />
        <Search size={18} strokeWidth={2.5} className="relative transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:-rotate-12" />
        <span className="relative hidden sm:inline">Search</span>
      </button>
    </div>
  )

  return (
    <div className="sticky top-0 z-50">
      <header className="relative z-50">

        {/* Accent line */}
        <div className="h-0.5 bg-linear-to-r from-orange-500 via-amber-400 to-orange-500" />

        {/* ─── MAIN NAV ─── */}
        <div className="bg-linear-to-b from-gray-950 to-gray-900 text-white border-b border-white/5 shadow-xl shadow-black/20">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">

              {/* LEFT: Logo */}
              <Link href={WEBSITE_HOME} className="shrink-0 flex items-center">
                <img src={IMAGES.logo} className="h-9 sm:h-11 lg:h-12 w-auto" alt="Logo" />
              </Link>

              {/* ── Location Selector (desktop pill + mobile icon, shared panel) ── */}
              <div className="relative shrink-0 ml-auto lg:ml-0" ref={locationModalRef}>

                {/* Desktop trigger */}
                <button
                  type="button"
                  onClick={() => { setLocationModal(v => !v); setLocStatus({ msg: "", type: "" }) }}
                  className="hidden lg:flex items-center gap-3 h-14 pl-2 pr-4 rounded-2xl bg-white/5 border border-white/10
                  hover:bg-white/10 hover:border-green-400/40 transition-all duration-300 cursor-pointer group"
                >
                  <span className="relative w-10 h-10 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 shrink-0">
                    <MapPin size={19} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-300 border-2 border-gray-900 animate-pulse" />
                  </span>

                  <span className="text-left min-w-0">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-green-400 leading-none">
                      <Zap size={11} />
                      Delivery in {deliveryTime}
                    </span>
                    <span className="flex items-center gap-1 mt-1.5 text-sm font-semibold text-white max-w-45">
                      <span className="truncate">{locationName || "Select location"}</span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 text-gray-400 transition-transform duration-300 ${locationModal ? "rotate-180" : ""}`}
                      />
                    </span>
                  </span>
                </button>

                {/* Mobile trigger */}
                <button
                  type="button"
                  onClick={() => { setLocationModal(v => !v); setLocStatus({ msg: "", type: "" }) }}
                  aria-label="Location"
                  className="flex lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center
                  hover:bg-white/10 transition-colors cursor-pointer relative"
                >
                  <MapPin size={19} className={locationName ? "text-green-400" : "text-white"} />
                  {locationName && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-gray-900" />
                  )}
                </button>

                {/* Location Panel */}
                {locationModal && (
                  <div
                    className="fixed left-3 right-3 top-19 z-50
                    lg:absolute lg:left-0 lg:right-auto lg:top-full lg:mt-3 lg:w-100
                    bg-white text-black rounded-3xl shadow-2xl shadow-black/40 border border-gray-100 overflow-hidden"
                  >
                    {/* Panel header */}
                    <div className="relative px-6 pt-6 pb-5 bg-linear-to-br from-gray-900 to-gray-800 text-white">
                      <div className="flex items-start gap-3">
                        <span className="w-11 h-11 rounded-2xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30">
                          <MapPin size={20} className="text-white" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-base">Set delivery location</p>
                          <p className="text-sm text-gray-400 mt-0.5">We'll show products available in your area</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLocationModal(false)}
                        aria-label="Close"
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    {/* Detect */}
                    <div className="p-4">
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={isLoadingLocation}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-green-200 bg-green-50/60
                        hover:bg-green-50 hover:border-green-300 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                          {isLoadingLocation ? (
                            <Loader2 size={19} className="text-green-600 animate-spin" />
                          ) : (
                            <Navigation size={19} className="text-green-600" />
                          )}
                        </span>
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold text-green-800">
                            {isLoadingLocation ? "Detecting location..." : "Use my current location"}
                          </p>
                          <p className="text-xs text-green-700/70 mt-0.5">Auto-detect via GPS</p>
                        </div>
                        <ArrowRight size={17} className="text-green-600 shrink-0" />
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 px-6">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">or</span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Manual */}
                    <div className="px-4 pt-4 pb-4">
                      <div className="flex items-center h-12 rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/15 transition-all">
                        <MapPin size={17} className="ml-3.5 text-gray-400 shrink-0" />
                        <input
                          type="text"
                          value={manualInput}
                          onChange={e => setManualInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && confirmManual()}
                          placeholder="Enter area, street, pincode..."
                          className="flex-1 min-w-0 h-full bg-transparent px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={confirmManual}
                        className="w-full mt-3 h-12 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold
                        shadow-lg shadow-green-600/25 hover:from-green-700 hover:to-emerald-700 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        Confirm Location
                      </button>
                    </div>

                    {/* Status */}
                    {locStatus.msg && (
                      <div className={`mx-4 mb-4 px-4 py-3 rounded-xl border flex items-start gap-2.5 ${statusStyles.wrap}`}>
                        <statusStyles.Icon
                          size={17}
                          className={`shrink-0 mt-0.5 ${statusStyles.text} ${locStatus.type === "loading" ? "animate-spin" : ""}`}
                        />
                        <p className={`text-sm font-medium ${statusStyles.text}`}>{locStatus.msg}</p>
                      </div>
                    )}

                    {/* Nearest labor */}
                    {nearestLabor && (
                      <div className="mx-4 mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                          <Truck size={18} className="text-blue-600" />
                        </span>
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-sm font-semibold text-blue-900 truncate">{nearestLabor.name}</p>
                          <p className="text-xs text-blue-700 mt-0.5">{nearestLabor.distance?.toFixed(1)} km away</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 shrink-0">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          {nearestLabor.rating || "N/A"}
                        </span>
                      </div>
                    )}

                    {/* Footer tip */}
                    <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-start gap-2.5">
                      <Info size={15} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Make sure location permissions are enabled in your browser settings for auto-detection to work.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Search (desktop, always open) ── */}
              <div className="hidden lg:flex flex-1 min-w-0 max-w-3xl mx-auto">
                {SearchBox({})}
              </div>

              {/* RIGHT: Icons */}
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0 lg:ml-0">

                {/* Language (Google Translate) */}
                <LanguageSwitcher />

                {/* Profile / Auth */}
                <div className="relative shrink-0" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="relative flex items-center gap-2 p-1 rounded-full ring-2 ring-white/10 hover:ring-orange-400/60 transition-all cursor-pointer"
                    aria-label="Profile"
                  >
                    {auth ? (
                      staticRoleIcon ? (
                        <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${staticRoleIcon.bgClass}`}>
                          <staticRoleIcon.Icon size={18} className="text-white" />
                        </span>
                      ) : (
                        <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                          <AvatarImage src={avatarSrc} onError={() => setAvatarFailed(true)} />
                          <AvatarFallback>
                            <User size={18} />
                          </AvatarFallback>
                        </Avatar>
                      )
                    ) : (
                      <span className="bg-white/10 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <User size={19} />
                      </span>
                    )}
                    {savedReady && savedCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-4.5 text-center border-2 border-gray-900">
                        {savedCount > 9 ? "9+" : savedCount}
                      </span>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-4 w-72 sm:w-80 bg-white text-black rounded-3xl shadow-2xl shadow-black/30 border border-gray-100 overflow-hidden z-50">
                      {!auth ? (
                        <div className="p-5 sm:p-6">
                          <div className="text-center mb-5">
                            <span className="mx-auto w-14 h-14 rounded-2xl bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                              <User size={26} className="text-white" />
                            </span>
                            <p className="mt-3 font-bold text-gray-900">Welcome</p>
                            <p className="text-sm text-gray-500 mt-0.5">Sign in to manage your orders</p>
                          </div>
                          <Link href={WEBSITE_REGISTER} onClick={() => setProfileOpen(false)}>
                            <button className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl cursor-pointer mb-3 font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all">
                              <UserPlus size={17} />
                              Create Free Account
                            </button>
                          </Link>
                          <Link href={WEBSITE_LOGIN} onClick={() => setProfileOpen(false)}>
                            <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 py-3 rounded-xl cursor-pointer font-semibold hover:bg-gray-900 hover:text-white transition-all">
                              <LogIn size={17} />
                              Sign In
                            </button>
                          </Link>
                          {savedLink("mt-3")}
                        </div>
                      ) : (
                        <div>
                          <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-5 bg-linear-to-b from-gray-50 to-white">
                            {staticRoleIcon ? (
                              <span className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg ${staticRoleIcon.bgClass}`}>
                                <staticRoleIcon.Icon size={26} className="text-white" />
                              </span>
                            ) : (
                              <Link href={`/profile/${auth.id || auth._id}`} onClick={() => setProfileOpen(false)}>
                                <Avatar className="w-16 h-16 ring-4 ring-orange-100">
                                  <AvatarImage src={avatarSrc} onError={() => setAvatarFailed(true)} />
                                  <AvatarFallback>
                                    <User size={26} />
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            )}
                            <div className="text-center">
                              <span className="block font-bold text-gray-900">{auth.name}</span>
                              {auth.role && (
                                <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 rounded-full px-2.5 py-0.5">
                                  {auth.role}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="px-5 pb-5">
                            {savedLink("mb-3")}
                            <Link href={USER_DASHBOARD} className="w-full" onClick={() => setProfileOpen(false)}>
                              <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer bg-gray-900 text-white hover:bg-orange-500 transition-all duration-300 font-semibold">
                                <LayoutDashboard size={17} />
                                Dashboard
                              </button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart */}
                <div className="shrink-0">
                  <Card className="cursor-pointer" />
                </div>
              </div>
            </div>

            {/* ─── MOBILE SEARCH (always open) ─── */}
            <div className="lg:hidden mt-3">
              {SearchBox({})}
            </div>
          </div>
        </div>

        {/* ─── MOBILE DELIVERY STRIP ─── */}
        {locationName && (
          <div className="lg:hidden bg-gray-800/95 text-white px-4 sm:px-6 py-2 flex items-center justify-between gap-3 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 shrink-0">
              <Clock size={14} />
              {deliveryTime}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-300 min-w-0">
              <MapPin size={13} className="shrink-0 text-gray-400" />
              <span className="truncate">{locationName}</span>
            </span>
          </div>
        )}
      </header>
    </div>
  )
}