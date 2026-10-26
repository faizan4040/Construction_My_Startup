"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CalendarDays,
  CalendarClock,
  Hammer,
  Plug,
  Droplets,
  Ruler,
  HardHat,
  Construction,
  PaintRoller,
  House,
  Flame,
  Truck,
  Pickaxe,
  Clock,
  LocateFixed,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  BadgeCheck,
  MapPin,
  Users,
  Sparkles,
} from "lucide-react";

/* ----------------------------- DATA ----------------------------- */
/*
  Worker images: public/workers/<slug>.png  (transparent PNG looks best)
  Missing image -> icon fallback, UI never breaks.
*/

const CATEGORIES = [
  { slug: "helpers", title: "Helpers", desc: "Loading, shifting & site support.", Icon: Construction },
  { slug: "masons", title: "Masons", desc: "Brickwork, plaster & construction.", Icon: Hammer },
  { slug: "electricians", title: "Electricians", desc: "Wiring, fittings & repairs.", Icon: Plug },
  { slug: "plumbers", title: "Plumbers", desc: "Pipes, taps & bathroom work.", Icon: Droplets },
  { slug: "carpenters", title: "Carpenters", desc: "Furniture & woodwork.", Icon: Ruler },
  { slug: "painters", title: "Painters", desc: "Interior & exterior painting.", Icon: PaintRoller },
  { slug: "tile-experts", title: "Tile Experts", desc: "Floor & wall tile installation.", Icon: House },
  { slug: "welders", title: "Welders", desc: "Steel fabrication & gate work.", Icon: Flame },
  { slug: "jcb-operators", title: "JCB Operators", desc: "Excavation & heavy equipment.", Icon: Truck },
  { slug: "contractors", title: "Contractors", desc: "Complete construction projects.", Icon: Pickaxe },
  { slug: "engineers", title: "Engineers", desc: "Site supervision & planning.", Icon: HardHat },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Verified Professionals", desc: "Approved by our team" },
  { icon: Zap, title: "Quick Booking", desc: "Get started in minutes" },
  { icon: CalendarDays, title: "Flexible Scheduling", desc: "Book now or later" },
];

const LOC_KEY = "hl_loc";

/* ----------------------------- HELPERS ----------------------------- */

const fmtTime = (iso) => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
};

const fmtRange = (r, unit) =>
  r ? `₹${r.min.toLocaleString("en-IN")}${r.max !== r.min ? `–₹${r.max.toLocaleString("en-IN")}` : ""}/${unit}` : null;

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

/* ------------------------- SMALL PIECES ------------------------- */

