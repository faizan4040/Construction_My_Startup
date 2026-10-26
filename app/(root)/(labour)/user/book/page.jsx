"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Construction,
  Drill,
  Hammer,
  HardHat,
  House,
  LocateFixed,
  MapPin,
  Phone,
  Pickaxe,
  PaintRoller,
  ShieldCheck,
  Truck,
  Warehouse,
  Wrench,
  Home,
  AlertCircle,
  FileText,
  Zap,
  CalendarClock,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

const stepVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const LABOUR_CATEGORIES = [
  { id: "helpers", label: "Helpers", Icon: Construction, desc: "Loading & site help" },
  { id: "masons", label: "Masons", Icon: Hammer, desc: "Brickwork & plaster" },
  { id: "electricians", label: "Electricians", Icon: Drill, desc: "Wiring & fittings" },
  { id: "plumbers", label: "Plumbers", Icon: Wrench, desc: "Pipes & taps" },
  { id: "carpenters", label: "Carpenters", Icon: Warehouse, desc: "Furniture & wood work" },
  { id: "painters", label: "Painters", Icon: PaintRoller, desc: "Interior & exterior" },
  { id: "tile-experts", label: "Tile Experts", Icon: House, desc: "Floor & wall tiles" },
  { id: "welders", label: "Welders", Icon: ShieldCheck, desc: "Steel & gate work" },
  { id: "jcb-operators", label: "JCB Operators", Icon: Truck, desc: "Excavation" },
  { id: "contractors", label: "Contractors", Icon: Pickaxe, desc: "Full projects" },
  { id: "engineers", label: "Engineers", Icon: HardHat, desc: "Site supervision" },
];

// Indian mobile numbers always start with 6, 7, 8 or 9
const isValidMobile = (val) => /^[6-9]\d{9}$/.test(val);

// datetime-local helpers
const pad = (n) => String(n).padStart(2, "0");
const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const fmtTime = (iso) => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
};

const fmtRange = (r, unit) =>
  r ? `₹${r.min.toLocaleString("en-IN")}${r.max !== r.min ? `–₹${r.max.toLocaleString("en-IN")}` : ""} per ${unit}` : null;

