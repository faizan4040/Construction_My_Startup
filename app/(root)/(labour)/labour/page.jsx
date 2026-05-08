"use client"
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import Link from "next/link"
import {
  RiStarFill, RiMapPinLine, RiTimeLine, RiUser3Line,
  RiShieldCheckLine, RiFilterLine, RiCloseLine,
  RiSearchLine, RiArrowRightLine, RiCheckLine,
  RiToolsLine, RiLoader4Line, RiSortDesc
} from "react-icons/ri"

const PROFESSIONS = [
  { value: "",                 label: "All Trades",      icon: "⚡" },
  { value: "Electrician",      label: "Electrician",     icon: "⚡" },
  { value: "Plumber",          label: "Plumber",         icon: "🔧" },
  { value: "Mistri / Mason",   label: "Mistri / Mason",  icon: "🧱" },
  { value: "Carpenter",        label: "Carpenter",       icon: "🪵" },
  { value: "Painter",          label: "Painter",         icon: "🖌️" },
  { value: "Welder",           label: "Welder",          icon: "🔩" },
  { value: "AC Technician",    label: "AC Technician",   icon: "❄️" },
  { value: "Tile Layer",       label: "Tile Layer",      icon: "🪟" },
  { value: "Helper / Labour",  label: "Helper / Labour", icon: "👷" },
]

const RATINGS = [
  { value: 0,   label: "Any"  },
  { value: 3.5, label: "3.5+" },
  { value: 4,   label: "4.0+" },
  { value: 4.5, label: "4.5+" },
]

