'use client'
import { useEffect, useRef, useState } from "react"
import {
  Menu,
  X,
  ChevronRight,
  User,
} from "lucide-react"
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

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  // Mobile search state
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [mobileQuery, setMobileQuery] = useState("")

  const miniBarRef = useRef(null)
  const profileRef = useRef(null)


  /* Click outside handler */
  useEffect(() => {
    const handler = (e) => {
      if (!(e.target instanceof Node)) return
      if (miniBarRef.current && !miniBarRef.current.contains(e.target)) setOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  const handleSearch = () => {
    if (query.trim() !== "") {
      router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleMobileSearch = () => {
    if (mobileQuery.trim() !== "") {
      router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(mobileQuery.trim())}`)
      setShowMobileSearch(false)
    }
  }

  return (
    <div className="sticky top-0 z-50">
      <header className="relative z-50">


        {/* ─── MAIN NAV ─── */}
        <div className="bg-gray-900 text-white px-3 md:px-6 py-3 md:py-4 flex justify-between items-center">

          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Logo */}
            <Link href={WEBSITE_HOME} className="font-bold tracking-wide shrink-0">
              <img
                src={IMAGES.logo}
                className="h-10 w-auto md:h-12"
                alt="Logo"
              />
            </Link>
          </div>

          {/* CENTER: Desktop Search */}

          <div className="hidden md:flex items-center gap-8 relative">
           <div className="relative flex items-center">
                 {/* Toggle Button */}
                 <button
                  type="button"
                  onClick={() => setShowSearch(!showSearch)}
                  className="px-4 py-2 bg-black text-white rounded-l-full flex items-center gap-2 z-10 cursor-pointer"
                >
                  <IoSearchOutline size={16} />
                  Search
                </button>

                {/* Animated search input */}
                <div
                  className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${showSearch ? 'w-60 sm:w-[320px] md:w-100 lg:w-125 ml-2' : 'w-0'}
                  `}
                >
                  <div className="relative">
                    {/* Search icon inside input */}
                    <IoSearchOutline
                      size={16} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 rounded-r-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Search products, pages..."
                    />
                  </div>
                </div>
              </div>
              </div>

          {/* RIGHT: Icons */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* Mobile Search Icon */}
            <button
              className="flex md:hidden items-center text-white cursor-pointer"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Search"
            >
              <IoSearchOutline size={22} />
            </button>

            {/* Profile / Auth */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center cursor-pointer"
                aria-label="Profile"
              >
                {auth ? (
                  <Avatar className="w-8 h-8 md:w-8 md:h-8">
                    <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                  </Avatar>
                ) : (
                  <span className="bg-gray-700 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center cursor-pointer">
                    <User size={18} />
                  </span>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-5 w-64 md:w-72 cursor-pointer bg-white text-black rounded-2xl shadow-xl border p-5 md:p-6">
                  {!auth ? (
                    <>
                      <Link href={WEBSITE_REGISTER}>
                        <button className="w-full bg-black hover:bg-orange-500 text-white py-2 rounded-xl cursor-pointer mb-2">
                          Create Free Account
                        </button>
                      </Link>
                      <Link href={WEBSITE_LOGIN}>
                        <button className="w-full bg-black text-white py-2 hover:bg-orange-500 rounded-xl cursor-pointer">
                          Sign In
                        </button>
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 cursor-pointer">
                      <Link href={`/profile/${auth.id}`}>
                        <Avatar>
                          <AvatarImage src={auth?.avatar?.url || IMAGES.profile} />
                        </Avatar>
                      </Link>
                      <span className="font-medium">{auth.name}</span>
                      <Link href={USER_DASHBOARD} className="w-full">
                        <button className="w-full border py-2 px-4 rounded-xl cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300">
                          Dashboard
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart — always visible */}
            <Card className="cursor-pointer" />
          </div>
        </div>

        {/* ─── MOBILE SEARCH BAR (dropdown) ─── */}
        <div
          className={`md:hidden bg-gray-800 px-3 overflow-hidden transition-all duration-300 ${
            showMobileSearch ? "max-h-16 py-2 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="relative flex items-center">
            <IoSearchOutline size={16} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMobileSearch()}
              className="w-full pl-9 pr-10 py-2 rounded-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Search products,"
            />
            {mobileQuery && (
              <button
                onClick={() => setMobileQuery("")}
                className="absolute right-3 text-gray-400"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

      </header>


      {/* ─── SIDEBAR ─── */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-full sm:w-105 md:w-100 bg-white shadow-2xl
        transform transition-transform duration-500
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        
      </div>

    </div>
  )
}





