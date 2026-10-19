"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Bell, LogOut, Menu, User } from "lucide-react";
import axios from "axios";
import { Avatar, AvatarImage } from "../ui/avatar";
import { IMAGES } from "@/routes/AllImages";
import { logout } from "@/store/reducer/authReducer";
import { getSocket } from "@/lib/socket-client";

/* Adjust these routes if your actual paths are different */
const NAV_LINKS = [
  { label: "Home", href: "/partner/dashboard" },
  { label: "Pending Requests", href: "/partner/pending-requests", badge: true },
  { label: "Bookings", href: "/partner/bookings" },
  { label: "Active Job", href: "/partner/active-ride" },
];

const PENDING_HREF = "/partner/pending-requests";
const ACCENT = "#F5A623"; // safety-amber — construction/high-vis accent
const COUNT_REFRESH_MS = 30000;

const isActive = (pathname, href) =>
  pathname === href || pathname.startsWith(`${href}/`);

const formatCount = (n) => (n > 99 ? "99+" : n);

/* Defined OUTSIDE the header so it is not re-created (remounted) on every render */
function AvatarCircle({ auth, size = 44 }) {
  const initial = auth?.name?.charAt(0)?.toUpperCase();
  return (
    <span
      className="rounded-full bg-white text-black font-bold flex items-center justify-center overflow-hidden shrink-0 select-none"
      style={{ width: size, height: size }}
    >
      {auth?.avatar?.url ? (
        <Avatar style={{ width: size, height: size }}>
          <AvatarImage src={auth.avatar.url} className="object-cover" />
        </Avatar>
      ) : initial ? (
        <span className="text-base">{initial}</span>
      ) : (
        <User size={18} />
      )}
    </span>
  );
}

function CountBadge({ count, className = "" }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={`px-1 rounded-full font-bold flex items-center justify-center text-black ${className}`}
      style={{ backgroundColor: ACCENT }}
    >
      {formatCount(count)}
    </span>
  );
}

