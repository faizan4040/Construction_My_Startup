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
import { categories } from "@/routes/MenuCategories"

const ads = [
  "SHOP NOW, PAY WITH KLARNA",
  "FREE DELIVERY ON ORDERS OVER £100",
  "JOIN ULTRA & GET EXCLUSIVE BENEFITS",
]

export default function Header() {
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const auth = useSelector(store => store.authStore.auth)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  // Mobile search state
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [mobileQuery, setMobileQuery] = useState("")

  const handleCategoryClick = (category) => {
    setActiveCategory(category)
    setActiveItem(category)
    setSidebarOpen(true)
  }

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
            {/* Hamburger — always visible on mobile, visible on lg+ for desktop */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center text-white cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href={WEBSITE_HOME} className="font-bold tracking-wide shrink-0">
              <img
                src={IMAGES.logo}
                className="h-9 w-auto md:h-9"
                alt="Logo"
              />
            </Link>
          </div>

          {/* CENTER: Desktop Search */}
          {/* <div className="hidden md:flex items-center gap-8">
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="px-4 py-2 bg-black text-white rounded-l-full flex items-center gap-2 z-10 cursor-pointer"
              >
                <IoSearchOutline size={16} />
                Search
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${showSearch ? 'w-60 sm:w-[320px] md:w-80 lg:w-96 ml-2' : 'w-0'}`}
              >
                <div className="relative">
                  <IoSearchOutline size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 rounded-r-full text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Search products, categories, pages..."
                  />
                </div>
              </div>
            </div>
          </div> */}
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
                      placeholder="Search products, categories, pages..."
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
              placeholder="Search products, categories..."
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

      {/* ─── OVERLAY ─── */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          sidebarOpen ? "bg-black/40 visible" : "invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ─── SIDEBAR ─── */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-full sm:w-105 md:w-100 bg-white shadow-2xl
        transform transition-transform duration-500
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b">
          <h3 className="font-semibold text-base md:text-lg">Menu</h3>
          <button onClick={() => setSidebarOpen(false)} className="cursor-pointer">
            <X size={22} />
          </button>
        </div>

        <div className="flex h-[calc(100%-65px)]">
          {/* LEFT CATEGORY LIST */}
          <div className="w-1/3 border-r overflow-y-auto p-2 md:p-4 space-y-1">
            {categories.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveItem(item)
                  setActiveCategory(item.name)
                }}
                className={`w-full flex justify-between items-center py-2 px-2 rounded-lg text-left transition-colors ${
                  activeItem?.name === item.name ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-sm md:text-base font-medium truncate pr-1">{item.name}</span>
                <ChevronRight size={16} className="shrink-0" />
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT */}
          <div className="w-2/3 p-3 md:p-4 overflow-y-auto">
            {!activeItem ? (
              <p className="text-gray-400 text-sm mt-4">Select a category</p>
            ) : (
              activeItem.sections?.map((section) => (
                <div key={section.title} className="mb-5">
                  <h4 className="font-semibold text-sm md:text-base mb-2 text-gray-800">{section.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.items.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.link}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="text-xs md:text-sm text-gray-600 hover:text-black hover:underline cursor-pointer">
                          {sub.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── CATEGORY BAR (Desktop only) ─── */}
      <nav className="hidden md:block border-t bg-white">
        <ul className="flex gap-6 px-6 py-3 text-sm font-medium overflow-x-auto scrollbar-hide">
          {categories.map((item) => (
            <li
              key={item.name}
              onClick={() => handleCategoryClick(item)}
              className={`cursor-pointer whitespace-nowrap relative pb-0.5 ${
                activeCategory === item.name ? "font-semibold" : ""
              }`}
            >
              {item.name}
              {activeCategory === item.name && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-black" />
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}