function SafeImage({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return fallback ?? null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
}

function Avatar({ name, img, size = "h-9 w-9", ring = "border-white", dark }) {
  return (
    <SafeImage
      src={img}
      alt={name}
      className={`${size} rounded-full border-2 object-cover ${ring}`}
      fallback={
        <span
          title={name}
          className={`flex ${size} items-center justify-center rounded-full border-2 text-[11px] font-bold ${
            dark ? "border-zinc-900 bg-zinc-700 text-zinc-200" : `${ring} bg-orange-100 text-orange-600`
          }`}
        >
          {initials(name)}
        </span>
      }
    />
  );
}

function WorkerAvatars({ workers = [], dark }) {
  if (!workers.length) return null;
  return (
    <div className="flex -space-x-3">
      {workers.map((w) => (
        <Avatar key={w.id} name={w.name} img={w.img} ring={dark ? "border-zinc-900" : "border-white"} dark={dark} />
      ))}
    </div>
  );
}

/* --------------------------- SERVICE CARD --------------------------- */

function ServiceCard({ item, data, loaded, hasLoc, index, onOpen, onSchedule, onViewRates }) {
  const { slug, title, desc, Icon } = item;
  const dark = index % 2 === 1;
  const muted = dark ? "text-zinc-400" : "text-zinc-500";

  const registered = data?.registered ?? 0;
  const free = hasLoc ? data?.nearby : data?.available;
  const busyN = hasLoc ? data?.busyNearby ?? 0 : 0;
  const noWorkers = loaded && data && registered === 0;
  const noArea = loaded && data && hasLoc && registered > 0 && data.inArea === 0;
  const noneFree = loaded && data && registered > 0 && !noArea && free === 0;

  const rateText = data
    ? [fmtRange(data.rateHour, "hr"), fmtRange(data.rateDay, "day")].filter(Boolean).join(" · ")
    : "";

  const trustParts = data
    ? [
        data.rating != null && `${data.rating} ★`,
        data.jobs > 0 && `${data.jobs.toLocaleString("en-IN")} ${data.jobs === 1 ? "job" : "jobs"} completed`,
        data.verified > 0 && `${data.verified} ID verified`,
      ].filter(Boolean)
    : [];

  const emptyTitle = noWorkers
    ? "No workers registered yet"
    : noArea
    ? "No workers in your area yet"
    : busyN > 0
    ? `All ${busyN} nearby ${busyN === 1 ? "is" : "are"} busy`
    : "No worker free right now";

  const emptySub = data?.nextSlot
    ? `Earliest free: ${fmtTime(data.nextSlot)}`
    : noWorkers
    ? "Check back soon"
    : noArea
    ? "Try a different location"
    : busyN > 0
    ? "Pick one to book for later"
    : "Schedule for later";

  const primaryBtn =
    "flex w-full cursor-pointer items-center justify-between rounded-full bg-linear-to-r from-orange-500 to-orange-600 py-1.5 pl-6 pr-1.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_14px_32px_rgba(249,115,22,0.5)] active:scale-[0.98]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.07, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className={`group relative flex w-70 shrink-0 snap-start flex-col overflow-hidden rounded-[28px] p-5 sm:w-75 ${
        dark
          ? "bg-zinc-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          : "bg-white text-zinc-900 shadow-[0_10px_40px_rgba(249,115,22,0.10)] ring-1 ring-orange-100/70"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-10 top-6 h-52 w-52 rounded-full blur-2xl ${
          dark ? "bg-orange-500/10" : "bg-orange-200/40"
        }`}
      />

      {/* top: icon + title + image */}
      <div className="relative h-56">
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
          <Icon size={22} strokeWidth={1.9} />
        </div>
        <div className="relative z-10 mt-5 max-w-[52%]">
          <h3 className="text-xl font-extrabold leading-tight">{title}</h3>
          <p className={`mt-2 text-[13px] leading-relaxed ${muted}`}>{desc}</p>
        </div>
        <div className="pointer-events-none absolute -right-5 bottom-0 top-2 w-[62%]">
          <SafeImage
            src={`/workers/${slug}.png`}
            alt={title}
            className="absolute bottom-0 right-0 h-full w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
            fallback={
              <div className="flex h-full w-full items-end justify-end pr-4">
                <Icon size={110} strokeWidth={1} className={dark ? "text-white/10" : "text-orange-200"} />
              </div>
            }
          />
        </div>
      </div>

      {/* live availability */}
      <div className="relative z-10 min-h-11">
        {!loaded ? (
          <div className="space-y-2">
            <div className={`h-3.5 w-32 animate-pulse rounded ${dark ? "bg-white/10" : "bg-zinc-200"}`} />
            <div className={`h-3 w-24 animate-pulse rounded ${dark ? "bg-white/10" : "bg-zinc-200"}`} />
          </div>
        ) : !data ? (
          <p className={`text-xs ${muted}`}>Live availability unavailable right now</p>
        ) : free > 0 ? (
          <>
            <p className="flex items-center gap-2 text-sm font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              {hasLoc
                ? `${free} free nearby${busyN > 0 ? ` · ${busyN} busy` : ""}`
                : `${free} available now`}
            </p>
            <p className={`mt-0.5 text-xs ${muted}`}>
              {hasLoc && data.etaMinutes != null
                ? data.eta30
                  ? `Nearest arrives in about ${data.etaMinutes} min`
                  : `Nearest is about ${data.etaMinutes} min away`
                : "Set your location for arrival time"}
            </p>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-sm font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              {emptyTitle}
            </p>
            <p className={`mt-0.5 text-xs ${muted}`}>{emptySub}</p>
          </>
        )}
      </div>

      {/* rates + trust */}
      <div className={`relative z-10 mt-3 space-y-1.5 border-t pt-3 text-xs ${dark ? "border-white/10" : "border-zinc-100"}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate">
            <span className={muted}>Rates </span>
            <span className="font-bold">{rateText || "—"}</span>
          </p>
          <button
            type="button"
            onClick={() => onViewRates(slug)}
            className="shrink-0 cursor-pointer font-semibold text-orange-500 underline-offset-2 hover:underline"
          >
            View rates
          </button>
        </div>
        <p className={muted}>
          {trustParts.length ? trustParts.join(" · ") : loaded && data ? "No ratings yet" : "\u00A0"}
        </p>
      </div>

      {/* CTAs */}
      <div className="relative z-10 mt-4">
        {noWorkers || noArea ? (
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center rounded-full bg-zinc-300/60 py-3.5 text-sm font-bold text-zinc-500"
          >
            {noWorkers ? "No workers yet" : "Not in your area"}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => onOpen(slug)} className={primaryBtn}>
              <span className="mx-auto">{noneFree ? "See Workers" : "Hire Now"}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange-500 transition-transform group-hover:translate-x-0.5">
                {noneFree ? <Users size={18} /> : <ArrowRight size={18} />}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSchedule(slug)}
              className={`mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
                dark ? "text-zinc-300 hover:bg-white/10" : "text-zinc-600 hover:bg-orange-50"
              }`}
            >
              <CalendarClock size={13} /> Schedule for Later
            </button>
          </>
        )}
      </div>

      {/* registered + avatars (real profile photos) */}
      <div className="relative z-10 mt-4 flex min-h-9 items-center gap-3">
        <WorkerAvatars workers={data?.workers} dark={dark} />
        {loaded && data && (
          <p className={`text-xs leading-tight ${muted}`}>
            <span className={`text-sm font-extrabold ${dark ? "text-white" : "text-zinc-900"}`}>{registered}</span>{" "}
            registered
          </p>
        )}
      </div>
    </motion.article>
  );
}

