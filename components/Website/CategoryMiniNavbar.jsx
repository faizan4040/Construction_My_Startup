'use client'
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ChevronDown, ChevronRight, LayoutGrid, Calculator } from "lucide-react"
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

  const goToCalculator = () => {
    setOpenIndex(null)
    setMobileOpen(false)
    router.push("/cost-calculator")
  }

  if (!categories.length) return null

  /* ── Cost Calculator icon button (icon only) ── */
  const CalculatorButton = ({ size = "lg" }) => (
    <button
      type="button"
      onClick={goToCalculator}
      aria-label="Cost Calculator"
      title="Cost Calculator"
      className={`group/calc relative shrink-0 cursor-pointer ${size === "lg" ? "w-10 h-10" : "w-9 h-9"}`}
    >
      {/* soft pulsing halo */}
      <span className="absolute inset-0 rounded-xl bg-orange-500/40 animate-ping animation-duration-[2.5s]" />
      {/* glow */}
      <span className="absolute -inset-1 rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 opacity-30 blur-md transition-opacity duration-300 group-hover/calc:opacity-70" />
      {/* button face */}
      <span
        className="relative w-full h-full rounded-xl flex items-center justify-center overflow-hidden
        bg-linear-to-br from-orange-500 via-orange-500 to-amber-500 border border-white/20
        shadow-lg shadow-orange-500/30 text-white
        transition-all duration-300 group-hover/calc:-translate-y-0.5 group-hover/calc:shadow-orange-500/50 group-active/calc:scale-95"
      >
        {/* shine sweep */}
        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/40 blur-sm transition-all duration-700 group-hover/calc:left-[150%]" />
        <Calculator
          size={size === "lg" ? 19 : 17}
          strokeWidth={2.3}
          className="relative transition-transform duration-300 group-hover/calc:rotate-12 group-hover/calc:scale-110"
        />
      </span>
    </button>
  )

  return (
    <div
      ref={wrapRef}
      className="relative z-40 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-t border-white/5 border-b border-b-black/30 shadow-lg shadow-black/10"
    >
      <div className="px-4 sm:px-6 lg:px-8">

        {/* ── Desktop ── */}
        <div className="hidden lg:flex items-center justify-between gap-6 py-1.5">
          <ul className="flex items-center gap-1 flex-wrap">
            {categories.map((cat, index) => {
              const hasChildren = cat.children?.length > 0
              const columnCount = hasChildren
                ? Math.ceil(cat.children.length / ITEMS_PER_COLUMN)
                : 1
              const isOpen = openIndex === index
              const alignRight = categories.length > 4 && index >= categories.length - 2

              return (
                <li key={cat._id} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      hasChildren
                        ? setOpenIndex(isOpen ? null : index)
                        : goToShop(cat.slug)
                    }
                    className={`group relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 ${
                      isOpen
                        ? "text-white bg-linear-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat.name}
                    {hasChildren && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : "text-gray-400 group-hover:text-white"}`}
                      />
                    )}
                  </button>

                  {hasChildren && (
                    <div
                      className={`absolute top-full mt-3 ${alignRight ? "right-0" : "left-0"} bg-white text-black rounded-2xl shadow-2xl shadow-black/30 border border-gray-100 z-50 transition-all duration-300 ease-out origin-top ${
                        isOpen
                          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                          : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                      }`}
                      style={{ minWidth: columnCount > 1 ? `${columnCount * 230}px` : "240px" }}
                    >
                      {/* notch */}
                      <span
                        className={`absolute -top-1.5 ${alignRight ? "right-8" : "left-8"} w-3 h-3 rotate-45 bg-white border-l border-t border-gray-100`}
                      />

                      {/* dropdown header */}
                      <div className="relative flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-100 rounded-t-2xl bg-linear-to-r from-orange-50 to-white">
                        <span className="w-1.5 h-5 rounded-full bg-linear-to-b from-orange-500 to-amber-400" />
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-700">{cat.name}</p>
                        <span className="ml-auto text-[11px] font-semibold text-orange-600 bg-orange-100 rounded-full px-2 py-0.5">
                          {cat.children.length}
                        </span>
                      </div>

                      <div
                        className="grid p-2"
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
                            style={{ transitionDelay: isOpen ? `${(subIdx % ITEMS_PER_COLUMN) * 18}ms` : "0ms" }}
                            className={`group/item flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 ease-out cursor-pointer ${
                              isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/item:bg-orange-500 group-hover/item:scale-125 transition-all shrink-0" />
                            <span className="flex-1 truncate">{sub.name}</span>
                            <ChevronRight
                              size={14}
                              className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all shrink-0"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Cost Calculator (icon only) */}
          <CalculatorButton size="lg" />
        </div>

        {/* ── Mobile ── */}
        <div className="lg:hidden">
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={`flex-1 flex items-center gap-2.5 h-10 px-3.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-300 ${
                mobileOpen
                  ? "bg-linear-to-r from-orange-500 to-amber-500 border-orange-400 text-white shadow-lg shadow-orange-500/25"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <LayoutGrid size={17} />
              All Categories
              <ChevronDown
                size={15}
                className={`ml-auto transition-transform duration-300 ${mobileOpen ? "rotate-180" : ""}`}
              />
            </button>

            <CalculatorButton size="md" />
          </div>

          <div
            className={`grid transition-all duration-300 ease-out ${
              mobileOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pb-3 space-y-2">
                {categories.map((cat, index) => {
                  const hasChildren = cat.children?.length > 0
                  const isOpen = openIndex === index
                  return (
                    <div
                      key={cat._id}
                      className={`rounded-2xl border transition-colors duration-300 ${
                        isOpen ? "bg-white/10 border-orange-400/40" : "bg-white/5 border-white/5"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          hasChildren
                            ? setOpenIndex(isOpen ? null : index)
                            : goToShop(cat.slug)
                        }
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer"
                      >
                        <span className={isOpen ? "text-orange-400" : ""}>{cat.name}</span>
                        {hasChildren ? (
                          <ChevronDown
                            size={15}
                            className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-400" : "text-gray-400"}`}
                          />
                        ) : (
                          <ChevronRight size={15} className="text-gray-400" />
                        )}
                      </button>

                      {hasChildren && (
                        <div
                          className={`grid transition-all duration-300 ease-out ${
                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="px-3 pb-3 flex flex-wrap gap-2">
                              {cat.children.map((sub) => (
                                <button
                                  key={sub._id}
                                  type="button"
                                  onClick={() => goToShop(sub.slug)}
                                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-200 bg-white/10 border border-white/10 hover:bg-orange-500 hover:border-orange-500 hover:text-white active:scale-95 transition-all cursor-pointer"
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