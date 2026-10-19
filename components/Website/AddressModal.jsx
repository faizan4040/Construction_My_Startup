// components/Website/AddressModal.jsx
// Popup card: map on the left (pin the exact spot), address form on the right.
'use client'
import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import {
  X, Search, Loader2, Crosshair, Home, Briefcase, MapPin, AlertCircle, CheckCircle2,
} from "lucide-react"
import { reverseGeocode, searchPlaces, getBestPosition, DEFAULT_MAP_CENTER, makeId } from "@/lib/geo"

const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
      <Loader2 size={18} className="mr-2 animate-spin" /> Loading map...
    </div>
  ),
})

const TYPES = [
  { id: "Home", Icon: Home },
  { id: "Office", Icon: Briefcase },
  { id: "Other", Icon: MapPin },
]

const inputCls = (err) =>
  `w-full h-11 rounded-xl border px-3.5 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
    err
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
      : "border-gray-200 focus:border-green-500 focus:ring-green-500/15"
  }`

export default function AddressModal({ initial, mode = "new", onSave, onClose }) {
  const hasCoords = initial?.lat != null
  const startCenter = hasCoords ? { lat: initial.lat, lng: initial.lng } : DEFAULT_MAP_CENTER
  const startZoom = hasCoords ? 17 : DEFAULT_MAP_CENTER.zoom

  const [coords, setCoords] = useState(hasCoords ? { lat: initial.lat, lng: initial.lng } : null)
  const [resolved, setResolved] = useState(hasCoords ? initial : null)
  const [resolving, setResolving] = useState(false)
  const [focus, setFocus] = useState(null)

  const [type, setType] = useState(initial?.type || "Home")
  const [customLabel, setCustomLabel] = useState(initial?.type === "Other" ? initial.label || "" : "")
  const [form, setForm] = useState({
    house: initial?.house || "",
    building: initial?.building || "",
    landmark: initial?.landmark || "",
    name: initial?.name || "",
    phone: initial?.phone || "",
  })
  const [errors, setErrors] = useState({})

  // search on the map
  const [mq, setMq] = useState("")
  const [mResults, setMResults] = useState([])
  const [mSearching, setMSearching] = useState(false)

  const [locating, setLocating] = useState(false)
  const [mapMsg, setMapMsg] = useState("")

  /* Lock page scroll + Esc to close */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  /* Map moved -> remember new centre (ignore when zoomed far out) */
  const handleMove = useCallback((lat, lng, zoom) => {
    if (zoom < 14) {
      setCoords(null)
      setResolved(null)
      setResolving(false)
      return
    }
    setCoords({ lat, lng })
  }, [])

  /* New centre -> find its address (debounced) */
  useEffect(() => {
    if (!coords) return
    if (resolved && Math.abs(resolved.lat - coords.lat) < 1e-6 && Math.abs(resolved.lng - coords.lng) < 1e-6) return

    setResolving(true)
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const r = await reverseGeocode(coords.lat, coords.lng, ctrl.signal)
        setResolved({ ...r, lat: coords.lat, lng: coords.lng })
      } catch (e) {
        if (e.name === "AbortError") return
        setResolved({
          short: "Pinned location",
          title: "Pinned location",
          fullAddress: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
          city: "",
          state: "",
          pincode: "",
          lat: coords.lat,
          lng: coords.lng,
        })
      } finally {
        if (!ctrl.signal.aborted) setResolving(false)
      }
    }, 500)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords])

  /* Search box on the map */
  useEffect(() => {
    const q = mq.trim()
    if (q.length < 3) {
      setMResults([])
      setMSearching(false)
      return
    }
    setMSearching(true)
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        setMResults(await searchPlaces(q, ctrl.signal))
      } catch (e) {
        if (e.name !== "AbortError") setMResults([])
      } finally {
        if (!ctrl.signal.aborted) setMSearching(false)
      }
    }, 450)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [mq])

  const pickResult = (r) => {
    setFocus({ lat: r.lat, lng: r.lng, ts: Date.now() })
    setMq("")
    setMResults([])
    setMapMsg("")
  }

  const locateMe = async () => {
    setLocating(true)
    setMapMsg("")
    try {
      const pos = await getBestPosition()
      setFocus({ lat: pos.lat, lng: pos.lng, ts: Date.now() })
    } catch (err) {
      setMapMsg(
        err?.code === 1
          ? "Location permission denied. Allow it in browser settings or search / move the map manually."
          : "Could not get your location. Search or move the map manually."
      )
    } finally {
      setLocating(false)
    }
  }

  const setField = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = () => {
    const e = {}
    if (!resolved || !coords) e.map = "Please pin your delivery location on the map."
    if (!form.house.trim()) e.house = "House / flat / shop number is required."
    if (type === "Other" && !customLabel.trim()) e.label = "Give this address a name."
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number."
    setErrors(e)
    if (Object.keys(e).length) return

    onSave({
      id: initial?.id || makeId(),
      type,
      label: type === "Other" ? customLabel.trim() : type,
      lat: coords.lat,
      lng: coords.lng,
      title: resolved.title,
      short: resolved.short,
      fullAddress: resolved.fullAddress,
      city: resolved.city,
      state: resolved.state,
      pincode: resolved.pincode,
      house: form.house.trim(),
      building: form.building.trim(),
      landmark: form.landmark.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
    })
  }

  const modal = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white text-black shadow-2xl lg:h-[660px] lg:flex-row">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-[1100] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-100 hover:text-black"
        >
          <X size={18} />
        </button>

        {/* ───── LEFT: MAP ───── */}
        <div className="relative h-[40%] shrink-0 lg:h-auto lg:w-1/2">
          <LocationMap center={startCenter} zoom={startZoom} focus={focus} onMoveEnd={handleMove} />

          {/* search on map */}
          <div className="absolute left-3 right-14 top-3 z-[1100]">
            <div className="flex h-11 items-center rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-green-500">
              <Search size={17} className="ml-3.5 shrink-0 text-gray-400" />
              <input
                value={mq}
                onChange={(e) => setMq(e.target.value)}
                placeholder="Search area, street, landmark..."
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              {mSearching && <Loader2 size={16} className="mr-3 animate-spin text-gray-400" />}
            </div>
            {mq.trim().length >= 3 && !mSearching && (
              <div className="mt-1.5 max-h-56 overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-black/5">
                {mResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500">No places found.</p>
                ) : (
                  mResults.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => pickResult(r)}
                      className="flex w-full cursor-pointer items-start gap-2.5 border-b border-gray-50 px-3.5 py-2.5 text-left last:border-0 hover:bg-green-50"
                    >
                      <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900">{r.short}</span>
                        <span className="block truncate text-xs text-gray-500">{r.fullAddress}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* locate me */}
          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            className="absolute right-3 top-1/2 z-[1100] flex h-10 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-semibold text-green-700 shadow-lg ring-1 ring-black/5 hover:bg-green-50 disabled:opacity-60"
          >
            {locating ? <Loader2 size={15} className="animate-spin" /> : <Crosshair size={15} />}
            My location
          </button>

          {/* resolved address card */}
          <div className="absolute bottom-3 left-3 right-16 z-[1100] rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5">
            {mapMsg ? (
              <p className="flex items-start gap-2 text-xs font-medium text-red-600">
                <AlertCircle size={15} className="mt-0.5 shrink-0" /> {mapMsg}
              </p>
            ) : resolving ? (
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={15} className="animate-spin" /> Finding address...
              </p>
            ) : resolved ? (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                  <MapPin size={16} className="text-green-600" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{resolved.short}</p>
                  <p className="line-clamp-2 text-xs text-gray-500">{resolved.fullAddress}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Zoom in and move the map to place the pin on your exact house.</p>
            )}
          </div>
        </div>

        {/* ───── RIGHT: FORM ───── */}
        <div className="flex min-h-0 flex-1 flex-col lg:w-1/2">
          <div className="shrink-0 border-b border-gray-100 px-6 pb-4 pt-5 lg:pr-16">
            <h2 className="text-lg font-bold text-gray-900">
              {mode === "edit" ? "Edit address" : "Enter complete address"}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">Rider will use these details to find your door.</p>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Address type */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Save address as</p>
              <div className="grid grid-cols-3 gap-2.5">
                {TYPES.map(({ id, Icon }) => {
                  const on = type === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setType(id)}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                        on
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon size={16} />
                      {id}
                    </button>
                  )
                })}
              </div>
              {type === "Other" && (
                <div className="mt-3">
                  <input
                    value={customLabel}
                    onChange={(e) => {
                      setCustomLabel(e.target.value)
                      setErrors((er) => ({ ...er, label: undefined }))
                    }}
                    placeholder="e.g. Friend's place, Gym"
                    className={inputCls(errors.label)}
                  />
                  {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                House / Flat / Shop no. <span className="text-red-500">*</span>
              </label>
              <input value={form.house} onChange={setField("house")} placeholder="e.g. 24-B, 2nd floor" className={inputCls(errors.house)} />
              {errors.house && <p className="mt-1 text-xs text-red-600">{errors.house}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Building / Apartment / Society</label>
              <input value={form.building} onChange={setField("building")} placeholder="e.g. Shree Residency" className={inputCls()} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Landmark (optional)</label>
              <input value={form.landmark} onChange={setField("landmark")} placeholder="e.g. Near City Hospital" className={inputCls()} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Receiver's name</label>
                <input value={form.name} onChange={setField("name")} placeholder="Your name" className={inputCls()} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Phone number</label>
                <input
                  value={form.phone}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                    setErrors((er) => ({ ...er, phone: undefined }))
                  }}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  className={inputCls(errors.phone)}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
            {errors.map && (
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle size={14} /> {errors.map}
              </p>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={resolving}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-sm font-bold text-white shadow-lg shadow-green-600/25 transition-all hover:from-green-700 hover:to-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 size={18} />
              {mode === "edit" ? "Update & use this address" : "Save & use this address"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}