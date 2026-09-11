'use client'
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ChevronDown, Menu } from "lucide-react"
import { WEBSITE_HOME } from "@/routes/WebsiteRoute"

const ITEMS_PER_COLUMN = 10

export default function CategoryMiniNavbar() {
  const [categories, setCategories] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const wrapRef = useRef(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/category/get-category")
        if (data.success) {
          const all = data.data
          const topLevel = all.filter((cat) => !cat.parent)

          const withChildren = topLevel.map((top) => ({
            ...top,
            children: all.filter((cat) => cat.parent === top._id),
          }))

          setCategories(withChildren)
        }
      } catch (error) {
        console.log("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (!(e.target instanceof Node)) return
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenIndex(null)
      }
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpenIndex(null)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [])

  const goToShop = (slug) => {
    setOpenIndex(null)
    setMobileOpen(false)
    router.push(`${WEBSITE_HOME}?category=${slug}`)
  }

  if (!categories.length) return null

  return (
    <div ref={wrapRef} className="bg-gray-800 text-white border-t border-gray-700 relative z-40">
      <div className="px-4 sm:px-6 lg:px-8">

        {/* ── Desktop ── */}
        <ul className="hidden lg:flex items-center gap-1">
          {categories.map((cat, index) => {
            const hasChildren = cat.children?.length > 0
            const columnCount = hasChildren
              ? Math.ceil(cat.children.length / ITEMS_PER_COLUMN)
              : 1
            const isOpen = openIndex === index

            return (
              <li key={cat._id} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    hasChildren
                      ? setOpenIndex(isOpen ? null : index)
                      : goToShop(cat.slug)
                  }
                  className={`group relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium cursor-pointer transition-colors duration-200 ${
                    isOpen ? "text-orange-400 bg-gray-700/70" : "hover:text-orange-400 hover:bg-gray-700/50"
                  }`}
                >
                  {cat.name}
                  {hasChildren && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                  {/* animated underline */}
                  <span
                    className={`pointer-events-none absolute left-4 right-4 bottom-1.5 h-[2px] bg-orange-400 origin-left transition-transform duration-300 ease-out ${
                      isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </button>

                {hasChildren && (
                  <div
                    className={`absolute top-full left-0 bg-white text-black rounded-b-xl shadow-2xl border border-gray-100 z-50 overflow-hidden transition-all duration-300 ease-out origin-top ${
                      isOpen
                        ? "opacity-100 translate-y-0 scale-y-100 pointer-events-auto"
                        : "opacity-0 -translate-y-2 scale-y-95 pointer-events-none"
                    }`}
                    style={{ minWidth: columnCount > 1 ? `${columnCount * 220}px` : "220px" }}
                  >
                    <div
                      className="grid py-2 px-1"
                      style={{
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${Math.min(cat.children.length, ITEMS_PER_COLUMN)}, auto)`,
                        gridAutoFlow: "column",
                      }}
                    >
                      {cat.children.map((sub, subIdx) => (
                        <button
                          key={sub._id}
                          type="button"
                          onClick={() => goToShop(sub.slug)}
                          style={{ transitionDelay: isOpen ? `${(subIdx % ITEMS_PER_COLUMN) * 15}ms` : "0ms" }}
                          className={`w-full text-left px-4 py-2.5 text-sm rounded-md mx-1 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 ease-out ${
                            isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {/* ── Mobile: "All Categories" toggle + accordion ── */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="w-full flex items-center gap-2 py-3 text-sm font-medium cursor-pointer"
          >
            <Menu size={16} />
            All Categories
            <ChevronDown size={14} className={`ml-auto transition-transform duration-300 ${mobileOpen ? "rotate-180" : ""}`} />
          </button>

          <div
            className={`grid transition-all duration-300 ease-out ${
              mobileOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pb-3 border-t border-gray-700">
                {categories.map((cat, index) => {
                  const hasChildren = cat.children?.length > 0
                  const isOpen = openIndex === index
                  return (
                    <div key={cat._id} className="border-b border-gray-700 last:border-b-0">
                      <button
                        type="button"
                        onClick={() =>
                          hasChildren
                            ? setOpenIndex(isOpen ? null : index)
                            : goToShop(cat.slug)
                        }
                        className="w-full flex items-center justify-between py-2.5 text-sm cursor-pointer"
                      >
                        {cat.name}
                        {hasChildren && (
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>
                      {hasChildren && (
                        <div
                          className={`grid transition-all duration-300 ease-out ${
                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="pl-4 pb-2 grid grid-cols-2 gap-x-2">
                              {cat.children.map((sub) => (
                                <button
                                  key={sub._id}
                                  type="button"
                                  onClick={() => goToShop(sub.slug)}
                                  className="block w-full text-left py-2 text-sm text-gray-300 hover:text-orange-400 transition-colors"
                                >
                                  {sub.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}