/* ------------------------- WORKERS DRAWER ------------------------- */
/* Shows every nearby worker with a clear status, so nobody hits a dead end:
   free  -> "Send Request"
   busy  -> "Free by 4:30 PM" + "Book for later" */

function WorkerRow({ w, onPick }) {
  const free = w.status === "free";
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={w.name} img={w.img} size="h-12 w-12" ring="border-orange-100" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-zinc-900">{w.name}</p>
            {w.verified && <BadgeCheck size={15} className="shrink-0 text-emerald-500" />}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {[
              w.rating != null && `${w.rating} ★ (${w.reviews})`,
              w.jobs > 0 && `${w.jobs} ${w.jobs === 1 ? "job" : "jobs"}`,
              w.experienceYears > 0 && `${w.experienceYears} yr exp`,
            ]
              .filter(Boolean)
              .join(" · ") || "New on platform"}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
            <MapPin size={11} /> {w.distanceKm} km away
            {free && ` · ~${w.etaMinutes} min`}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            free ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {free ? "Free now" : w.freeAt ? `Free ~${fmtTime(w.freeAt)}` : "Busy"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-zinc-700">
          {[w.rateHour && `₹${w.rateHour}/hr`, w.rateDay && `₹${w.rateDay}/day`].filter(Boolean).join(" · ") || "—"}
        </p>
        {free ? (
          <button
            type="button"
            onClick={() => onPick(w, "now")}
            className="cursor-pointer rounded-full bg-linear-to-r from-orange-500 to-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/30 transition-all hover:shadow-lg active:scale-95"
          >
            Send Request
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPick(w, "scheduled", w.freeAt)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-100 active:scale-95"
          >
            <CalendarClock size={13} /> {w.freeAt ? "Book for then" : "Schedule"}
          </button>
        )}
      </div>
    </li>
  );
}

