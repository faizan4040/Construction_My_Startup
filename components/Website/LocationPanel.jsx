// components/Website/LocationPanel.jsx
// Dropdown: Change Location -> Detect my location / OR / search with suggestions / saved addresses
'use client'
import { useEffect, useState } from "react"
import {
  X, Navigation, Search, MapPin, Loader2, Home, Briefcase, Pencil, Trash2,
  CheckCircle2, AlertCircle, Truck, Star, Map as MapIcon,
} from "lucide-react"
import { addressLine, formatEta, getBestPosition, reverseGeocode, searchPlaces } from "@/lib/geo"
import NoServiceIllustration from "@/components/Website/NoServiceIllustration"

const GPS_ERRORS = {
  0: "Your browser does not support location.",
  1: "Location permission denied. Enable it in your browser settings, or search your address below.",
  2: "Location unavailable. Check your device GPS / internet, or search your address below.",
  3: "Location request timed out. Try again or search your address below.",
}

function TypeIcon({ type, size = 18 }) {
  if (type === "Home") return <Home size={size} />
  if (type === "Office") return <Briefcase size={size} />
  return <MapPin size={size} />
}

export default function LocationPanel({
  active, saved, status, shop, etaMinutes,
  onClose, onSelect, onOpenMap, onDelete,
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState("")
  const [confirmId, setConfirmId] = useState(null)

  const typing = query.trim().length >= 3

  /* Auto-suggestions while typing (debounced) */
  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) {
      setResults([])
      setSearched(false)
      setSearching(false)
      return
    }
    setSearching(true)
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        setResults(await searchPlaces(q, ctrl.signal))
        setSearched(true)
      } catch (e) {
        if (e.name !== "AbortError") {
          setResults([])
          setSearched(true)
        }
      } finally {
        if (!ctrl.signal.aborted) setSearching(false)
      }
    }, 450)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [query])

  /* Detect exact GPS spot -> open the map so the user can fine-tune the pin */
  const handleDetect = async () => {
    setDetecting(true)
    setDetectError("")
    try {
      const pos = await getBestPosition()
      let parsed
      try {
        parsed = await reverseGeocode(pos.lat, pos.lng)
      } catch {
        parsed = { short: "Pinned location", title: "Pinned location", fullAddress: "", city: "", state: "", pincode: "" }
      }
      onOpenMap({ ...parsed, lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy }, "new")
    } catch (err) {
      setDetectError(GPS_ERRORS[err?.code] || "Could not detect location. Please try again.")
    } finally {
      setDetecting(false)
    }
  }

  return (
    <div
      className="fixed left-3 right-3 top-19 z-50 max-h-[85vh] overflow-y-auto
      lg:absolute lg:left-0 lg:right-auto lg:top-full lg:mt-3 lg:w-110
      bg-white text-black rounded-3xl shadow-2xl shadow-black/40 border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h3 className="text-lg font-bold text-gray-900">Change Location</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-5 pb-5">
        {/* Detect + OR + Search in one row like Blinkit */}
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-2.5">
          <button
            type="button"
            onClick={handleDetect}
            disabled={detecting}
            className="sm:w-44 shrink-0 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold
            flex items-center justify-center gap-2 shadow-md shadow-green-600/25 hover:from-green-700 hover:to-emerald-700
            transition-all cursor-pointer disabled:opacity-70 disabled:cursor-wait"
          >
            {detecting ? <Loader2 size={17} className="animate-spin" /> : <Navigation size={17} />}
            {detecting ? "Detecting..." : "Detect my location"}
          </button>

          <span className="self-center text-[11px] font-bold uppercase tracking-widest text-gray-400">or</span>

          <div className="flex-1 min-w-0 h-12 flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/15 transition-all">
            <Search size={17} className="ml-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search delivery location"
              className="flex-1 min-w-0 h-full bg-transparent px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            {searching ? (
              <Loader2 size={16} className="mr-3 text-gray-400 animate-spin" />
            ) : (
              query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="mr-3 text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X size={15} />
                </button>
              )
            )}
          </div>
        </div>

        {detecting && (
          <p className="mt-2.5 text-xs text-gray-500">Getting a precise GPS fix — this can take a few seconds...</p>
        )}
        {detectError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-700">{detectError}</p>
              <button
                type="button"
                onClick={() => onOpenMap({}, "new")}
                className="mt-1.5 text-xs font-semibold text-red-700 underline cursor-pointer"
              >
                Choose on map instead
              </button>
            </div>
          </div>
        )}

        {/* ── Suggestions ── */}
        {typing && (
          <div className="mt-3">
            {searched && !searching && results.length === 0 ? (
              <div className="flex flex-col items-center text-center py-6 px-4 rounded-2xl bg-gray-50 border border-gray-100">
                <NoServiceIllustration />
                <p className="mt-2 text-lg font-extrabold text-gray-900">Oops!</p>
                <p className="mt-1 text-sm text-gray-500 max-w-xs">
                  We couldn't find this location. Please try a different area, street or pincode.
                </p>
              </div>
            ) : (
              <ul className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(r)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-green-50 transition-colors cursor-pointer"
                    >
                      <MapPin size={17} className="mt-0.5 shrink-0 text-gray-400" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-900 truncate">{r.short}</span>
                        <span className="block text-xs text-gray-500 truncate">{r.fullAddress}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Current delivery status ── */}
        {!typing && active && (
          <div className="mt-4">
            {status === "unserviceable" ? (
              <div className="flex flex-col items-center text-center py-5 px-4 rounded-2xl bg-red-50/60 border border-red-100">
                <NoServiceIllustration />
                <p className="mt-2 text-lg font-extrabold text-gray-900">Oops!</p>
                <p className="mt-1 text-sm text-gray-600 max-w-xs">
                  We're not available at this location at the moment. Please select a different location.
                </p>
              </div>
            ) : status === "checking" ? (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-sm font-medium text-blue-700">
                <Loader2 size={17} className="animate-spin" /> Finding nearest shop...
              </div>
            ) : status === "ok" && shop ? (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Truck size={18} className="text-blue-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-blue-900 truncate">{shop.name}</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    {Number(shop.distance).toFixed(1)} km away · delivery in{" "}
                    <b>{formatEta(etaMinutes)}</b>
                  </p>
                </div>
                {shop.rating ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 shrink-0">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    {shop.rating}
                  </span>
                ) : null}
              </div>
            ) : status === "error" ? (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-sm font-medium text-amber-800">
                <AlertCircle size={17} /> Couldn't check delivery time right now.
              </div>
            ) : null}
          </div>
        )}

        {/* ── Saved addresses ── */}
        {!typing && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Saved addresses</p>
              <button
                type="button"
                onClick={() => onOpenMap({}, "new")}
                className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 cursor-pointer"
              >
                <MapIcon size={13} /> Pin on map
              </button>
            </div>

            {saved.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center rounded-xl border border-dashed border-gray-200">
                No saved addresses yet. Pick a location above and it will be saved here.
              </p>
            ) : (
              <ul className="space-y-2">
                {saved.map((a) => {
                  const isActive = active?.id === a.id
                  const confirming = confirmId === a.id
                  return (
                    <li
                      key={a.id}
                      className={`rounded-2xl border-2 transition-all ${
                        isActive ? "border-green-500 bg-green-50/60" : "border-gray-100 hover:border-gray-200 bg-white"
                      }`}
                    >
                      {confirming ? (
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                          <p className="text-sm font-medium text-gray-700">Delete this address?</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className="px-3 h-8 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDelete(a.id)
                                setConfirmId(null)
                              }}
                              className="px-3 h-8 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pr-2">
                          <button
                            type="button"
                            onClick={() => onSelect(a)}
                            className="flex flex-1 min-w-0 items-start gap-3 p-3 text-left cursor-pointer"
                          >
                            <span
                              className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isActive ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <TypeIcon type={a.type} />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                                {a.label || "Address"}
                                {isActive && <CheckCircle2 size={14} className="text-green-600" />}
                              </span>
                              <span className="block text-xs text-gray-500 line-clamp-2">{addressLine(a)}</span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenMap(a, "edit")}
                            aria-label="Edit address"
                            title="Edit"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(a.id)}
                            aria-label="Delete address"
                            title="Delete"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}