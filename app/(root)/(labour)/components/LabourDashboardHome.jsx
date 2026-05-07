"use client"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import {
  RiBriefcaseLine, RiCheckboxCircleLine, RiNotification3Line,
  RiUser3Line, RiMapPinLine, RiTimeLine, RiStarFill,
  RiPhoneLine, RiCalendarLine, RiMessage3Line,
  RiCheckLine, RiCloseLine, RiSendPlaneLine, RiShieldCheckLine,
  RiMoneyDollarCircleLine, RiToolsLine, RiLogoutBoxLine,
  RiMenuLine, RiArrowLeftLine, RiBellLine
} from "react-icons/ri"

const STATUS_COLORS = {
  pending:   { bg: "bg-yellow-100",  text: "text-yellow-700",  label: "Pending"   },
  accepted:  { bg: "bg-green-100",   text: "text-green-700",   label: "Accepted"  },
  rejected:  { bg: "bg-red-100",     text: "text-red-700",     label: "Rejected"  },
  completed: { bg: "bg-blue-100",    text: "text-blue-700",    label: "Completed" },
  cancelled: { bg: "bg-gray-100",    text: "text-gray-500",    label: "Cancelled" },
}

export default function LabourDashboardHome({ profile, onProfileUpdate }) {
  const [bookings, setBookings]             = useState([])
  const [notifications, setNotifications]   = useState([])
  const [notifCount, setNotifCount]         = useState(0)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [activeTab, setActiveTab]           = useState("overview")
  const [chatBooking, setChatBooking]       = useState(null)
  const [messages, setMessages]             = useState([])
  const [msgText, setMsgText]               = useState("")
  const [sendingMsg, setSendingMsg]         = useState(false)
  const [sidebarOpen, setSidebarOpen]       = useState(false)
  const messagesEndRef = useRef(null)

  // ── Fetch bookings ──────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/labour/booking", { withCredentials: true })
      setBookings(data.bookings || [])
    } catch (err) {
      console.error("fetchBookings error:", err)
    } finally {
      setLoadingBookings(false)
    }
  }

  // ── Fetch notifications ─────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("/api/labour/notifications", { withCredentials: true })
      setNotifications(data.notifications || [])
      setNotifCount(data.count || 0)
    } catch (err) {
      console.error("fetchNotifications error:", err)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchNotifications()
    // Poll notifications every 30s
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── Accept / Reject booking ─────────────────────────────────
  const handleAction = async (bookingId, action) => {
    try {
      await axios.patch(
        `/api/labour/booking/${bookingId}/accept`,
        { action },
        { withCredentials: true }
      )
      fetchBookings()
      fetchNotifications()
    } catch (err) {
      console.error("handleAction error:", err)
    }
  }

  // ── Open chat ───────────────────────────────────────────────
  const openChat = async (booking) => {
    setChatBooking(booking)
    setActiveTab("chat")
    try {
      const { data } = await axios.get(
        `/api/labour/booking/${booking._id}/message`,
        { withCredentials: true }
      )
      setMessages(data.messages || [])
    } catch (err) {
      console.error("openChat error:", err)
    }
  }

  // ── Send message ────────────────────────────────────────────
  const sendMessage = async () => {
    if (!msgText.trim() || !chatBooking) return
    setSendingMsg(true)
    try {
      const { data } = await axios.post(
        `/api/labour/booking/${chatBooking._id}/message`,
        { text: msgText.trim() },
        { withCredentials: true }
      )
      setMessages((prev) => [...prev, data.data])
      setMsgText("")
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (err) {
      console.error("sendMessage error:", err)
    } finally {
      setSendingMsg(false)
    }
  }

  // ── Mark notifications read ─────────────────────────────────
  const markAllRead = async () => {
    try {
      await axios.patch("/api/labour/notifications", {}, { withCredentials: true })
      setNotifCount(0)
      fetchNotifications()
    } catch {}
  }

  // ── Stats ───────────────────────────────────────────────────
  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    accepted:  bookings.filter((b) => b.status === "accepted").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  }

  const NAV_ITEMS = [
    { id: "overview",      icon: RiBriefcaseLine,        label: "Overview"      },
    { id: "bookings",      icon: RiCalendarLine,         label: "Bookings"      },
    { id: "notifications", icon: RiBellLine,             label: "Notifications" },
    { id: "profile",       icon: RiUser3Line,            label: "My Profile"    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <RiToolsLine className="text-white text-lg" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Labour</p>
              <p className="font-bold text-sm leading-tight">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Profile mini */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-3">
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt="avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <RiUser3Line className="text-orange-400 text-lg" />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{profile.firstName} {profile.lastName}</p>
              <p className="text-orange-400 text-xs truncate">{profile.profession}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className="text-lg shrink-0" />
                <span>{item.label}</span>
                {item.id === "notifications" && notifCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Verified badge */}
        {profile.isVerified && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
              <RiShieldCheckLine className="text-green-400 text-base" />
              <span className="text-green-400 text-xs font-semibold">Verified Profile</span>
            </div>
          </div>
        )}

        <div className="px-4 pb-5">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <RiLogoutBoxLine className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <RiMenuLine className="text-xl text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-lg capitalize">
                {activeTab === "chat" ? (
                  <button className="flex items-center gap-2 text-base" onClick={() => setActiveTab("bookings")}>
                    <RiArrowLeftLine className="text-orange-500" /> Back to Bookings
                  </button>
                ) : activeTab}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveTab("notifications"); markAllRead() }}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <RiNotification3Line className="text-xl text-gray-600" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt="avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-orange-400" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                <RiUser3Line className="text-orange-500" />
              </div>
            )}
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
                <p className="text-orange-100 text-sm mb-1">Welcome back,</p>
                <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
                <p className="text-orange-100 text-sm mt-1">{profile.profession} · {profile.city}, {profile.state}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                    <p className="text-2xl font-black">{stats.total}</p>
                    <p className="text-xs text-orange-100">Total Jobs</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                    <p className="text-2xl font-black">{stats.pending}</p>
                    <p className="text-xs text-orange-100">Pending</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                    <p className="text-2xl font-black">{stats.completed}</p>
                    <p className="text-xs text-orange-100">Completed</p>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Bookings", value: stats.total,     icon: RiBriefcaseLine,       color: "text-blue-500",   bg: "bg-blue-50"   },
                  { label: "Pending",        value: stats.pending,   icon: RiTimeLine,            color: "text-yellow-500", bg: "bg-yellow-50" },
                  { label: "Accepted",       value: stats.accepted,  icon: RiCheckboxCircleLine,  color: "text-green-500",  bg: "bg-green-50"  },
                  { label: "Completed",      value: stats.completed, icon: RiStarFill,            color: "text-orange-500", bg: "bg-orange-50" },
                ].map((s) => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className={`text-xl ${s.color}`} />
                      </div>
                      <p className="text-2xl font-black text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  )
                })}
              </div>

              {/* Recent bookings preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Recent Booking Requests</h3>
                  <button onClick={() => setActiveTab("bookings")}
                    className="text-orange-500 text-xs font-semibold hover:underline">
                    View All
                  </button>
                </div>
                {loadingBookings ? (
                  <div className="p-6 space-y-3">
                    {[1,2,3].map((i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-10 text-center">
                    <RiBriefcaseLine className="text-4xl text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No bookings yet</p>
                    <p className="text-gray-300 text-xs mt-1">Your booking requests will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {bookings.slice(0, 5).map((b) => {
                      const s = STATUS_COLORS[b.status] || STATUS_COLORS.pending
                      return (
                        <div key={b._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                              <RiUser3Line className="text-orange-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{b.clientName}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(b.workDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">All Bookings ({bookings.length})</h2>
              </div>
              {loadingBookings ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <RiBriefcaseLine className="text-5xl text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No bookings yet</p>
                  <p className="text-gray-300 text-sm mt-1">When clients book you, they'll show up here</p>
                </div>
              ) : (
                bookings.map((b) => {
                  const s = STATUS_COLORS[b.status] || STATUS_COLORS.pending
                  return (
                    <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <RiUser3Line className="text-orange-500 text-xl" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{b.clientName}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <RiPhoneLine /> {b.clientPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <RiCalendarLine />
                                {new Date(b.workDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{b.description}</p>
                            {b.address && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <RiMapPinLine /> {b.address}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                        {b.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(b._id, "accepted")}
                              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition"
                            >
                              <RiCheckLine /> Accept
                            </button>
                            <button
                              onClick={() => handleAction(b._id, "rejected")}
                              className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-full transition"
                            >
                              <RiCloseLine /> Reject
                            </button>
                          </>
                        )}
                        {(b.status === "accepted" || b.status === "completed") && (
                          <button
                            onClick={() => openChat(b)}
                            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-full transition"
                          >
                            <RiMessage3Line /> Chat with Client
                          </button>
                        )}
                        {b.messages?.length > 0 && (
                          <span className="text-xs text-gray-400 ml-auto">
                            {b.messages.length} message{b.messages.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                {notifications.length > 0 && (
                  <button onClick={markAllRead}
                    className="text-xs text-orange-500 font-semibold hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <RiBellLine className="text-5xl text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">All caught up!</p>
                  <p className="text-gray-300 text-sm mt-1">New booking requests will appear here</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                      <RiNotification3Line className="text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">
                        New booking from <span className="text-orange-500">{n.clientName}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><RiPhoneLine />{n.clientPhone}</span>
                        <span className="flex items-center gap-1">
                          <RiCalendarLine />
                          {new Date(n.workDate).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(n._id, "accepted")}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(n._id, "rejected")}
                        className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === "chat" && chatBooking && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[70vh]">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <RiUser3Line className="text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{chatBooking.clientName}</p>
                  <p className="text-xs text-gray-400">{chatBooking.clientPhone} · Booking Chat</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <RiMessage3Line className="text-4xl text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No messages yet</p>
                      <p className="text-gray-300 text-xs">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.senderRole === "labour"
                    return (
                      <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? "bg-orange-500 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-orange-200" : "text-gray-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
                <input
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Type a message..."
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMsg || !msgText.trim()}
                  className="w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition shrink-0"
                >
                  {sendingMsg
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <RiSendPlaneLine />
                  }
                </button>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-orange-400 to-amber-400" />
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-10 mb-4">
                    {profile.profileImageUrl ? (
                      <img src={profile.profileImageUrl} alt="avatar"
                        className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-orange-100 border-4 border-white shadow-lg flex items-center justify-center">
                        <RiUser3Line className="text-3xl text-orange-400" />
                      </div>
                    )}
                    <div className="pb-1">
                      <h2 className="text-xl font-black text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      <p className="text-orange-500 font-semibold text-sm">{profile.profession}</p>
                    </div>
                    {profile.isVerified && (
                      <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">
                        <RiShieldCheckLine /> Verified
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: RiPhoneLine,             label: "Phone",        value: profile.phone },
                      { icon: RiMapPinLine,            label: "Location",     value: `${profile.city}, ${profile.state} - ${profile.pincode}` },
                      { icon: RiTimeLine,              label: "Experience",   value: `${profile.experienceYears} years` },
                      { icon: RiMoneyDollarCircleLine, label: "Hourly Rate",  value: `₹${profile.hourlyRate}/hr` },
                      { icon: RiToolsLine,             label: "Availability", value: profile.availability?.replace("_", " ") },
                      { icon: RiTimeLine,              label: "Working Hrs",  value: profile.workingHours },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {profile.skills?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s) => (
                          <span key={s} className="bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.bio && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">About</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="font-bold text-gray-900 mb-3">Identity Document</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <RiShieldCheckLine className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 capitalize">
                      {profile.documentType?.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-400">{profile.documentNumber}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Pending Verification
                  </span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}