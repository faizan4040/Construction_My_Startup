"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, User, Menu } from "lucide-react";
import axios from "axios";
import { Avatar, AvatarImage } from "../ui/avatar";
import { IMAGES } from "@/routes/AllImages";
import { logout } from "@/store/reducer/authReducer";
import { getSocket } from "@/lib/socket-client"; // NOTE: adjust path if your socket helper lives elsewhere

/* Adjust these routes if your actual paths are different */
const NAV_LINKS = [
  { label: "Home", href: "/partner/dashboard" },
  { label: "Pending Requests", href: "/partner/pending-requests", badge: true },
  { label: "Bookings", href: "/partner/bookings" },
  { label: "Active Ride", href: "/partner/active-ride" },
];

const ACCENT = "#F5A623"; // safety-amber — construction/high-vis accent

export default function LabourHeader() {
  const auth = useSelector((store) => store.authStore.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

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

  /* ── fetch pending requests count ── */
  const fetchPendingCount = async () => {
    try {
      // NOTE: adjust this endpoint to match your actual pending-requests-count API
      const { data } = await axios.get("/api/partner/bookings/pending-requests-count");
      setPendingCount(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.role === "laber") {
      fetchPendingCount();
    }
  }, [auth?.role]);

  /* ── live update via socket when a new booking comes in ── */
  useEffect(() => {
    const socket = getSocket();
    socket.on("new-booking", () => {
      setPendingCount((prev) => prev + 1);
    });
    return () => {
      socket.off("new-booking");
    };
  }, []);

  const handleLogout = async () => {
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

  const initial = auth?.name?.charAt(0)?.toUpperCase();

  const AvatarCircle = ({ size = 44 }) => (
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
            <img
              src={IMAGES.logo}
              className="h-8 sm:h-9 lg:h-10 w-auto object-contain"
              alt="ConstructEzy"
            />
          </Link>

          {/* CENTER: Nav Links (desktop/tablet) */}
          <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-10">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-2">
                    {link.label}
                    {link.badge && pendingCount > 0 && (
                      <span
                        className="min-w-5 h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center text-black"
                        style={{ backgroundColor: ACCENT }}
                      >
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    )}
                  </span>
                  {/* active indicator */}
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

          {/* RIGHT: Profile */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Desktop profile dropdown trigger */}
            <div className="hidden lg:block relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="rounded-full ring-2 ring-transparent hover:ring-white/20 transition-all cursor-pointer"
                aria-label="Open profile menu"
              >
                <AvatarCircle size={40} />
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
                      <AvatarCircle size={44} />
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
                        href={`/profile/${auth?.id}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <User size={17} />
                        <span className="text-sm font-medium">Profile</span>
                      </Link>
                      <button
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

            {/* Mobile / tablet: hamburger opens bottom sheet with links + profile */}
            <button
              onClick={() => setSheetOpen(true)}
              className="lg:hidden flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              {pendingCount > 0 && (
                <span
                  className="min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-black"
                  style={{ backgroundColor: ACCENT }}
                >
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
              <AvatarCircle size={38} />
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
              className="fixed inset-x-0 bottom-0 z-50 lg:hidden
                         bg-white text-black rounded-t-3xl shadow-2xl
                         pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            >
              {/* drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <span className="w-10 h-1.5 rounded-full bg-gray-300" />
              </div>

              <div className="px-6 pt-3">
                <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
                  <AvatarCircle size={48} />
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
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
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
                        {link.badge && pendingCount > 0 && (
                          <span
                            className="min-w-5.5 h-5.5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center text-black"
                            style={{ backgroundColor: ACCENT }}
                          >
                            {pendingCount > 99 ? "99+" : pendingCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-gray-100 pt-2 pb-1">
                  <Link
                    href={`/profile/${auth?.id}`}
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-3 px-2 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <User size={18} />
                    <span className="text-[15px] font-medium">Profile</span>
                  </Link>
                  <button
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