function WorkersDrawer({ item, loc, onClose, onPick, onAuto, onSchedule }) {
  const [state, setState] = useState({ loading: true, error: false, data: null });
  const [tab, setTab] = useState("free");

  useEffect(() => {
    const ac = new AbortController();
    setState({ loading: true, error: false, data: null });
    axios
      .get("/api/labours/list", { params: { category: item.slug, lat: loc.lat, lon: loc.lon }, signal: ac.signal })
      .then(({ data }) => {
        setState({ loading: false, error: false, data });
        setTab(data.counts.free > 0 ? "free" : data.counts.busy > 0 ? "busy" : "free");
      })
      .catch((e) => {
        if (!axios.isCancel(e)) {
          console.error("labours/list failed:", e?.response?.status, e?.response?.data || e.message);
          setState({ loading: false, error: e?.response?.status || "network", data: null });
        }
      });
    return () => ac.abort();
  }, [item.slug, loc.lat, loc.lon]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const { loading, error, data } = state;
  const counts = data?.counts || { free: 0, busy: 0 };
  const list = (data?.workers || []).filter((w) => (tab === "all" ? true : w.status === tab));
  const firstFree = data?.workers?.find((w) => w.status === "free");
  const firstBusy = data?.workers?.find((w) => w.status === "busy" && w.freeAt);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-[2px]"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative flex h-full w-full max-w-md flex-col bg-zinc-50 shadow-2xl"
      >
        {/* header */}
        <div className="border-b border-zinc-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Workers near you</p>
              <h3 className="mt-1 text-2xl font-black text-zinc-900">{item.title}</h3>
              <p className="mt-0.5 truncate text-xs text-zinc-400">{loc.label}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* tabs */}
          {!loading && !error && (
            <div className="mt-4 flex gap-2">
              {[
                { id: "free", label: `Free now (${counts.free})` },
                { id: "busy", label: `Busy (${counts.busy})` },
                { id: "all", label: "All" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                    tab === t.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-200/70" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Couldn't load workers right now. Please try again, or use "Schedule for Later".
              <span className="mt-1 block text-[11px] text-red-400">
                {error === 404
                  ? "Server error 404 — /api/labours/list route not found (check file: app/api/labours/list/route.js)"
                  : error === 500
                  ? "Server error 500 — check the terminal for 'labour list error'"
                  : `Error: ${error}`}
              </span>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* smart one-tap option — least effort for the customer */}
              {counts.free > 0 ? (
                <button
                  type="button"
                  onClick={onAuto}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-zinc-900 p-4 text-left text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500">
                    <Sparkles size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">Auto-assign nearest free worker</span>
                    <span className="block text-xs text-zinc-400">
                      {firstFree ? `${firstFree.name} · about ${firstFree.etaMinutes} min away` : "Fastest option"}
                    </span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-orange-400" />
                </button>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-bold text-amber-800">
                    {counts.busy > 0 ? "Everyone nearby is on a job right now" : "No workers available nearby right now"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    {firstBusy
                      ? `The earliest worker is free around ${fmtTime(firstBusy.freeAt)}. You can book them for then — no waiting around.`
                      : "You can schedule for a time that suits you and we'll match you with a worker."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {firstBusy && (
                      <button
                        type="button"
                        onClick={() => onPick(firstBusy, "scheduled", firstBusy.freeAt)}
                        className="cursor-pointer rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600"
                      >
                        Book {firstBusy.name.split(" ")[0]} for {fmtTime(firstBusy.freeAt)}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onSchedule}
                      className="cursor-pointer rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
                    >
                      Schedule for Later
                    </button>
                  </div>
                </div>
              )}

              {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400">
                  {tab === "free" ? "No free workers right now." : tab === "busy" ? "No busy workers." : "No workers found."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {list.map((w) => (
                    <WorkerRow key={w.id} w={w} onPick={onPick} />
                  ))}
                </ul>
              )}

              {data?.hasMore && (
                <p className="text-center text-xs text-zinc-400">Showing the closest workers first.</p>
              )}
            </>
          )}
        </div>
      </motion.aside>
    </div>
  );
}

/* --------------------------- MAIN SECTION --------------------------- */

function HireLabour({ onAuthRequired }) {
  const auth = useSelector((state) => state.authStore.auth);
  const router = useRouter();

  const sliderRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const [loc, setLoc] = useState(null); // { lat, lon, label }
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  const [summary, setSummary] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [drawerSlug, setDrawerSlug] = useState(null);
  const drawerItem = CATEGORIES.find((c) => c.slug === drawerSlug) || null;

  /* restore saved location */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LOC_KEY) || "null");
      if (saved?.lat && saved?.lon) setLoc(saved);
    } catch {}
  }, []);

  /* live availability — refetch on location change + every 60s */
  const fetchSummary = useCallback(
    async (signal) => {
      try {
        const { data } = await axios.get("/api/labours/summary", {
          params: loc ? { lat: loc.lat, lon: loc.lon } : {},
          signal,
        });
        setSummary(data);
      } catch (e) {
        if (!axios.isCancel(e)) setSummary(null);
      } finally {
        setLoaded(true);
      }
    },
    [loc]
  );

  useEffect(() => {
    const ac = new AbortController();
    fetchSummary(ac.signal);
    const t = setInterval(() => fetchSummary(ac.signal), 60000);
    return () => {
      ac.abort();
      clearInterval(t);
    };
  }, [fetchSummary]);

  /* detect location */
  const detectLocation = () => {
    if (!navigator.geolocation) return setLocError("Location not supported");
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let label = "Your location";
        try {
          const { data } = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
            params: {
              lat: coords.latitude,
              lon: coords.longitude,
              apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
            },
          });
          const p = data.features?.[0]?.properties;
          if (p) label = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(", ");
        } catch {}
        const next = { lat: coords.latitude, lon: coords.longitude, label };
        setLoc(next);
        try {
          localStorage.setItem(LOC_KEY, JSON.stringify(next));
        } catch {}
        setLocating(false);
      },
      (err) => {
        setLocError(err.code === 1 ? "Location permission denied" : "Couldn't get location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* go to booking page. extra: { workerId (user id of labour), workerName, at } */
  const handleHire = (slug, type = "now", extra = {}) => {
    if (!auth) return onAuthRequired?.();
    const params = new URLSearchParams({ type });
    if (slug) params.set("category", slug);
    if (extra.workerId) params.set("workerId", extra.workerId);
    if (extra.workerName) params.set("workerName", extra.workerName);
    if (extra.at) params.set("at", extra.at);
    if (loc) {
      params.set("lat", String(loc.lat));
      params.set("lon", String(loc.lon));
      params.set("address", loc.label || "");
    }
    router.push(`/user/book?${params.toString()}`);
  };

  /* card primary button: with location -> show who is free/busy; without -> normal booking flow */
  const handleOpen = (slug) => (loc ? setDrawerSlug(slug) : handleHire(slug, "now"));

  const closeDrawer = useCallback(() => setDrawerSlug(null), []);

  const handlePick = (worker, type, at) =>
    handleHire(drawerSlug, type, { workerId: worker.userId, workerName: worker.name, at });

  const handleViewRates = (slug) => router.push(`/labour?category=${slug}`);

  /* slider arrows */
  const updateArrows = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = sliderRef.current;
    el?.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el?.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const slide = (dir) => sliderRef.current?.scrollBy({ left: dir * 310, behavior: "smooth" });

  /* header banner: 30-min claim ONLY when real supply supports it */
  const hasLoc = !!loc;
  const cats = summary?.categories || {};
  const etas = Object.values(cats)
    .filter((c) => c.eta30 && c.etaMinutes != null)
    .map((c) => c.etaMinutes);
  const fastest = etas.length ? Math.min(...etas) : null;
  const totals = summary?.totals;

  const banner = !hasLoc
    ? { text: "Set your location to see live availability", tone: "neutral" }
    : fastest != null
    ? { text: `Hire labour at your home in about ${fastest} min`, tone: "good" }
    : loaded && summary
    ? { text: "Workers are busy nearby — book one for later", tone: "warn" }
    : { text: "Checking nearby workers…", tone: "neutral" };

  const bannerStyle = {
    good: "border-emerald-300/60 bg-emerald-50 text-emerald-700",
    warn: "border-amber-300/60 bg-amber-50 text-amber-700",
    neutral: "border-orange-200 bg-orange-50 text-orange-600",
  }[banner.tone];

  const TRUST = [
    {
      icon: ShieldCheck,
      title: totals?.verified > 0 ? `${totals.verified.toLocaleString("en-IN")} ID-verified workers` : "ID-verified workers",
      desc: "Profiles approved by our team",
    },
    {
      icon: HardHat,
      title:
        totals?.jobsCompleted > 0
          ? `${totals.jobsCompleted.toLocaleString("en-IN")} ${totals.jobsCompleted === 1 ? "job" : "jobs"} completed`
          : "Skilled & experienced workforce",
      desc: "Quality work, every time.",
    },
    { icon: Clock, title: "Live availability", desc: "Updated every minute" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-linear-to-b from-white via-orange-50/30 to-white px-4 py-16 sm:px-8 lg:px-14">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border-30 border-orange-300/30" />

      <div className="relative mx-auto max-w-7xl">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="min-w-0"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-0.5 w-10 rounded-full bg-orange-500" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Our Services</span>
            </div>
            <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              Find the right <span className="text-orange-500">professional</span>
            </h2>
            <p className="mt-4 text-base text-zinc-500 sm:text-lg">
              Skilled workers for every job, right where you need them.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${bannerStyle}`}>
                <Clock size={14} /> {banner.text}
              </span>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="inline-flex max-w-xs cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:border-orange-300 hover:text-orange-600 disabled:cursor-wait"
              >
                {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                <span className="truncate">{loc ? loc.label : "Use my location"}</span>
              </button>
              {locError && <span className="text-xs text-red-500">{locError}</span>}
            </div>
          </motion.div>

          {/* right side: features + Book Now + arrows */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6 lg:items-end"
          >
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-zinc-200">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-center gap-3 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                    <Icon size={20} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-zinc-900">{title}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleHire(null, "now")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-900 px-7 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-black hover:shadow-xl active:scale-[0.97]"
              >
                <Zap size={16} className="text-orange-400" /> Book Now
              </button>
              <button
                type="button"
                onClick={() => slide(-1)}
                disabled={!canLeft}
                aria-label="Scroll left"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-zinc-200 disabled:hover:bg-white disabled:hover:text-zinc-700"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => slide(1)}
                disabled={!canRight}
                aria-label="Scroll right"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-zinc-200 disabled:hover:bg-white disabled:hover:text-zinc-700"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* ---------- Cards (horizontal scroll — new categories just append) ---------- */}
        <div
          ref={sliderRef}
          className="-mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-8 pt-2 sm:-mx-8 sm:px-8 lg:-mx-14 lg:px-14 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((item, i) => (
            <ServiceCard
              key={item.slug}
              item={item}
              index={i}
              data={cats[item.slug]}
              loaded={loaded}
              hasLoc={hasLoc}
              onOpen={handleOpen}
              onSchedule={(slug) => handleHire(slug, "scheduled")}
              onViewRates={handleViewRates}
            />
          ))}
        </div>

        {/* ---------- Trust strip (real numbers only) ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-2 grid grid-cols-1 gap-6 rounded-3xl bg-orange-50/80 px-6 py-6 ring-1 ring-orange-100 md:grid-cols-3 md:gap-0 md:divide-x md:divide-orange-200/60 md:px-4"
        >
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 md:justify-center md:px-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                <Icon size={22} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-zinc-900">{title}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ---------- Who is free / busy drawer ---------- */}
      <AnimatePresence>
        {drawerItem && loc && (
          <WorkersDrawer
            key={drawerItem.slug}
            item={drawerItem}
            loc={loc}
            onClose={closeDrawer}
            onPick={handlePick}
            onAuto={() => handleHire(drawerItem.slug, "now")}
            onSchedule={() => handleHire(drawerItem.slug, "scheduled")}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default HireLabour;