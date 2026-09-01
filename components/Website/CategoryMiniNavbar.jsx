'use client'
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ChevronDown, Menu } from "lucide-react"
import { WEBSITE_HOME } from "@/routes/WebsiteRoute"

export default function CategoryMiniNavbar() {
  const [categories, setCategories] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const wrapRef = useRef(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // real, shared category API — same one Admin's category page and
        // the shop-owner Add Product page use. Returns a FLAT list
        // ({ _id, name, slug, parent }), so we build the parent/child
        // tree here on the client.
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
          {categories.map((cat, index) => (
            <li key={cat._id} className="relative">
              <button
                type="button"
                onClick={() =>
                  cat.children?.length
                    ? setOpenIndex(openIndex === index ? null : index)
                    : goToShop(cat.slug)
                }
                className={`flex items-center gap-1 px-4 py-3 text-sm font-medium hover:bg-gray-700 hover:text-orange-400 transition-colors cursor-pointer ${
                  openIndex === index ? "bg-gray-700 text-orange-400" : ""
                }`}
              >
                {cat.name}
                {cat.children?.length > 0 && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {cat.children?.length > 0 && openIndex === index && (
                <div className="absolute top-full left-0 min-w-[220px] bg-white text-black rounded-b-lg shadow-2xl border border-gray-100 py-2 z-50">
                  {cat.children.map((sub) => (
                    <button
                      key={sub._id}
                      type="button"
                      onClick={() => goToShop(sub.slug)}
                      className="w-full text-left px-5 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
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
            <ChevronDown size={14} className={`ml-auto transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
          </button>

          {mobileOpen && (
            <div className="pb-3 border-t border-gray-700">
              {categories.map((cat, index) => (
                <div key={cat._id} className="border-b border-gray-700 last:border-b-0">
                  <button
                    type="button"
                    onClick={() =>
                      cat.children?.length
                        ? setOpenIndex(openIndex === index ? null : index)
                        : goToShop(cat.slug)
                    }
                    className="w-full flex items-center justify-between py-2.5 text-sm cursor-pointer"
                  >
                    {cat.name}
                    {cat.children?.length > 0 && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {cat.children?.length > 0 && openIndex === index && (
                    <div className="pl-4 pb-2">
                      {cat.children.map((sub) => (
                        <button
                          key={sub._id}
                          type="button"
                          onClick={() => goToShop(sub.slug)}
                          className="block w-full text-left py-2 text-sm text-gray-300 hover:text-orange-400 cursor-pointer"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}