const SORT_OPTIONS = [
  { value: "rating",    label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc",label: "Price: High to Low" },
  { value: "newest",    label: "Newest First" },
]

export default function AllLabourPage() {
  const [workers, setWorkers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [hasMore, setHasMore]       = useState(false)
  const [search, setSearch]         = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)

  // Filters
  const [profession, setProfession] = useState("")
  const [minRating, setMinRating]   = useState(0)
  const [minRate, setMinRate]       = useState("")
  const [maxRate, setMaxRate]       = useState("")
  const [sort, setSort]             = useState("rating")
  const [city, setCity]             = useState("")

  // Active filter tags
  const activeFilters = [
    profession && { key: "profession", label: profession, clear: () => setProfession("") },
    minRating > 0 && { key: "rating", label: `${minRating}+ Stars`, clear: () => setMinRating(0) },
    (minRate || maxRate) && { key: "rate", label: `₹${minRate||0}–₹${maxRate||"∞"}/hr`, clear: () => { setMinRate(""); setMaxRate("") } },
    city && { key: "city", label: city, clear: () => setCity("") },
  ].filter(Boolean)

  const fetchWorkers = useCallback(async (resetPage = true) => {
    setLoading(true)
    const pg = resetPage ? 1 : page
    try {
      const params = new URLSearchParams({
        limit: 10,
        page: pg,
        ...(profession && { profession }),
        ...(city && { city }),
      })
      const { data } = await axios.get(`/api/labour/all?${params}`)
      let results = Array.isArray(data.profiles) ? data.profiles : []

      // Client-side filter by rating & rate
      if (minRating > 0) results = results.filter(w => (w.rating || 0) >= minRating)
      if (minRate)        results = results.filter(w => (w.hourlyRate || 0) >= parseInt(minRate))
      if (maxRate)        results = results.filter(w => (w.hourlyRate || 0) <= parseInt(maxRate))
      if (search)         results = results.filter(w =>
        `${w.firstName} ${w.lastName} ${w.profession} ${w.city}`.toLowerCase().includes(search.toLowerCase())
      )

      // Sort
      if (sort === "rating")     results.sort((a,b) => (b.rating||0) - (a.rating||0))
      if (sort === "price_asc")  results.sort((a,b) => (a.hourlyRate||0) - (b.hourlyRate||0))
      if (sort === "price_desc") results.sort((a,b) => (b.hourlyRate||0) - (a.hourlyRate||0))

      if (resetPage) {
        setWorkers(results)
        setPage(1)
      } else {
        setWorkers(prev => [...prev, ...results])
      }
      setTotal(data.total || results.length)
      setHasMore(results.length === 10)
    } catch (err) {
      console.error(err)
      setWorkers([])
    } finally {
      setLoading(false)
    }
  }, [profession, city, minRating, minRate, maxRate, search, sort, page])

  useEffect(() => { fetchWorkers(true) }, [profession, city, minRating, minRate, maxRate, search, sort])

  const loadMore = () => {
    setPage(p => p + 1)
    fetchWorkers(false)
  }

  const clearAll = () => {
    setProfession(""); setMinRating(0); setMinRate(""); setMaxRate(""); setCity(""); setSearch(""); setSearchInput("")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]" style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}>

      {/* ── Top Search Bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 max-w-lg">
            <RiSearchLine className="text-gray-400 text-lg shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              placeholder="Search by name, profession, city..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(""); setSearch("") }}>
                <RiCloseLine className="text-gray-400" />
              </button>
            )}
          </form>
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <RiFilterLine /> Filters
            {activeFilters.length > 0 && (
              <span className="bg-white text-orange-500 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="hidden sm:block border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex gap-0 lg:gap-6 px-4 sm:px-8 py-6">

        {/* ── Sidebar Filters ── */}
        {/* Mobile overlay */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setFilterOpen(false)} />
        )}

        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:shadow-none overflow-y-auto transition-transform duration-300
          lg:static lg:w-64 lg:shrink-0 lg:rounded-2xl lg:border lg:border-gray-200 lg:h-fit lg:translate-x-0
          ${filterOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <RiFilterLine className="text-orange-500" /> Filters
              </h2>
              <div className="flex items-center gap-2">
                {activeFilters.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-orange-500 font-bold hover:underline">
                    Reset
                  </button>
                )}
                <button onClick={() => setFilterOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
                  <RiCloseLine className="text-gray-500 text-xl" />
                </button>
              </div>
            </div>

            {/* Profession */}
            <div className="mb-6">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Trade / Profession</p>
              <div className="space-y-1">
                {PROFESSIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => { setProfession(p.value); setFilterOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${profession === p.value
                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                  >
                    <span className="text-base">{p.icon}</span>
                    {p.label}
                    {profession === p.value && <RiCheckLine className="ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="mb-6">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Minimum Rating</p>
              <div className="flex gap-2 flex-wrap">
                {RATINGS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setMinRating(r.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all
                      ${minRating === r.value
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}
                  >
                    {r.value > 0 && <RiStarFill className="text-xs" />}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="mb-6">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">City</p>
              <input
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                placeholder="e.g. Delhi, Mumbai"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>

            {/* Hourly Rate */}
            <div className="mb-6">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Hourly Rate (₹)</p>
              <div className="flex gap-2">
                <input
                  type="number" placeholder="Min"
                  className="w-1/2 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  value={minRate}
                  onChange={e => setMinRate(e.target.value)}
                />
                <input
                  type="number" placeholder="Max"
                  className="w-1/2 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  value={maxRate}
                  onChange={e => setMaxRate(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => { fetchWorkers(true); setFilterOpen(false) }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition text-sm"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-5 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {profession || "All"} <span className="text-orange-500">Professionals</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? "Searching..." : `${workers.length} professionals available`}
              </p>
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="sm:hidden border-2 border-gray-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none"
            >
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Active filter tags */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map(f => (
                <span key={f.key} className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  {f.label}
                  <button onClick={f.clear} className="hover:text-orange-900">
                    <RiCloseLine />
                  </button>
                </span>
              ))}
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-700 font-semibold px-2">
                Clear All
              </button>
            </div>
          )}

          {/* Workers list */}
          {loading && workers.length === 0 ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
              <RiUser3Line className="text-5xl text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No professionals found</p>
              <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
              <button onClick={clearAll} className="mt-4 text-orange-500 text-sm font-bold hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workers.map(worker => {
                const skills = Array.isArray(worker.skills)
                  ? worker.skills.slice(0, 3)
                  : typeof worker.skills === "string"
                  ? worker.skills.split(",").slice(0, 3).map(s => s.trim()).filter(Boolean)
                  : []

                return (
                  <div
                    key={worker._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    <div className="flex gap-0">
                      {/* Image */}
                      <div className="relative w-36 sm:w-44 shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                        {worker.profileImageUrl ? (
                          <img
                            src={worker.profileImageUrl}
                            alt={`${worker.firstName} ${worker.lastName}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center">
                            <RiUser3Line className="text-3xl text-orange-400" />
                          </div>
                        )}
                        {/* Badge */}
                        {worker.isVerified ? (
                          <span className="absolute top-3 left-3 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Verified
                          </span>
                        ) : (
                          <span className="absolute top-3 left-3 bg-orange-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Available
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              {worker.isVerified && (
                                <div className="flex items-center gap-1 mb-1">
                                  <RiShieldCheckLine className="text-blue-500 text-xs" />
                                  <span className="text-blue-500 text-[10px] font-black uppercase tracking-wider">Verified Pro</span>
                                </div>
                              )}
                              <h3 className="font-black text-gray-900 text-lg leading-tight">
                                {worker.firstName} {worker.lastName}
                              </h3>
                              <p className="text-gray-500 text-sm mt-0.5">
                                {worker.profession}
                                {worker.experienceYears > 0 && ` • ${worker.experienceYears} Yrs Exp.`}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-2xl font-black text-orange-500">₹{worker.hourlyRate || 0}</p>
                              <p className="text-xs text-gray-400">/hr</p>
                            </div>
                          </div>

                          {/* Rating + Location */}
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <RiStarFill className="text-orange-500 text-sm" />
                              <span className="font-bold text-gray-800">
                                {worker.rating > 0 ? worker.rating.toFixed(1) : "New"}
                              </span>
                              {worker.reviewCount > 0 && (
                                <span className="text-gray-400 text-xs">({worker.reviewCount} reviews)</span>
                              )}
                            </span>
                            {worker.city && (
                              <span className="flex items-center gap-1 text-gray-500 text-xs">
                                <RiMapPinLine /> {worker.city}
                                {worker.state && `, ${worker.state}`}
                              </span>
                            )}
                          </div>

                          {/* Skills */}
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {skills.map((s, i) => (
                                <span key={i} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                          <Link
                            href={`/labour/profile/${worker.slug || worker._id}`}
                            className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition text-center"
                          >
                            Book Now
                          </Link>
                          <Link
                            href={`/labour/profile/${worker.slug || worker._id}`}
                            className="flex-1 sm:flex-none border-2 border-gray-200 hover:border-orange-300 hover:text-orange-600 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-xl transition text-center"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Load more */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="inline-flex items-center gap-2 border-2 border-gray-200 hover:border-orange-400 hover:text-orange-500 text-gray-600 font-bold px-8 py-3 rounded-xl transition text-sm disabled:opacity-50"
                  >
                    {loading ? <RiLoader4Line className="animate-spin" /> : null}
                    Load More Professionals
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}