'use client'
import { useEffect, useRef, useState, useCallback } from "react"
import {
  X, User, MapPin, ChevronDown, Clock, Shield, Store, Search,
  LayoutDashboard, LogIn, UserPlus, Zap, Bookmark, ChevronRight,
  Mic, MicOff, AlertCircle,
} from "lucide-react"
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Card from '@/components/Website/Cart'
import Link from "next/link"
import { useSelector } from "react-redux"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { IMAGES } from "@/routes/AllImages"
import { useRouter } from "next/navigation"
import LanguageSwitcher from "@/components/Website/LanguageSwitcher"
import LocationPanel from "@/components/Website/LocationPanel"
import AddressModal from "@/components/Website/AddressModal"
import { useSavedProducts } from "@/hooks/useSavedProducts"
import { useDeliveryLocation } from "@/hooks/useDeliveryLocation"
import { useVoiceSearch, cleanTranscript } from "@/hooks/useVoiceSearch"
import { formatEta } from "@/lib/geo"

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

  // Delivery location (saved addresses, nearest shop, live delivery time)
  const { active, saved, status, shop, etaMinutes, activate, deleteAddress } = useDeliveryLocation()

  // Search (always open)
  const [query, setQuery] = useState("")

  // Profile
  const [profileOpen, setProfileOpen] = useState(false)

  // Location dropdown + map/address popup
  const [locationModal, setLocationModal] = useState(false)
  const [mapModal, setMapModal] = useState({ open: false, draft: null, mode: "new", key: 0 })

  // Avatar image load-failure fallback
  const [avatarFailed, setAvatarFailed] = useState(false)

  const profileRef = useRef(null)
  const locationModalRef = useRef(null)

  /* ── Search: one function used by typing + voice ── */
  const runSearch = useCallback((text) => {
    const q = cleanTranscript(text)
    if (!q) return
    setQuery(q)
    router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(q)}`)
  }, [router])

  const handleSearch = () => runSearch(query)

  /* ── Voice search ── */
  const voice = useVoiceSearch({
    lang: "en-IN", // change to "hi-IN" for Hindi speech
    onInterim: (text) => setQuery(text), // show words live in the search box
    onResult: (text) => runSearch(text), // when user stops speaking -> exact search
  })

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

  /* ── Location handlers ── */
  const handleSelectAddress = useCallback((addr) => {
    activate(addr)
    setLocationModal(false)
  }, [activate])

  const openMap = useCallback((draft, mode = "new") => {
    setLocationModal(false)
    setMapModal(m => ({ open: true, draft: draft && Object.keys(draft).length ? draft : null, mode, key: m.key + 1 }))
  }, [])

  const handleSaveFromMap = useCallback((addr) => {
    activate(addr)
    setMapModal(m => ({ ...m, open: false }))
  }, [activate])

  const toggleLocation = () => setLocationModal(v => !v)

  if (auth?.role === "laber") return null

  const avatarSrc = !avatarFailed && auth?.avatar?.url ? auth.avatar.url : IMAGES.profile
  const staticRoleIcon = getStaticRoleIcon(auth?.role)

  /* Delivery label shown in header (dynamic, based on nearest shop distance) */
  const etaLabel =
    !active ? "Choose location"
    : status === "checking" ? "Checking..."
    : status === "unserviceable" ? "Not available here"
    : status === "ok" && etaMinutes != null ? `Delivery in ${formatEta(etaMinutes)}`
    : status === "error" ? "Time unavailable"
    : "Checking..."

  const etaColor =
    status === "unserviceable" ? "text-red-400"
    : status === "error" ? "text-amber-400"
    : "text-green-400"

  const locationText = active
    ? `${active.label ? active.label + " - " : ""}${active.short || active.title || "Selected location"}`
    : "Select location"

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

  /* ── Reusable search input (typing + voice) ── */
  const SearchBox = ({ className = "" }) => (
    <div className="relative w-full">
      <div
        className={`group flex items-stretch w-full h-12 rounded-2xl overflow-hidden border backdrop-blur
        focus-within:bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/20
        transition-all duration-300
        ${voice.listening ? "bg-white border-red-400 ring-4 ring-red-500/20" : "bg-white/10 border-white/10"} ${className}`}
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder={voice.listening ? "Listening... speak now" : "Search for items, brands and more..."}
          className={`flex-1 min-w-0 h-full bg-transparent pl-5 pr-3 text-sm placeholder-gray-400
          group-focus-within:text-gray-900 group-focus-within:placeholder-gray-400 focus:outline-none transition-colors
          ${voice.listening ? "text-gray-900" : "text-white"}`}
        />

        {query && !voice.listening && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="self-center mr-2 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-gray-400 bg-white/10 group-focus-within:bg-gray-100 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        )}

        {/* 🎤 Voice search button */}
        {voice.supported && (
          <button
            type="button"
            onClick={voice.toggle}
            aria-label={voice.listening ? "Stop listening" : "Search by voice"}
            aria-pressed={voice.listening}
            title={voice.listening ? "Tap to stop" : "Tap to speak"}
            className={`relative self-center mr-2 w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer
            ${voice.listening
                ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                : "bg-white/10 text-gray-300 hover:bg-orange-500 hover:text-white group-focus-within:bg-gray-100 group-focus-within:text-gray-600 group-focus-within:hover:bg-orange-500 group-focus-within:hover:text-white"}`}
          >
            {voice.listening && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500/60 animate-ping" />
                <span className="absolute -inset-1 rounded-full border-2 border-red-400/50 animate-pulse" />
              </>
            )}
            {voice.listening ? <MicOff size={17} className="relative" /> : <Mic size={17} className="relative" />}
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

      {/* Listening / error hint under the search box */}
      {(voice.listening || voice.error) && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute left-0 right-0 top-full mt-2 z-50 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm shadow-xl
          ${voice.error ? "bg-red-50 text-red-700 border border-red-200" : "bg-white text-gray-800 border border-gray-100"}`}
        >
          {voice.error ? (
            <>
              <AlertCircle size={16} className="shrink-0" />
              <span className="flex-1">{voice.error}</span>
              <button type="button" onClick={() => voice.setError("")} aria-label="Dismiss" className="shrink-0 cursor-pointer">
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="flex items-end gap-0.5 h-4 shrink-0" aria-hidden="true">
                <span className="w-0.5 h-2 bg-red-500 rounded animate-pulse" />
                <span className="w-0.5 h-4 bg-red-500 rounded animate-pulse [animation-delay:150ms]" />
                <span className="w-0.5 h-3 bg-red-500 rounded animate-pulse [animation-delay:300ms]" />
                <span className="w-0.5 h-4 bg-red-500 rounded animate-pulse [animation-delay:450ms]" />
              </span>
              <span className="flex-1 min-w-0 truncate">
                {voice.interim ? `"${voice.interim}"` : "Listening... say what you want to find"}
              </span>
              <button type="button" onClick={voice.stop} className="shrink-0 text-xs font-semibold text-red-600 hover:underline cursor-pointer">
                Done
              </button>
            </>
          )}
        </div>
      )}
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
                  onClick={toggleLocation}
                  className="hidden lg:flex items-center gap-3 h-14 pl-2 pr-4 rounded-2xl bg-white/5 border border-white/10
                  hover:bg-white/10 hover:border-green-400/40 transition-all duration-300 cursor-pointer group"
                >
                  <span className="relative w-10 h-10 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 shrink-0">
                    <MapPin size={19} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-300 border-2 border-gray-900 animate-pulse" />
                  </span>

                  <span className="text-left min-w-0">
                    <span className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider leading-none ${etaColor}`}>
                      <Zap size={11} />
                      {etaLabel}
                    </span>
                    <span className="flex items-center gap-1 mt-1.5 text-sm font-semibold text-white max-w-52">
                      <span className="truncate">{locationText}</span>
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
                  onClick={toggleLocation}
                  aria-label="Location"
                  className="flex lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center
                  hover:bg-white/10 transition-colors cursor-pointer relative"
                >
                  <MapPin size={19} className={active ? (status === "unserviceable" ? "text-red-400" : "text-green-400") : "text-white"} />
                  {active && (
                    <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${status === "unserviceable" ? "bg-red-400" : "bg-green-400"}`} />
                  )}
                </button>

                {/* Location Panel */}
                {locationModal && (
                  <LocationPanel
                    active={active}
                    saved={saved}
                    status={status}
                    shop={shop}
                    etaMinutes={etaMinutes}
                    onClose={() => setLocationModal(false)}
                    onSelect={handleSelectAddress}
                    onOpenMap={openMap}
                    onDelete={deleteAddress}
                  />
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
        {active && (
          <button
            type="button"
            onClick={toggleLocation}
            className="lg:hidden w-full bg-gray-800/95 text-white px-4 sm:px-6 py-2 flex items-center justify-between gap-3 border-t border-white/5 cursor-pointer"
          >
            <span className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 ${etaColor}`}>
              <Clock size={14} />
              {status === "ok" && etaMinutes != null ? formatEta(etaMinutes) : etaLabel}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-300 min-w-0">
              <MapPin size={13} className="shrink-0 text-gray-400" />
              <span className="truncate">{locationText}</span>
            </span>
          </button>
        )}
      </header>

      {/* ─── MAP + ADDRESS POPUP ─── */}
      {mapModal.open && (
        <AddressModal
          key={mapModal.key}
          initial={mapModal.draft}
          mode={mapModal.mode}
          onSave={handleSaveFromMap}
          onClose={() => setMapModal(m => ({ ...m, open: false }))}
        />
      )}
    </div>
  )
}