export default function LabourHeader() {
  const auth = useSelector((store) => store.authStore.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const isLabour = auth?.role === "laber";
  const profileId = auth?._id ?? auth?.id;

  const [profileOpen, setProfileOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false); // mobile bottom sheet
  const [loggingOut, setLoggingOut] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const profileRef = useRef(null);

  /* ── close desktop dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (!(e.target instanceof Node)) return;
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  /* ── close menus on route change ── */
  useEffect(() => {
    setProfileOpen(false);
    setSheetOpen(false);
  }, [pathname]);

  /* ── Escape closes menus ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setSheetOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ── lock page scroll while mobile sheet is open ── */
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  /* ── pending requests count (server is the source of truth) ── */
  const fetchPendingCount = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/partner/bookings/pending-requests-count");
      const n = Number(data);
      setPendingCount(Number.isFinite(n) && n > 0 ? n : 0);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (isLabour) fetchPendingCount();
  }, [isLabour, fetchPendingCount]);

  /* ── live refresh: new request, cancelled request, socket reconnect ── */
  useEffect(() => {
    if (!isLabour) return;
    const socket = getSocket();
    const refresh = () => fetchPendingCount();

    socket.on("new-booking", refresh);
    socket.on("booking-cancelled", refresh);
    socket.on("connect", refresh); // catch anything missed while offline
    return () => {
      socket.off("new-booking", refresh);
      socket.off("booking-cancelled", refresh);
      socket.off("connect", refresh);
    };
  }, [isLabour, fetchPendingCount]);

  /* ── fallback: expired requests drop out of the count; refresh on tab focus ── */
  useEffect(() => {
    if (!isLabour) return;
    const tick = () => {
      if (document.visibilityState === "visible") fetchPendingCount();
    };
    const t = setInterval(tick, COUNT_REFRESH_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [isLabour, fetchPendingCount]);

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await axios.get("/api/auth/logout");
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(logout());
      setLoggingOut(false);
      setProfileOpen(false);
      setSheetOpen(false);
      router.push("/auth/login");
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50
                   w-[95%] sm:w-[92%] lg:w-[86%] max-w-7xl
                   rounded-full bg-[#0B0B0B]/95 backdrop-blur-md text-white
                   shadow-[0_15px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
      >
        <div
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3
                     px-4 sm:px-6 lg:px-8 h-14 sm:h-16"
        >
          {/* LEFT: Logo */}
          <Link href="/partner/dashboard" className="flex items-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMAGES.logo}
              className="h-8 sm:h-9 lg:h-10 w-auto object-contain"
              alt="ConstructEzy"
            />
          </Link>

          {/* CENTER: Nav Links (desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-10">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    active ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {link.label}
                    {link.badge && (
                      <CountBadge
                        count={pendingCount}
                        className="min-w-[20px] h-5 text-[11px]"
                      />
                    )}
                  </span>
                  <span
                    className={`absolute left-0 -bottom-0.5 h-0.5 rounded-full transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`}
                    style={{ backgroundColor: ACCENT }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Bell + Profile */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Notification bell (desktop + mobile) */}
            <Link
              href={PENDING_HREF}
              aria-label={
                pendingCount > 0
                  ? `Pending requests, ${pendingCount} new`
                  : "Pending requests"
              }
              className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center shrink-0"
            >
              <Bell size={18} />
              <CountBadge
                count={pendingCount}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] animate-pulse"
              />
            </Link>

            {/* Desktop profile dropdown */}
            <div className="hidden lg:block relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((p) => !p)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className="rounded-full ring-2 ring-transparent hover:ring-white/20 transition-all cursor-pointer"
                aria-label="Open profile menu"
              >
                <AvatarCircle auth={auth} size={40} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+12px)] right-0 w-72 bg-white text-black
                               rounded-2xl shadow-2xl border border-black/5 overflow-hidden origin-top-right"
                  >
                    <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
                      <AvatarCircle auth={auth} size={44} />
                      <div className="min-w-0">
                        <p className="font-semibold text-base truncate">{auth?.name}</p>
                        <p
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: ACCENT }}
                        >
                          Labour Partner
                        </p>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href={`/profile/${profileId}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <User size={17} />
                        <span className="text-sm font-medium">Profile</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                      >
                        <LogOut size={17} />
                        <span className="text-sm font-medium">
                          {loggingOut ? "Logging out..." : "Logout"}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile / tablet: opens bottom sheet */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="lg:hidden flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <AvatarCircle auth={auth} size={38} />
              <Menu size={18} className="text-gray-300" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── MOBILE / TABLET BOTTOM SHEET ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              className="fixed inset-x-0 bottom-0 z-50 lg:hidden
                         bg-white text-black rounded-t-3xl shadow-2xl
                         pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            >
              {/* drag handle (tap to close) */}
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close menu"
                className="flex justify-center pt-3 pb-1 w-full"
              >
                <span className="w-10 h-1.5 rounded-full bg-gray-300" />
              </button>

              <div className="px-6 pt-3">
                <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
                  <AvatarCircle auth={auth} size={48} />
                  <div className="min-w-0">
                    <p className="font-semibold text-lg truncate">{auth?.name}</p>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: ACCENT }}
                    >
                      Labour Partner
                    </p>
                  </div>
                </div>

                <nav className="flex flex-col py-2">
                  {NAV_LINKS.map((link) => {
                    const active = isActive(pathname, link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between px-2 py-3.5 rounded-xl transition-colors ${
                          active ? "bg-gray-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className="text-[15px] font-medium"
                          style={{ color: active ? ACCENT : "#111827" }}
                        >
                          {link.label}
                        </span>
                        {link.badge && (
                          <CountBadge
                            count={pendingCount}
                            className="min-w-[22px] h-[22px] px-1.5 text-xs"
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-gray-100 pt-2 pb-1">
                  <Link
                    href={`/profile/${profileId}`}
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-3 px-2 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <User size={18} />
                    <span className="text-[15px] font-medium">Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-2 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                  >
                    <LogOut size={18} />
                    <span className="text-[15px] font-medium">
                      {loggingOut ? "Logging out..." : "Logout"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}