function Page() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [mobile, setMobile] = useState("");

  // Work / site address (the customer's location where labour needs to reach)
  const [workAddress, setWorkAddress] = useState("");
  const [workCountry, setWorkCountry] = useState("");
  const [workLat, setWorkLat] = useState();
  const [workLon, setWorkLon] = useState();

  // Exact site details — autocomplete only gives locality-level accuracy
  const [siteDetails, setSiteDetails] = useState("");

  // NEW: what work, and when
  const [workDescription, setWorkDescription] = useState("");
  const [bookingType, setBookingType] = useState("now"); // "now" | "scheduled"
  const [scheduledAt, setScheduledAt] = useState("");

  // NEW: live estimate (real data from /api/labours/summary)
  const [estimate, setEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  // NEW: a specific worker chosen from the services section (workerId = labour's USER id)
  const [workerId, setWorkerId] = useState("");
  const [workerName, setWorkerName] = useState("");

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [addressLocked, setAddressLocked] = useState(false); // true once a suggestion is picked

  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const est = estimate?.categories?.[category];
  const nowUnavailable = !!est && est.nearby === 0;

  const minSchedule = toLocalInput(new Date(Date.now() + 30 * 60000));
  const maxSchedule = toLocalInput(new Date(Date.now() + 30 * 86400000));
  const scheduleValid =
    !!scheduledAt &&
    new Date(scheduledAt).getTime() >= Date.now() + 29 * 60000 &&
    new Date(scheduledAt).getTime() <= Date.now() + 31 * 86400000;

  const progress = [
    !!category,
    isValidMobile(mobile),
    !!workAddress && addressLocked,
  ].filter(Boolean).length;

  const canContinue = !!(
    category &&
    isValidMobile(mobile) &&
    workAddress &&
    workLat &&
    workLon &&
    addressLocked &&
    (bookingType === "now" || scheduleValid)
  );

  /* Prefill from the services section (?category=&type=&lat=&lon=&address=) */
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const cat = sp.get("category");
      if (cat && LABOUR_CATEGORIES.some((c) => c.id === cat)) setCategory(cat);
      if (sp.get("type") === "scheduled") setBookingType("scheduled");

      const wid = sp.get("workerId");
      if (wid) {
        setWorkerId(wid);
        setWorkerName(sp.get("workerName") || "this worker");
      }
      // "at" = time the chosen busy worker becomes free
      const at = sp.get("at");
      if (at) {
        const t = new Date(at);
        if (!isNaN(t) && t.getTime() > Date.now() + 30 * 60000) {
          setBookingType("scheduled");
          setScheduledAt(toLocalInput(t));
        }
      }

      const lat = parseFloat(sp.get("lat"));
      const lon = parseFloat(sp.get("lon"));
      const address = sp.get("address");
      if (Number.isFinite(lat) && Number.isFinite(lon) && address) {
        setWorkAddress(address);
        setWorkLat(lat);
        setWorkLon(lon);
        setAddressLocked(true);
      }
    } catch {}
  }, []);

  /* Live rate / availability estimate for the chosen category + location */
  useEffect(() => {
    if (!category || !workLat || !workLon) {
      setEstimate(null);
      return;
    }
    const ac = new AbortController();
    setEstimateLoading(true);
    axios
      .get("/api/labours/summary", {
        params: { lat: workLat, lon: workLon, category },
        signal: ac.signal,
      })
      .then(({ data }) => setEstimate(data))
      .catch((e) => {
        if (!axios.isCancel(e)) setEstimate(null);
      })
      .finally(() => {
        if (!ac.signal.aborted) setEstimateLoading(false);
      });
    return () => ac.abort();
  }, [category, workLat, workLon]);

  /* If nobody is free right now, move the customer to "Schedule for Later" */
  useEffect(() => {
    if (nowUnavailable && bookingType === "now") setBookingType("scheduled");
  }, [nowUnavailable, bookingType]);

  const searchAddress = async (q, setResults) => {
    try {
      if (!q || q.trim().length < 3) {
        setResults([]);
        return;
      }
      const { data } = await axios.get(
        "https://api.geoapify.com/v1/geocode/autocomplete",
        {
          params: {
            text: q.trim(),
            apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
            filter: "countrycode:in",
            limit: 5,
          },
        }
      );

      const results = (data.features ?? []).map((f) => ({
        id: String(f.properties.osm_id),
        name: f.properties.name,
        city: f.properties.city,
        state: f.properties.state,
        country: f.properties.country,
        countrycode: f.properties.countrycode,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }));

      setResults(results);
    } catch (error) {
      console.log(error);
      setResults([]);
    }
  };

  // Debounced search so we don't fire an API call on every keystroke
  const debouncedSearch = useCallback((q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(q, setSuggestions);
    }, 350);
  }, []);

  const suggestion = (p) =>
    [p.name, p.city, p.state, p.country].filter(Boolean).join(", ");

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location not supported on this device");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await axios.get(
            "https://api.geoapify.com/v1/geocode/reverse",
            {
              params: {
                lat: coords.latitude,
                lon: coords.longitude,
                apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
                filter: "countrycode:in",
              },
            }
          );

          if (data.features.length) {
            const p = data.features[0].properties;
            const address = [p.name, p.street, p.city, p.state, p.country]
              .filter(Boolean)
              .join(", ");
            setWorkAddress(address);
            setWorkCountry(p.country);
            setWorkLat(coords.latitude);
            setWorkLon(coords.longitude);
            setSuggestions([]);
            setAddressLocked(true);
          } else {
            setLocationError("Couldn't find an address for your location");
          }
        } catch (error) {
          console.log(error);
          setLocationError("Failed to fetch your location. Try searching manually.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.log(err);
        setLocationError(
          err.code === 1
            ? "Location permission denied. Please search manually."
            : "Couldn't get your location. Please search manually."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Close suggestions when clicking outside the address box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const StepHeader = ({ n, label }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
        <span className="text-white text-[9px] font-black">{n}</span>
      </div>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-4 mb-6 px-1">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => router.push("/")}
            className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft size={13} className="text-zinc-900" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-zinc-900 text-xl font-black tracking-tight">
              Hire Labour
            </h1>
            <p className="text-zinc-400 text-xs mt-0.5">
              Fill in the details below
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {[0, 1, 2].map((d, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i < progress ? 20 : 8,
                  background: i < progress ? "#09090b" : "#d4d4d8",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        </div>

        {workerId && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
            <p className="text-xs text-orange-700">
              Request for <span className="font-bold">{workerName}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setWorkerId("");
                setWorkerName("");
              }}
              className="cursor-pointer text-[11px] font-bold text-orange-600 underline-offset-2 hover:underline"
            >
              Choose automatically instead
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-visible">
          <div className="h-1 bg-zinc-900 w-[90%] m-auto" />
          <div className="p-6 space-y-7">
            {/* Step 1 — Category */}
            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <StepHeader n={1} label="Choose Category" />

              <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {LABOUR_CATEGORIES.map((c, i) => {
                  const active = category === c.id;
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(c.id)}
                      className={`relative p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all duration-200 cursor-pointer ${
                        active
                          ? "bg-zinc-900 border-zinc-900 shadow-lg"
                          : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          active ? "bg-white" : "bg-zinc-200"
                        }`}
                      >
                        <c.Icon
                          size={18}
                          className={active ? "text-zinc-900" : "text-zinc-600"}
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            active ? "text-white" : "text-zinc-900"
                          }`}
                        >
                          {c.label}
                        </p>
                        <p className="text-[10px] truncate text-zinc-400">
                          {c.desc}
                        </p>
                      </div>

                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2.5 right-2.5"
                        >
                          <CheckCircle
                            size={13}
                            className="text-white fill-white/20"
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <div className="h-px bg-zinc-200" />

            {/* Step 2 — Mobile */}
            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <StepHeader n={2} label="Mobile" />

              <div
                className={`flex items-center gap-3 bg-zinc-50 border rounded-2xl px-4 py-3 focus-within:bg-white transition-all ${
                  mobile.length === 10 && !isValidMobile(mobile)
                    ? "border-red-300"
                    : "border-zinc-200 focus-within:border-zinc-900"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-zinc-600" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="Enter your mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
                <AnimatePresence>
                  {isValidMobile(mobile) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle
                        size={16}
                        className="text-emerald-500 fill-emerald-50 shrink-0"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {mobile.length === 10 && !isValidMobile(mobile) ? (
                <p className="text-red-500 text-[10px] mt-1.5 ml-1">
                  Enter a valid 10-digit Indian mobile number
                </p>
              ) : (
                <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">
                  Booking updates will be sent to this number
                </p>
              )}
            </motion.div>

            <div className="h-px bg-zinc-200" />

            {/* Step 3 — Work Location */}
            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <StepHeader n={3} label="Work Location" />

              <div
                ref={wrapperRef}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-visible relative z-20"
              >
                <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-2xl transition-colors">
                  <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow shrink-0" />

                  <input
                    onChange={(e) => {
                      setWorkAddress(e.target.value);
                      // Any manual edit invalidates the previously locked coordinates
                      setAddressLocked(false);
                      setWorkLat(undefined);
                      setWorkLon(undefined);
                      debouncedSearch(e.target.value);
                    }}
                    value={workAddress}
                    placeholder="Search area / locality"
                    className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                  />
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={useCurrentLocation}
                    disabled={locating}
                    className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-wait"
                  >
                    <LocateFixed
                      size={14}
                      className={`text-zinc-700 ${
                        locating ? "animate-spin" : ""
                      }`}
                    />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {suggestions?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto"
                    >
                      {suggestions.map((p, i) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => {
                            setWorkAddress(suggestion(p));
                            setWorkCountry(p.country ?? "");
                            setWorkLat(p.lat);
                            setWorkLon(p.lng);
                            setSuggestions([]);
                            setAddressLocked(true);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0 cursor-pointer"
                        >
                          <MapPin
                            size={13}
                            className="text-zinc-400 shrink-0"
                          />
                          <span className="text-sm text-zinc-800 font-medium truncate">
                            {suggestion(p)}
                          </span>
                          <ChevronRight
                            size={13}
                            className="text-zinc-300 shrink-0 ml-auto"
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {locationError && (
                <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                  <AlertCircle size={11} className="text-red-500 shrink-0" />
                  <p className="text-red-500 text-[10px]">{locationError}</p>
                </div>
              )}

              {workAddress && !addressLocked && !locationError && (
                <p className="text-amber-600 text-[10px] mt-1.5 ml-1">
                  Please pick an address from the suggestions list
                </p>
              )}

              {/* Exact site address for the labour to actually reach */}
              {addressLocked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3"
                >
                  <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
                    <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
                      <Home size={14} className="text-zinc-600" />
                    </div>
                    <input
                      value={siteDetails}
                      onChange={(e) => setSiteDetails(e.target.value)}
                      placeholder="Flat/House no., floor, landmark (optional)"
                      className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                    />
                  </div>
                  <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">
                    Helps the labour find your exact spot on site
                  </p>
                </motion.div>
              )}
            </motion.div>

            <div className="h-px bg-zinc-200" />

            {/* Step 4 — Work description (NEW) */}
            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <StepHeader n={4} label="Work Details" />
              <div className="flex gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
                <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-zinc-600" />
                </div>
                <textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Describe the work, e.g. kitchen tap leaking, 2 rooms need wiring…"
                  className="flex-1 resize-none bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
              <p className="text-zinc-400 text-[10px] mt-1.5 ml-1 flex justify-between">
                <span>Helps the worker arrive with the right tools (optional)</span>
                <span>{workDescription.length}/300</span>
              </p>
            </motion.div>

            <div className="h-px bg-zinc-200" />

            {/* Step 5 — When (NEW) */}
            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <StepHeader n={5} label="When do you need them?" />

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "now", label: "Book Now", sub: "Nearest worker, right away", Icon: Zap, disabled: nowUnavailable },
                  { id: "scheduled", label: "Schedule for Later", sub: "Pick your preferred time", Icon: CalendarClock, disabled: false },
                ].map((o) => {
                  const active = bookingType === o.id;
                  return (
                    <motion.button
                      key={o.id}
                      type="button"
                      whileTap={o.disabled ? {} : { scale: 0.96 }}
                      disabled={o.disabled}
                      onClick={() => setBookingType(o.id)}
                      className={`relative flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 ${
                        active
                          ? "bg-zinc-900 border-zinc-900 shadow-lg"
                          : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <o.Icon size={16} className={active ? "text-orange-400" : "text-zinc-600"} />
                      <p className={`text-sm font-bold ${active ? "text-white" : "text-zinc-900"}`}>{o.label}</p>
                      <p className="text-[10px] text-zinc-400">{o.sub}</p>
                    </motion.button>
                  );
                })}
              </div>

              {nowUnavailable && (
                <p className="text-amber-600 text-[10px] mt-2 ml-1">
                  No worker is free near you right now
                  {est?.nextSlot ? ` — next slot around ${fmtTime(est.nextSlot)}` : ""}. You can schedule for later.
                </p>
              )}

              {bookingType === "now" && est?.nearby > 0 && (
                <p className="text-emerald-600 text-[10px] mt-2 ml-1">
                  {est.nearby} {est.nearby === 1 ? "worker is" : "workers are"} free near you
                  {est.eta30
                    ? ` — arrival in about ${est.etaMinutes} min`
                    : est.etaMinutes != null
                    ? ` — about ${est.etaMinutes} min away`
                    : ""}
                </p>
              )}

              <AnimatePresence>
                {bookingType === "scheduled" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div
                      className={`flex items-center gap-3 bg-zinc-50 border rounded-2xl px-4 py-3 focus-within:bg-white transition-all ${
                        scheduledAt && !scheduleValid ? "border-red-300" : "border-zinc-200 focus-within:border-zinc-900"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
                        <CalendarClock size={14} className="text-zinc-600" />
                      </div>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={minSchedule}
                        max={maxSchedule}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="flex-1 cursor-pointer bg-transparent text-sm font-semibold text-zinc-900 outline-none"
                      />
                    </div>
                    <p
                      className={`text-[10px] mt-1.5 ml-1 ${
                        scheduledAt && !scheduleValid ? "text-red-500" : "text-zinc-400"
                      }`}
                    >
                      {scheduledAt && !scheduleValid
                        ? "Choose a time at least 30 minutes from now, within 30 days"
                        : "Choose your preferred arrival time"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Price estimate (NEW) — real data only, never a made-up fixed price */}
            <AnimatePresence>
              {category && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    Price estimate
                  </p>

                  {!workLat || !workLon ? (
                    <p className="mt-2 text-xs text-zinc-500">
                      Select your work location to see rates and availability near you.
                    </p>
                  ) : estimateLoading ? (
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-44 animate-pulse rounded bg-orange-200/60" />
                      <div className="h-3 w-32 animate-pulse rounded bg-orange-200/60" />
                    </div>
                  ) : est && (est.rateHour || est.rateDay) ? (
                    <>
                      <div className="mt-2 space-y-0.5">
                        {est.rateHour && (
                          <p className="text-base font-extrabold text-zinc-900">{fmtRange(est.rateHour, "hour")}</p>
                        )}
                        {est.rateDay && (
                          <p className="text-base font-extrabold text-zinc-900">{fmtRange(est.rateDay, "day")}</p>
                        )}
                      </div>
                      <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-snug text-zinc-500">
                        <Info size={11} className="mt-px shrink-0" />
                        Based on real rates of workers near you. The final fare is confirmed when you pick a worker.
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-zinc-500">
                      Rates will be shown once you choose a worker — no workers with listed rates in your area yet.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={canContinue ? { scale: 1.02 } : {}}
                disabled={!canContinue}
                onClick={() => {
                  const fullAddress = siteDetails
                    ? `${siteDetails}, ${workAddress}`
                    : workAddress;

                  const params = new URLSearchParams({
                    category,
                    mobile,
                    address: workAddress,
                    siteDetails: siteDetails || "",
                    fullAddress,
                    lat: String(workLat),
                    lon: String(workLon),
                    bookingType,
                    workDescription: workDescription.trim(),
                  });
                  if (workerId) params.set("workerId", workerId);
                  if (bookingType === "scheduled" && scheduledAt) {
                    params.set("scheduledAt", new Date(scheduledAt).toISOString());
                  }

                  router.push(`/user/search?${params.toString()}`);
                }}
                className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black disabled:opacity-35 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-colors shadow-lg disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{bookingType === "scheduled" ? "Continue — Schedule" : "Continue — Book Now"}</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Page;



















// "use client";
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   ArrowLeft,
//   CheckCircle,
//   ChevronRight,
//   Construction,
//   Drill,
//   Hammer,
//   HardHat,
//   House,
//   LocateFixed,
//   MapPin,
//   Phone,
//   Pickaxe,
//   PaintRoller,
//   ShieldCheck,
//   Truck,
//   Warehouse,
//   Wrench,
//   Home,
//   AlertCircle,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// const stepVariants = {
//   hidden: { opacity: 0, y: 16 },
//   visible: { opacity: 1, y: 0 },
// };

// const LABOUR_CATEGORIES = [
//   { id: "helpers", label: "Helpers", Icon: Construction, desc: "Loading & site help" },
//   { id: "masons", label: "Masons", Icon: Hammer, desc: "Brickwork & plaster" },
//   { id: "electricians", label: "Electricians", Icon: Drill, desc: "Wiring & fittings" },
//   { id: "plumbers", label: "Plumbers", Icon: Wrench, desc: "Pipes & taps" },
//   { id: "carpenters", label: "Carpenters", Icon: Warehouse, desc: "Furniture & wood work" },
//   { id: "painters", label: "Painters", Icon: PaintRoller, desc: "Interior & exterior" },
//   { id: "tile-experts", label: "Tile Experts", Icon: House, desc: "Floor & wall tiles" },
//   { id: "welders", label: "Welders", Icon: ShieldCheck, desc: "Steel & gate work" },
//   { id: "jcb-operators", label: "JCB Operators", Icon: Truck, desc: "Excavation" },
//   { id: "contractors", label: "Contractors", Icon: Pickaxe, desc: "Full projects" },
//   { id: "engineers", label: "Engineers", Icon: HardHat, desc: "Site supervision" },
// ];

// // Indian mobile numbers always start with 6, 7, 8 or 9
// const isValidMobile = (val) => /^[6-9]\d{9}$/.test(val);

// function Page() {
//   const router = useRouter();
//   const [category, setCategory] = useState("");
//   const [mobile, setMobile] = useState("");

//   // Work / site address (the customer's location where labour needs to reach)
//   const [workAddress, setWorkAddress] = useState("");
//   const [workCountry, setWorkCountry] = useState("");
//   const [workLat, setWorkLat] = useState();
//   const [workLon, setWorkLon] = useState();

//   // NEW: exact site details — autocomplete only gives locality-level accuracy,
//   // this is what actually gets the labour to the customer's door.
//   const [siteDetails, setSiteDetails] = useState(""); // flat/house no., floor, landmark

//   const [locating, setLocating] = useState(false);
//   const [locationError, setLocationError] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [addressLocked, setAddressLocked] = useState(false); // true once a suggestion is picked

//   const wrapperRef = useRef(null);
//   const debounceRef = useRef(null);

//   const progress = [
//     !!category,
//     isValidMobile(mobile),
//     !!workAddress && addressLocked,
//   ].filter(Boolean).length;

//   const canContinue = !!(
//     category &&
//     isValidMobile(mobile) &&
//     workAddress &&
//     workLat &&
//     workLon &&
//     addressLocked
//   );

//   const searchAddress = async (q, setResults) => {
//     try {
//       if (!q || q.trim().length < 3) {
//         setResults([]);
//         return;
//       }
//       const { data } = await axios.get(
//         "https://api.geoapify.com/v1/geocode/autocomplete",
//         {
//           params: {
//             text: q.trim(),
//             apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
//             filter: "countrycode:in",
//             limit: 5,
//           },
//         }
//       );

//       const results = (data.features ?? []).map((f) => ({
//         id: String(f.properties.osm_id),
//         name: f.properties.name,
//         city: f.properties.city,
//         state: f.properties.state,
//         country: f.properties.country,
//         countrycode: f.properties.countrycode,
//         lat: f.geometry.coordinates[1],
//         lng: f.geometry.coordinates[0],
//       }));

//       setResults(results);
//     } catch (error) {
//       console.log(error);
//       setResults([]);
//     }
//   };

//   // Debounced search so we don't fire an API call on every keystroke
//   const debouncedSearch = useCallback((q) => {
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => {
//       searchAddress(q, setSuggestions);
//     }, 350);
//   }, []);

//   const suggestion = (p) =>
//     [p.name, p.city, p.state, p.country].filter(Boolean).join(", ");

//   const useCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       setLocationError("Location not supported on this device");
//       return;
//     }
//     setLocating(true);
//     setLocationError("");
//     navigator.geolocation.getCurrentPosition(
//       async ({ coords }) => {
//         try {
//           const { data } = await axios.get(
//             "https://api.geoapify.com/v1/geocode/reverse",
//             {
//               params: {
//                 lat: coords.latitude,
//                 lon: coords.longitude,
//                 apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
//                 filter: "countrycode:in",
//               },
//             }
//           );

//           if (data.features.length) {
//             const p = data.features[0].properties;
//             const address = [p.name, p.street, p.city, p.state, p.country]
//               .filter(Boolean)
//               .join(", ");
//             setWorkAddress(address);
//             setWorkCountry(p.country);
//             setWorkLat(coords.latitude);
//             setWorkLon(coords.longitude);
//             setSuggestions([]);
//             setAddressLocked(true);
//           } else {
//             setLocationError("Couldn't find an address for your location");
//           }
//         } catch (error) {
//           console.log(error);
//           setLocationError("Failed to fetch your location. Try searching manually.");
//         } finally {
//           setLocating(false);
//         }
//       },
//       (err) => {
//         // Handles permission denied / timeout / unavailable
//         console.log(err);
//         setLocationError(
//           err.code === 1
//             ? "Location permission denied. Please search manually."
//             : "Couldn't get your location. Please search manually."
//         );
//         setLocating(false);
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // Close suggestions when clicking outside the address box
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
//         setSuggestions([]);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">
//       <motion.div
//         initial={{ opacity: 0, y: 32 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//         className="w-full max-w-md"
//       >
//         <div className="flex items-center gap-4 mb-6 px-1">
//           <motion.button
//             whileTap={{ scale: 0.88 }}
//             onClick={() => router.push("/")}
//             className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0"
//           >
//             <ArrowLeft size={13} className="text-zinc-900" />
//           </motion.button>
//           <div className="flex-1 min-w-0">
//             <h1 className="text-zinc-900 text-xl font-black tracking-tight">
//               Hire Labour
//             </h1>
//             <p className="text-zinc-400 text-xs mt-0.5">
//               Fill in the details below
//             </p>
//           </div>

//           <div className="flex items-center gap-1.5 shrink-0">
//             {[0, 1, 2].map((d, i) => (
//               <motion.div
//                 key={i}
//                 animate={{
//                   width: i < progress ? 20 : 8,
//                   background: i < progress ? "#09090b" : "#d4d4d8",
//                 }}
//                 transition={{ duration: 0.3 }}
//                 className="h-2 rounded-full"
//               />
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-visible">
//           <div className="h-1 bg-zinc-900 w-[90%] m-auto" />
//           <div className="p-6 space-y-7">
//             {/* Step 1 — Category */}
//             <motion.div
//               variants={stepVariants}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: 0.05 }}
//             >
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
//                   <span className="text-white text-[9px] font-black">1</span>
//                 </div>
//                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
//                   Choose Category
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
//                 {LABOUR_CATEGORIES.map((c, i) => {
//                   const active = category === c.id;
//                   return (
//                     <motion.div
//                       key={c.id}
//                       initial={{ opacity: 0, y: 12 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.05 + i * 0.03 }}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={() => setCategory(c.id)}
//                       className={`relative p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all duration-200 ${
//                         active
//                           ? "bg-zinc-900 border-zinc-900 shadow-lg"
//                           : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"
//                       }`}
//                     >
//                       <div
//                         className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
//                           active ? "bg-white" : "bg-zinc-200"
//                         }`}
//                       >
//                         <c.Icon
//                           size={18}
//                           className={active ? "text-zinc-900" : "text-zinc-600"}
//                         />
//                       </div>
//                       <div className="min-w-0">
//                         <p
//                           className={`text-sm font-bold truncate ${
//                             active ? "text-white" : "text-zinc-900"
//                           }`}
//                         >
//                           {c.label}
//                         </p>
//                         <p
//                           className={`text-[10px] truncate ${
//                             active ? "text-zinc-400" : "text-zinc-400"
//                           }`}
//                         >
//                           {c.desc}
//                         </p>
//                       </div>

//                       {active && (
//                         <motion.div
//                           initial={{ scale: 0 }}
//                           animate={{ scale: 1 }}
//                           className="absolute top-2.5 right-2.5"
//                         >
//                           <CheckCircle
//                             size={13}
//                             className="text-white fill-white/20"
//                           />
//                         </motion.div>
//                       )}
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </motion.div>

//             <div className="h-px bg-zinc-200" />

//             {/* Step 2 — Mobile */}
//             <motion.div
//               variants={stepVariants}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: 0.05 }}
//             >
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
//                   <span className="text-white text-[9px] font-black">2</span>
//                 </div>
//                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
//                   Mobile
//                 </p>
//               </div>

//               <div
//                 className={`flex items-center gap-3 bg-zinc-50 border rounded-2xl px-4 py-3 focus-within:bg-white transition-all ${
//                   mobile.length === 10 && !isValidMobile(mobile)
//                     ? "border-red-300"
//                     : "border-zinc-200 focus-within:border-zinc-900"
//                 }`}
//               >
//                 <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
//                   <Phone size={14} className="text-zinc-600" />
//                 </div>
//                 <input
//                   type="tel"
//                   value={mobile}
//                   onChange={(e) =>
//                     setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
//                   }
//                   placeholder="Enter your mobile number"
//                   inputMode="numeric"
//                   maxLength={10}
//                   className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
//                 />
//                 <AnimatePresence>
//                   {isValidMobile(mobile) && (
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       exit={{ scale: 0 }}
//                     >
//                       <CheckCircle
//                         size={16}
//                         className="text-emerald-500 fill-emerald-50 shrink-0"
//                       />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {mobile.length === 10 && !isValidMobile(mobile) ? (
//                 <p className="text-red-500 text-[10px] mt-1.5 ml-1">
//                   Enter a valid 10-digit Indian mobile number
//                 </p>
//               ) : (
//                 <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">
//                   Booking updates will be sent to this number
//                 </p>
//               )}
//             </motion.div>

//             <div className="h-px bg-zinc-200" />

//             {/* Step 3 — Work Location */}
//             <motion.div
//               variants={stepVariants}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: 0.05 }}
//             >
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
//                   <span className="text-white text-[9px] font-black">3</span>
//                 </div>
//                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
//                   Work Location
//                 </p>
//               </div>

//               <div
//                 ref={wrapperRef}
//                 className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-visible relative z-20"
//               >
//                 <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-2xl transition-colors">
//                   <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow shrink-0" />

//                   <input
//                     onChange={(e) => {
//                       setWorkAddress(e.target.value);
//                       // Any manual edit invalidates the previously locked coordinates
//                       setAddressLocked(false);
//                       setWorkLat(undefined);
//                       setWorkLon(undefined);
//                       debouncedSearch(e.target.value);
//                     }}
//                     value={workAddress}
//                     placeholder="Search area / locality"
//                     className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
//                   />
//                   <motion.button
//                     whileTap={{ scale: 0.88 }}
//                     onClick={useCurrentLocation}
//                     disabled={locating}
//                     className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center shrink-0"
//                   >
//                     <LocateFixed
//                       size={14}
//                       className={`text-zinc-700 ${
//                         locating ? "animate-spin" : ""
//                       }`}
//                     />
//                   </motion.button>
//                 </div>

//                 <AnimatePresence>
//                   {suggestions?.length > 0 && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -4, scale: 0.98 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: -4, scale: 0.98 }}
//                       transition={{ duration: 0.2 }}
//                       className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto"
//                     >
//                       {suggestions.map((p, i) => (
//                         <motion.div
//                           key={p.id}
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           transition={{ delay: i * 0.03 }}
//                           onClick={() => {
//                             setWorkAddress(suggestion(p));
//                             setWorkCountry(p.country ?? "");
//                             setWorkLat(p.lat);
//                             setWorkLon(p.lng);
//                             setSuggestions([]);
//                             setAddressLocked(true);
//                           }}
//                           className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
//                         >
//                           <MapPin
//                             size={13}
//                             className="text-zinc-400 shrink-0"
//                           />
//                           <span className="text-sm text-zinc-800 font-medium truncate">
//                             {suggestion(p)}
//                           </span>
//                           <ChevronRight
//                             size={13}
//                             className="text-zinc-300 shrink-0 ml-auto"
//                           />
//                         </motion.div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {locationError && (
//                 <div className="flex items-center gap-1.5 mt-1.5 ml-1">
//                   <AlertCircle size={11} className="text-red-500 shrink-0" />
//                   <p className="text-red-500 text-[10px]">{locationError}</p>
//                 </div>
//               )}

//               {workAddress && !addressLocked && !locationError && (
//                 <p className="text-amber-600 text-[10px] mt-1.5 ml-1">
//                   Please pick an address from the suggestions list
//                 </p>
//               )}

//               {/* NEW: exact site address for the labour to actually reach */}
//               {addressLocked && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   className="mt-3"
//                 >
//                   <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
//                     <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
//                       <Home size={14} className="text-zinc-600" />
//                     </div>
//                     <input
//                       value={siteDetails}
//                       onChange={(e) => setSiteDetails(e.target.value)}
//                       placeholder="Flat/House no., floor, landmark (optional)"
//                       className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
//                     />
//                   </div>
//                   <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">
//                     Helps the labour find your exact spot on site
//                   </p>
//                 </motion.div>
//               )}
//             </motion.div>

//             <motion.div
//               variants={stepVariants}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: 0.3 }}
//             >
//               <motion.button
//                 whileTap={{ scale: 0.97 }}
//                 whileHover={canContinue ? { scale: 1.02 } : {}}
//                 disabled={!canContinue}
//                 onClick={() => {
//                   const fullAddress = siteDetails
//                     ? `${siteDetails}, ${workAddress}`
//                     : workAddress;

//                   const params = new URLSearchParams({
//                     category,
//                     mobile,
//                     address: workAddress,
//                     siteDetails: siteDetails || "",
//                     fullAddress,
//                     lat: String(workLat),
//                     lon: String(workLon),
//                   });

//                   router.push(`/user/search?${params.toString()}`);
//                 }}
//                 className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black disabled:opacity-35 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-colors shadow-lg disabled:shadow-none"
//               >
//                 <span>Continue</span>
//               </motion.button>
//             </motion.div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// export default Page;