'use client'
import { useEffect, useRef, useState, useCallback } from "react"
import { X, User, MapPin, ChevronDown, Navigation, Truck, Clock } from "lucide-react"
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Card from '@/components/Website/Cart'
import Link from "next/link"
import { useSelector } from "react-redux"
import { Avatar, AvatarImage } from "../ui/avatar"
import { IMAGES } from "@/routes/AllImages"
import { useRouter } from "next/navigation"
import { IoSearchOutline } from "react-icons/io5"

export default function Header() {
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const auth = useSelector(store => store.authStore.auth)

  // Mobile search
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [mobileQuery, setMobileQuery] = useState("")

  // Location state
  const [locationModal, setLocationModal] = useState(false)
  const [locationName, setLocationName] = useState("")
  const [manualInput, setManualInput] = useState("")
  const [locStatus, setLocStatus] = useState({ msg: "", type: "" })
  const [nearestLabor, setNearestLabor] = useState(null)
  const [deliveryTime, setDeliveryTime] = useState("30 mins")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

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

  const handleSearch = () => {
    if (query.trim()) router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(query.trim())}`)
  }

  const handleMobileSearch = () => {
    if (mobileQuery.trim()) {
      router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(mobileQuery.trim())}`)
      setShowMobileSearch(false)
    }
  }

  /* ── Fetch Nearest Labor ── */
  const fetchNearestLabor = useCallback(async (latitude, longitude, city) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/labor/nearest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude, city })
      })
      
      if (response.ok) {
        const data = await response.json()
        setNearestLabor(data)
        // Calculate delivery time based on distance
        if (data.distance) {
          const time = Math.ceil(data.distance / 2) + 10 // Example: 2km per min + 10 min prep
          setDeliveryTime(`${Math.min(time, 60)} mins`)
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
    setLocStatus({ msg: "Detecting your location…", type: "loading" })

    // Higher timeout and better position options
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setLocStatus({ msg: "Fetching address…", type: "loading" })
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
        timeout: 15000, // 15 seconds
        maximumAge: 0 // Don't use cached position
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

  /* ── Status text color ── */
  const statusColor =
    locStatus.type === "success" ? "text-green-600"
      : locStatus.type === "error" ? "text-red-600"
        : "text-blue-500"

  return (
    <div className="sticky top-0 z-50">
      <header className="relative z-50">

        {/* ─── MAIN NAV ─── */}
        <div className="bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">

            {/* LEFT: Logo */}
            <Link href={WEBSITE_HOME} className="font-bold tracking-wide flex-shrink-0">
              <img src={IMAGES.logo} className="h-10 sm:h-11 lg:h-12 w-auto" alt="Logo" />
            </Link>

            {/* CENTER: Location + Search (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-6 flex-1">

              {/* ── Location Selector ── */}
              <div className="relative flex-shrink-0" ref={locationModalRef}>
                <button
                  type="button"
                  onClick={() => { setLocationModal(v => !v); setLocStatus({ msg: "", type: "" }) }}
                  className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-green-400" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] text-gray-400 leading-none mb-1">Delivery in</p>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock size={14} className="flex-shrink-0" />
                      <span className="truncate">{deliveryTime}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                      {locationName || "Select location"}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </button>

                {/* Location Modal */}
                {locationModal && (
                  <div className="absolute top-full left-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-black">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                      <p className="font-bold text-gray-900 text-base">Set delivery location</p>
                      <p className="text-sm text-gray-500 mt-1">We'll show products available in your area</p>
                    </div>

                    {/* Auto Detect Button */}
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={isLoadingLocation}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className={`w-11 h-11 rounded-full ${isLoadingLocation ? 'bg-gray-200 animate-pulse' : 'bg-green-50'} flex items-center justify-center flex-shrink-0`}>
                        {isLoadingLocation ? (
                          <div className="animate-spin">
                            <Navigation size={18} className="text-green-600" />
                          </div>
                        ) : (
                          <Navigation size={18} className="text-green-600" />
                        )}
                      </span>
                      <div className="text-left">
                        <p className="text-base font-semibold text-green-700">
                          {isLoadingLocation ? "Detecting location..." : "Use my current location"}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">Auto-detect via GPS</p>
                      </div>
                    </button>

                    {/* Manual Input Section */}
                    <div className="px-6 py-5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Or enter manually</p>
                      <input
                        type="text"
                        value={manualInput}
                        onChange={e => setManualInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && confirmManual()}
                        placeholder="Enter area, street, pincode…"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-400 transition"
                      />
                      <button
                        type="button"
                        onClick={confirmManual}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white text-base font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                      >
                        Confirm Location
                      </button>
                    </div>

                    {/* Status Message */}
                    {locStatus.msg && (
                      <div className={`px-6 py-4 ${locStatus.type === "error" ? "bg-red-50" : locStatus.type === "success" ? "bg-green-50" : "bg-blue-50"}`}>
                        <p className={`text-sm font-medium flex items-center gap-2 ${statusColor}`}>
                          {locStatus.type === "loading" && (
                            <span className="inline-block animate-spin">⏳</span>
                          )}
                          {locStatus.type === "success" && "✅"}
                          {locStatus.type === "error" && "⚠️"}
                          <span>{locStatus.msg}</span>
                        </p>
                      </div>
                    )}

                    {/* Nearest Labor Info */}
                    {nearestLabor && (
                      <div className="px-6 py-4 bg-blue-50 border-t border-gray-100">
                        <div className="flex items-start gap-3">
                          <Truck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-blue-900">{nearestLabor.name}</p>
                            <p className="text-xs text-blue-700 mt-0.5">{nearestLabor.distance?.toFixed(1)} km away</p>
                            <p className="text-xs text-blue-600 mt-1">Rating: {nearestLabor.rating || "N/A"} ⭐</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Help Text */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
                      <p>💡 Make sure location permissions are enabled in your browser settings for auto-detection to work.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-gray-700 flex-shrink-0" />

              {/* ── Search Bar ── */}
              <div className="relative flex items-center flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowSearch(!showSearch)}
                  className="px-5 py-2.5 bg-black text-white rounded-l-full flex items-center gap-2 z-10 cursor-pointer flex-shrink-0 hover:bg-gray-800 transition-colors"
                >
                  <IoSearchOutline size={18} />
                  <span className="text-sm font-medium">Search</span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showSearch ? 'w-80 lg:w-[420px]' : 'w-0'}`}>
                  <div className="relative">
                    <IoSearchOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSearch()}
                      className="w-full pl-12 pr-5 py-2.5 rounded-r-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
                      placeholder='Search items...'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Icons */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-shrink-0">

              {/* Mobile Search Icon */}
              <button
                className="flex lg:hidden items-center text-white cursor-pointer hover:text-gray-300 transition-colors"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                aria-label="Search"
              >
                <IoSearchOutline size={24} />
              </button>

              {/* Mobile Location Icon */}
              <button
                className="flex lg:hidden items-center text-white cursor-pointer hover:text-gray-300 transition-colors relative"
                onClick={() => setLocationModal(v => !v)}
                aria-label="Location"
              >
                <MapPin size={22} className={locationName ? "text-green-400" : "text-white"} />
              </button>

              {/* Profile / Auth */}
              <div className="relative flex-shrink-0" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                  aria-label="Profile"
                >
                  {auth ? (
                    <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                      <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                    </Avatar>
                  ) : (
                    <span className="bg-gray-700 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
                      <User size={20} />
                    </span>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-4 w-72 sm:w-80 cursor-pointer bg-white text-black rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 z-50">
                    {!auth ? (
                      <>
                        <Link href={WEBSITE_REGISTER}>
                          <button className="w-full bg-black hover:bg-orange-500 text-white py-3 rounded-xl cursor-pointer mb-3 font-medium transition-colors">
                            Create Free Account
                          </button>
                        </Link>
                        <Link href={WEBSITE_LOGIN}>
                          <button className="w-full bg-black text-white py-3 hover:bg-orange-500 rounded-xl cursor-pointer font-medium transition-colors">
                            Sign In
                          </button>
                        </Link>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Link href={`/profile/${auth.id}`}>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                          </Avatar>
                        </Link>
                        <span className="font-semibold text-gray-900 text-center">{auth.name}</span>
                        <Link href={USER_DASHBOARD} className="w-full">
                          <button className="w-full border-2 py-3 px-4 rounded-xl cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 font-medium">
                            Dashboard
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <div className="flex-shrink-0">
                <Card className="cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE SEARCH BAR ─── */}
        <div className={`lg:hidden bg-gray-800 px-4 sm:px-6 overflow-hidden transition-all duration-300 ${showMobileSearch ? "max-h-20 py-3 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="relative flex items-center">
            <IoSearchOutline size={18} className="absolute left-4 text-gray-400" />
            <input
              type="text"
              value={mobileQuery}
              onChange={e => setMobileQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleMobileSearch()}
              className="w-full pl-11 pr-11 py-2.5 rounded-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400"
              placeholder='Search items...'
            />
            {mobileQuery && (
              <button onClick={() => setMobileQuery("")} className="absolute right-4 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ─── MOBILE LOCATION SECTION ─── */}
        {locationName && (
          <div className="lg:hidden bg-gray-800 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-sm border-t border-gray-700">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-green-400" />
              <span className="font-medium">{deliveryTime}</span>
            </div>
            <span className="text-gray-400 truncate text-xs">{locationName}</span>
          </div>
        )}

      </header>
    </div>
  )
}













// 'use client'
// import { useEffect, useRef, useState, useCallback } from "react"
// import { X, User, MapPin, ChevronDown, Navigation, Truck, Clock } from "lucide-react"
// import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
// import Card from '@/components/Website/Cart'
// import Link from "next/link"
// import { useSelector } from "react-redux"
// import { Avatar, AvatarImage } from "../ui/avatar"
// import { IMAGES } from "@/routes/AllImages"
// import { useRouter } from "next/navigation"
// import { IoSearchOutline } from "react-icons/io5"

// export default function Header() {
//   const [showSearch, setShowSearch] = useState(false)
//   const [query, setQuery] = useState("")
//   const router = useRouter()
//   const [profileOpen, setProfileOpen] = useState(false)
//   const auth = useSelector(store => store.authStore.auth)

//   // Mobile search
//   const [showMobileSearch, setShowMobileSearch] = useState(false)
//   const [mobileQuery, setMobileQuery] = useState("")

//   // Location state
//   const [locationModal, setLocationModal] = useState(false)
//   const [locationName, setLocationName] = useState("")
//   const [manualInput, setManualInput] = useState("")
//   const [locStatus, setLocStatus] = useState({ msg: "", type: "" })
//   const [nearestLabor, setNearestLabor] = useState(null)
//   const [deliveryTime, setDeliveryTime] = useState("30 mins")

//   const profileRef = useRef(null)
//   const locationModalRef = useRef(null)

//   /* Click outside handler */
//   useEffect(() => {
//     const handler = (e) => {
//       if (!(e.target instanceof Node)) return
//       if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
//       if (locationModalRef.current && !locationModalRef.current.contains(e.target)) setLocationModal(false)
//     }
//     document.addEventListener("pointerdown", handler)
//     return () => document.removeEventListener("pointerdown", handler)
//   }, [])

//   const handleSearch = () => {
//     if (query.trim()) router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(query.trim())}`)
//   }

//   const handleMobileSearch = () => {
//     if (mobileQuery.trim()) {
//       router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(mobileQuery.trim())}`)
//       setShowMobileSearch(false)
//     }
//   }

//   /* ── Fetch Nearest Labor ── */
//   const fetchNearestLabor = useCallback(async (latitude, longitude, city) => {
//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch("/api/labor/nearest", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ latitude, longitude, city })
//       })
      
//       if (response.ok) {
//         const data = await response.json()
//         setNearestLabor(data)
//         // Calculate delivery time based on distance
//         if (data.distance) {
//           const time = Math.ceil(data.distance / 2) + 10 // Example: 2km per min + 10 min prep
//           setDeliveryTime(`${Math.min(time, 60)} mins`)
//         }
//       }
//     } catch (error) {
//       console.log("Error fetching nearest labor:", error)
//     }
//   }, [])

//   /* ── Location Handlers ── */
//   const applyLocation = useCallback((name, latitude, longitude, city) => {
//     setLocationName(name)
//     setLocationModal(false)
//     setManualInput("")
//     setLocStatus({ msg: "", type: "" })
    
//     if (latitude && longitude) {
//       fetchNearestLabor(latitude, longitude, city)
//     }
//   }, [fetchNearestLabor])

//   const detectLocation = useCallback(() => {
//     if (!navigator.geolocation) {
//       setLocStatus({ msg: "Geolocation is not supported by your browser.", type: "error" })
//       return
//     }
//     setLocStatus({ msg: "Detecting your location…", type: "loading" })

//     navigator.geolocation.getCurrentPosition(
//       async ({ coords: { latitude, longitude } }) => {
//         setLocStatus({ msg: "Fetching address…", type: "loading" })
//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
//           )
//           const data = await res.json()
//           const addr = data.address
//           const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || "Your Area"
//           const city = addr.city || addr.town || addr.state_district || ""
//           const label = city ? `${area}, ${city}` : area
          
//           setLocStatus({ msg: "Location detected!", type: "success" })
//           setTimeout(() => applyLocation(label, latitude, longitude, city), 600)
//         } catch {
//           setLocStatus({ msg: "Could not fetch address. Please enter manually.", type: "error" })
//         }
//       },
//       (err) => {
//         const msgs = {
//           1: "Location permission denied. Please allow access or enter manually.",
//           2: "Location unavailable. Try again or enter manually.",
//           3: "Request timed out. Please try again.",
//         }
//         setLocStatus({ msg: msgs[err.code] || "Error detecting location.", type: "error" })
//       },
//       { timeout: 8000 }
//     )
//   }, [applyLocation])

//   const confirmManual = useCallback(() => {
//     if (!manualInput.trim()) {
//       setLocStatus({ msg: "Please enter a location first.", type: "error" })
//       return
//     }
//     applyLocation(manualInput.trim(), null, null, null)
//   }, [manualInput, applyLocation])

//   /* ── Status text color ── */
//   const statusColor =
//     locStatus.type === "success" ? "text-green-600"
//       : locStatus.type === "error" ? "text-red-500"
//         : "text-gray-400"

//   return (
//     <div className="sticky top-0 z-50">
//       <header className="relative z-50">

//         {/* ─── MAIN NAV ─── */}
//         <div className="bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
//           <div className="flex items-center justify-between gap-4 lg:gap-6">

//             {/* LEFT: Logo */}
//             <Link href={WEBSITE_HOME} className="font-bold tracking-wide flex-shrink-0">
//               <img src={IMAGES.logo} className="h-10 sm:h-11 lg:h-12 w-auto" alt="Logo" />
//             </Link>

//             {/* CENTER: Location + Search (Hidden on Mobile) */}
//             <div className="hidden lg:flex items-center gap-6 flex-1">

//               {/* ── Location Selector ── */}
//               <div className="relative flex-shrink-0" ref={locationModalRef}>
//                 <button
//                   type="button"
//                   onClick={() => { setLocationModal(v => !v); setLocStatus({ msg: "", type: "" }) }}
//                   className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
//                 >
//                   <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
//                     <MapPin size={18} className="text-green-400" />
//                   </div>
//                   <div className="text-left min-w-0">
//                     <p className="text-[11px] text-gray-400 leading-none mb-1">Delivery in</p>
//                     <p className="text-sm font-bold text-white flex items-center gap-2">
//                       <Clock size={14} className="flex-shrink-0" />
//                       <span className="truncate">{deliveryTime}</span>
//                     </p>
//                     <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
//                       {locationName || "Select location"}
//                     </p>
//                   </div>
//                   <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
//                 </button>

//                 {/* Location Modal */}
//                 {locationModal && (
//                   <div className="absolute top-full left-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-black">
//                     {/* Header */}
//                     <div className="px-6 pt-6 pb-4 border-b border-gray-100">
//                       <p className="font-bold text-gray-900 text-base">Set delivery location</p>
//                       <p className="text-sm text-gray-500 mt-1">We'll show products available in your area</p>
//                     </div>

//                     {/* Auto Detect */}
//                     <button
//                       type="button"
//                       onClick={detectLocation}
//                       className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
//                     >
//                       <span className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
//                         <Navigation size={18} className="text-green-600" />
//                       </span>
//                       <div className="text-left">
//                         <p className="text-base font-semibold text-green-700">Use my current location</p>
//                         <p className="text-sm text-gray-400 mt-0.5">Auto-detect via GPS</p>
//                       </div>
//                     </button>

//                     {/* Manual Input */}
//                     <div className="px-6 py-5">
//                       <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Or enter manually</p>
//                       <input
//                         type="text"
//                         value={manualInput}
//                         onChange={e => setManualInput(e.target.value)}
//                         onKeyDown={e => e.key === "Enter" && confirmManual()}
//                         placeholder="Enter area, street, pincode…"
//                         className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 transition"
//                       />
//                       <button
//                         type="button"
//                         onClick={confirmManual}
//                         className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white text-base font-semibold py-3 rounded-lg transition-colors cursor-pointer"
//                       >
//                         Confirm Location
//                       </button>
//                     </div>

//                     {/* Status */}
//                     {locStatus.msg && (
//                       <p className={`px-6 pb-5 text-sm ${statusColor}`}>
//                         {locStatus.type === "loading" && "⏳ "}
//                         {locStatus.type === "success" && "✅ "}
//                         {locStatus.type === "error" && "⚠️ "}
//                         {locStatus.msg}
//                       </p>
//                     )}

//                     {/* Nearest Labor Info */}
//                     {nearestLabor && (
//                       <div className="px-6 py-4 bg-blue-50 border-t border-gray-100">
//                         <div className="flex items-start gap-3">
//                           <Truck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
//                           <div className="text-left">
//                             <p className="text-sm font-semibold text-blue-900">{nearestLabor.name}</p>
//                             <p className="text-xs text-blue-700 mt-0.5">{nearestLabor.distance?.toFixed(1)} km away</p>
//                             <p className="text-xs text-blue-600 mt-1">Rating: {nearestLabor.rating || "N/A"} ⭐</p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Divider */}
//               <div className="w-px h-10 bg-gray-700 flex-shrink-0" />

//               {/* ── Search Bar ── */}
//               <div className="relative flex items-center flex-1 min-w-0">
//                 <button
//                   type="button"
//                   onClick={() => setShowSearch(!showSearch)}
//                   className="px-5 py-2.5 bg-black text-white rounded-l-full flex items-center gap-2 z-10 cursor-pointer flex-shrink-0 hover:bg-gray-800 transition-colors"
//                 >
//                   <IoSearchOutline size={18} />
//                   <span className="text-sm font-medium">Search</span>
//                 </button>
//                 <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showSearch ? 'w-80 lg:w-[420px]' : 'w-0'}`}>
//                   <div className="relative">
//                     <IoSearchOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//                     <input
//                       type="text"
//                       value={query}
//                       onChange={e => setQuery(e.target.value)}
//                       onKeyDown={e => e.key === "Enter" && handleSearch()}
//                       className="w-full pl-12 pr-5 py-2.5 rounded-r-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
//                       placeholder='Search items...'
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT: Icons */}
//             <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-shrink-0">

//               {/* Mobile Search Icon */}
//               <button
//                 className="flex lg:hidden items-center text-white cursor-pointer hover:text-gray-300 transition-colors"
//                 onClick={() => setShowMobileSearch(!showMobileSearch)}
//                 aria-label="Search"
//               >
//                 <IoSearchOutline size={24} />
//               </button>

//               {/* Mobile Location Icon */}
//               <button
//                 className="flex lg:hidden items-center text-white cursor-pointer hover:text-gray-300 transition-colors"
//                 onClick={() => setLocationModal(v => !v)}
//                 aria-label="Location"
//               >
//                 <MapPin size={22} className={locationName ? "text-green-400" : "text-white"} />
//               </button>

//               {/* Profile / Auth */}
//               <div className="relative flex-shrink-0" ref={profileRef}>
//                 <button
//                   onClick={() => setProfileOpen(!profileOpen)}
//                   className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
//                   aria-label="Profile"
//                 >
//                   {auth ? (
//                     <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
//                       <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
//                     </Avatar>
//                   ) : (
//                     <span className="bg-gray-700 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
//                       <User size={20} />
//                     </span>
//                   )}
//                 </button>

//                 {profileOpen && (
//                   <div className="absolute right-0 mt-4 w-72 sm:w-80 cursor-pointer bg-white text-black rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 z-50">
//                     {!auth ? (
//                       <>
//                         <Link href={WEBSITE_REGISTER}>
//                           <button className="w-full bg-black hover:bg-orange-500 text-white py-3 rounded-xl cursor-pointer mb-3 font-medium transition-colors">
//                             Create Free Account
//                           </button>
//                         </Link>
//                         <Link href={WEBSITE_LOGIN}>
//                           <button className="w-full bg-black text-white py-3 hover:bg-orange-500 rounded-xl cursor-pointer font-medium transition-colors">
//                             Sign In
//                           </button>
//                         </Link>
//                       </>
//                     ) : (
//                       <div className="flex flex-col items-center gap-4">
//                         <Link href={`/profile/${auth.id}`}>
//                           <Avatar className="w-12 h-12">
//                             <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
//                           </Avatar>
//                         </Link>
//                         <span className="font-semibold text-gray-900 text-center">{auth.name}</span>
//                         <Link href={USER_DASHBOARD} className="w-full">
//                           <button className="w-full border-2 py-3 px-4 rounded-xl cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 font-medium">
//                             Dashboard
//                           </button>
//                         </Link>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Cart */}
//               <div className="flex-shrink-0">
//                 <Card className="cursor-pointer" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ─── MOBILE SEARCH BAR ─── */}
//         <div className={`lg:hidden bg-gray-800 px-4 sm:px-6 overflow-hidden transition-all duration-300 ${showMobileSearch ? "max-h-20 py-3 opacity-100" : "max-h-0 opacity-0"}`}>
//           <div className="relative flex items-center">
//             <IoSearchOutline size={18} className="absolute left-4 text-gray-400" />
//             <input
//               type="text"
//               value={mobileQuery}
//               onChange={e => setMobileQuery(e.target.value)}
//               onKeyDown={e => e.key === "Enter" && handleMobileSearch()}
//               className="w-full pl-11 pr-11 py-2.5 rounded-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400"
//               placeholder='Search items...'
//             />
//             {mobileQuery && (
//               <button onClick={() => setMobileQuery("")} className="absolute right-4 text-gray-400 hover:text-gray-600">
//                 <X size={16} />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ─── MOBILE LOCATION SECTION ─── */}
//         {locationName && (
//           <div className="lg:hidden bg-gray-800 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-sm border-t border-gray-700">
//             <div className="flex items-center gap-2">
//               <Clock size={16} className="text-green-400" />
//               <span className="font-medium">{deliveryTime}</span>
//             </div>
//             <span className="text-gray-400 truncate text-xs">{locationName}</span>
//           </div>
//         )}

//       </header>
//     </div>
//   )
// }



























// 'use client'
// import { useEffect, useRef, useState } from "react"
// import {
//   Menu,
//   X,
//   ChevronRight,
//   User,
// } from "lucide-react"
// import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
// import Card from '@/components/Website/Cart'
// import Link from "next/link"
// import { useSelector } from "react-redux"
// import { Avatar, AvatarImage } from "../ui/avatar"
// import { IMAGES } from "@/routes/AllImages"
// import { useRouter } from "next/navigation"
// import { IoSearchOutline } from "react-icons/io5"


// export default function Header() {
//   const [showSearch, setShowSearch] = useState(false)
//   const [query, setQuery] = useState("")
//   const router = useRouter()
//   const [profileOpen, setProfileOpen] = useState(false)
//   const auth = useSelector(store => store.authStore.auth)

//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [activeItem, setActiveItem] = useState(null)

//   // Mobile search state
//   const [showMobileSearch, setShowMobileSearch] = useState(false)
//   const [mobileQuery, setMobileQuery] = useState("")

//   const miniBarRef = useRef(null)
//   const profileRef = useRef(null)


//   /* Click outside handler */
//   useEffect(() => {
//     const handler = (e) => {
//       if (!(e.target instanceof Node)) return
//       if (miniBarRef.current && !miniBarRef.current.contains(e.target)) setOpen(false)
//       if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
//     }
//     document.addEventListener("pointerdown", handler)
//     return () => document.removeEventListener("pointerdown", handler)
//   }, [])

//   const handleSearch = () => {
//     if (query.trim() !== "") {
//       router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(query.trim())}`)
//     }
//   }

//   const handleMobileSearch = () => {
//     if (mobileQuery.trim() !== "") {
//       router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(mobileQuery.trim())}`)
//       setShowMobileSearch(false)
//     }
//   }

//   return (
//     <div className="sticky top-0 z-50">
//       <header className="relative z-50">


//         {/* ─── MAIN NAV ─── */}
//         <div className="bg-gray-900 text-white px-3 md:px-6 py-3 md:py-4 flex justify-between items-center">

//           {/* LEFT: Hamburger + Logo */}
//           <div className="flex items-center gap-3 md:gap-6">
//             {/* Logo */}
//             <Link href={WEBSITE_HOME} className="font-bold tracking-wide shrink-0">
//               <img
//                 src={IMAGES.logo}
//                 className="h-10 w-auto md:h-12"
//                 alt="Logo"
//               />
//             </Link>
//           </div>

//           {/* CENTER: Desktop Search */}

//           <div className="hidden md:flex items-center gap-8 relative">
//            <div className="relative flex items-center">
//                  {/* Toggle Button */}
//                  <button
//                   type="button"
//                   onClick={() => setShowSearch(!showSearch)}
//                   className="px-4 py-2 bg-black text-white rounded-l-full flex items-center gap-2 z-10 cursor-pointer"
//                 >
//                   <IoSearchOutline size={16} />
//                   Search
//                 </button>

//                 {/* Animated search input */}
//                 <div
//                   className={`
//                     overflow-hidden transition-all duration-500 ease-in-out
//                     ${showSearch ? 'w-60 sm:w-[320px] md:w-100 lg:w-125 ml-2' : 'w-0'}
//                   `}
//                 >
//                   <div className="relative">
//                     {/* Search icon inside input */}
//                     <IoSearchOutline
//                       size={16} 
//                       className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
//                     />
//                     <input
//                       type="text"
//                       value={query}
//                       onChange={(e) => setQuery(e.target.value)}
//                       onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                       className="w-full pl-10 pr-4 py-2 rounded-r-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
//                       placeholder="Search products, pages..."
//                     />
//                   </div>
//                 </div>
//               </div>
//               </div>

//           {/* RIGHT: Icons */}
//           <div className="flex items-center gap-2 md:gap-4">

//             {/* Mobile Search Icon */}
//             <button
//               className="flex md:hidden items-center text-white cursor-pointer"
//               onClick={() => setShowMobileSearch(!showMobileSearch)}
//               aria-label="Search"
//             >
//               <IoSearchOutline size={22} />
//             </button>

//             {/* Profile / Auth */}
//             <div className="relative" ref={profileRef}>
//               <button
//                 onClick={() => setProfileOpen(!profileOpen)}
//                 className="flex items-center cursor-pointer"
//                 aria-label="Profile"
//               >
//                 {auth ? (
//                   <Avatar className="w-8 h-8 md:w-8 md:h-8">
//                     <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
//                   </Avatar>
//                 ) : (
//                   <span className="bg-gray-700 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center cursor-pointer">
//                     <User size={18} />
//                   </span>
//                 )}
//               </button>

//               {profileOpen && (
//                 <div className="absolute right-0 mt-5 w-64 md:w-72 cursor-pointer bg-white text-black rounded-2xl shadow-xl border p-5 md:p-6">
//                   {!auth ? (
//                     <>
//                       <Link href={WEBSITE_REGISTER}>
//                         <button className="w-full bg-black hover:bg-orange-500 text-white py-2 rounded-xl cursor-pointer mb-2">
//                           Create Free Account
//                         </button>
//                       </Link>
//                       <Link href={WEBSITE_LOGIN}>
//                         <button className="w-full bg-black text-white py-2 hover:bg-orange-500 rounded-xl cursor-pointer">
//                           Sign In
//                         </button>
//                       </Link>
//                     </>
//                   ) : (
//                     <div className="flex flex-col items-center gap-3 cursor-pointer">
//                       <Link href={`/profile/${auth.id}`}>
//                         <Avatar>
//                           <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
//                         </Avatar>
//                       </Link>
//                       <span className="font-medium">{auth.name}</span>
//                       <Link href={USER_DASHBOARD} className="w-full">
//                         <button className="w-full border py-2 px-4 rounded-xl cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300">
//                           Dashboard
//                         </button>
//                       </Link>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Cart — always visible */}
//             <Card className="cursor-pointer" />
//           </div>
//         </div>

//         {/* ─── MOBILE SEARCH BAR (dropdown) ─── */}
//         <div
//           className={`md:hidden bg-gray-800 px-3 overflow-hidden transition-all duration-300 ${
//             showMobileSearch ? "max-h-16 py-2 opacity-100" : "max-h-0 opacity-0"
//           }`}
//         >
//           <div className="relative flex items-center">
//             <IoSearchOutline size={16} className="absolute left-3 text-gray-400" />
//             <input
//               type="text"
//               value={mobileQuery}
//               onChange={(e) => setMobileQuery(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleMobileSearch()}
//               className="w-full pl-9 pr-10 py-2 rounded-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
//               placeholder="Search products,"
//             />
//             {mobileQuery && (
//               <button
//                 onClick={() => setMobileQuery("")}
//                 className="absolute right-3 text-gray-400"
//               >
//                 <X size={14} />
//               </button>
//             )}
//           </div>
//         </div>

//       </header>


//       {/* ─── SIDEBAR ─── */}
//       <div
//         className={`fixed top-0 left-0 z-50 h-full w-full sm:w-105 md:w-100 bg-white shadow-2xl
//         transform transition-transform duration-500
//         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
        
//       </div>

//     </div>
//   )
// }





