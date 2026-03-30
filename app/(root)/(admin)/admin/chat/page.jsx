"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Send, Menu, X,
  Paperclip, CheckCheck, Check,
  MessageSquare, Loader2,
  MoreVertical, Phone, Video, User,
} from "lucide-react";
import { connectSocket, getSocket } from "@/lib/socket-client";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID || "000000000000000000000001";
const TYPING_TIMEOUT = 1500;

export default function AdminChat() {
  const [rooms,        setRooms]        = useState([]);
  const [activeRoom,   setActiveRoom]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [message,      setMessage]      = useState("");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [search,       setSearch]       = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [userTyping,   setUserTyping]   = useState(false);
  const [onlineUsers,  setOnlineUsers]  = useState(new Set());
  const [unreadMap,    setUnreadMap]    = useState({});

  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  const inputRef       = useRef(null);
  const activeRoomRef  = useRef(null);

  useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, userTyping]);

  // ── Connect socket + global listeners ──────────────────────────────────────
  useEffect(() => {
    connectSocket({ userId: ADMIN_ID, role: "admin" });
    const socket = getSocket();

    const onMessage = (msg) => {
      const currentRoom = activeRoomRef.current;

      // Always update sidebar last message preview
      setRooms((prev) =>
        prev
          .map((r) =>
            r._id.toString() === msg.roomId.toString()
              ? { ...r, lastMessage: msg.message, lastMessageAt: msg.createdAt }
              : r
          )
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );

      if (currentRoom && msg.roomId.toString() === currentRoom._id.toString()) {
        // Active room — append message
        setMessages((prev) => {
          const exists = prev.some((m) => m._id && m._id === msg._id);
          if (exists) return prev;
          const optIdx = prev.findIndex(
            (m) => !m._id && m.message === msg.message && m.senderType === msg.senderType
          );
          if (optIdx !== -1) {
            const copy = [...prev];
            copy[optIdx] = msg;
            return copy;
          }
          return [...prev, msg];
        });
        setUserTyping(false);
        if (msg.senderType === "user") {
          socket.emit("mark-read", { roomId: msg.roomId, readerType: "admin" });
        }
      } else {
        // Background room — unread badge
        if (msg.senderType === "user") {
          setUnreadMap((prev) => ({
            ...prev,
            [msg.roomId]: (prev[msg.roomId] || 0) + 1,
          }));
        }
      }
    };

    const onTyping = ({ roomId, senderType }) => {
      if (activeRoomRef.current?._id?.toString() === roomId?.toString() && senderType === "user")
        setUserTyping(true);
    };
    const onStopTyping = ({ roomId, senderType }) => {
      if (activeRoomRef.current?._id?.toString() === roomId?.toString() && senderType === "user")
        setUserTyping(false);
    };
    const onPresence = ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        status === "online" ? next.add(userId) : next.delete(userId);
        return next;
      });
    };

    socket.on("receive-message",  onMessage);
    socket.on("user-typing",      onTyping);
    socket.on("user-stop-typing", onStopTyping);
    socket.on("presence-update",  onPresence);

    return () => {
      socket.off("receive-message",  onMessage);
      socket.off("user-typing",      onTyping);
      socket.off("user-stop-typing", onStopTyping);
      socket.off("presence-update",  onPresence);
    };
  }, []);

  // ── Fetch rooms + join all room sockets ────────────────────────────────────
  useEffect(() => {
    setLoadingRooms(true);
    fetch("/api/chat/rooms")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRooms(d.data);
          const socket = getSocket();
          const joinAll = () => {
            d.data.forEach((room) => socket.emit("join-room", room._id.toString()));
          };
          socket.connected ? joinAll() : socket.once("connect", joinAll);
        }
      })
      .finally(() => setLoadingRooms(false));
  }, []);

  // ── Select room ────────────────────────────────────────────────────────────
  const selectRoom = useCallback((room) => {
    setActiveRoom(room);
    setSidebarOpen(false);
    setMessages([]);
    setUserTyping(false);
    setUnreadMap((prev) => ({ ...prev, [room._id]: 0 }));

    setLoadingMsgs(true);
    fetch(`/api/chat/messages?roomId=${room._id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setMessages(d.data); })
      .finally(() => setLoadingMsgs(false));

    const socket = getSocket();
    socket.emit("join-room", room._id.toString());
    socket.emit("mark-read", { roomId: room._id, readerType: "admin" });
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  // ── Typing ─────────────────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!activeRoom) return;
    const socket = getSocket();
    socket.emit("typing", { roomId: activeRoom._id, senderType: "admin" });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop-typing", { roomId: activeRoom._id, senderType: "admin" });
    }, TYPING_TIMEOUT);
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!message.trim() || !activeRoom) return;
    const socket = getSocket();
    if (!socket?.connected) return;

    clearTimeout(typingTimer.current);
    socket.emit("stop-typing", { roomId: activeRoom._id, senderType: "admin" });

    // No optimistic — server echo handles display (prevents duplicates)
    socket.emit("send-message", {
      roomId:     activeRoom._id.toString(),
      senderType: "admin",
      senderId:   ADMIN_ID,
      message:    message.trim(),
    });
    setMessage("");
  }, [message, activeRoom]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (date) => {
    if (!date) return "";
    const d   = new Date(date);
    const now = new Date();
    return d.toDateString() === now.toDateString()
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const userIdShort = (id) =>
    id ? `#${id.toString().slice(-5).toUpperCase()}` : "??";

  const avatarColor = (id) =>
    `hsl(${parseInt((id || "0").toString().slice(-3), 16) % 360}, 60%, 50%)`;

  const filteredRooms = rooms.filter((r) => {
    const q = search.toLowerCase();
    return (
      r._id?.toString().includes(q) ||
      (r.lastMessage || "").toLowerCase().includes(q) ||
      r.userId?.toString().toLowerCase().includes(q)
    );
  });

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full h-[79vh] bg-gray-100 flex items-stretch ">
      <div className="bg-white shadow-xl flex w-full overflow-hidden border-0 rounded-2xl">

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ═══════════════════ SIDEBAR ═══════════════════════════════════════ */}
        <div
          className={`
            bg-white border-r w-80 shrink-0 flex flex-col
            transition-transform duration-300
            fixed lg:relative z-50 lg:z-auto h-full
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          `}
        >
          {/* Sidebar header */}
          <div className="p-5 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
                {totalUnread > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </div>
              <X
                size={18}
                className="cursor-pointer lg:hidden text-gray-500 hover:text-gray-800"
                onClick={() => setSidebarOpen(false)}
              />
            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <Search size={15} className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
            </div>
          </div>

          {/* Room list */}
          <div className="flex-1 overflow-y-auto">
            {loadingRooms && (
              <div className="flex justify-center py-12">
                <Loader2 size={22} className="animate-spin text-orange-400" />
              </div>
            )}

            {!loadingRooms && filteredRooms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <MessageSquare size={32} className="text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">No conversations yet</p>
              </div>
            )}

            {filteredRooms.map((room) => {
              const isActive  = activeRoom?._id?.toString() === room._id?.toString();
              const isOnline  = onlineUsers.has(room.userId?.toString());
              const unreadCnt = unreadMap[room._id] || 0;

              return (
                <div
                  key={room._id}
                  onClick={() => selectRoom(room)}
                  className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all ${
                    isActive
                      ? "bg-orange-50 border-l-4 border-orange-500"
                      : "hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: avatarColor(room.userId) }}
                      >
                        {userIdShort(room.userId).replace("#", "").slice(0, 2)}
                      </div>
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                        style={{ background: isOnline ? "#22c55e" : "#d1d5db" }}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-medium text-sm text-gray-800 truncate">
                        User {userIdShort(room.userId)}
                      </h4>
                      <p className="text-xs text-gray-500 truncate w-36">
                        {userTyping && isActive
                          ? <span className="text-orange-500 animate-pulse">typing...</span>
                          : room.lastMessage || "No messages yet"
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span className="text-xs text-gray-400">
                      {formatTime(room.lastMessageAt)}
                    </span>
                    {unreadCnt > 0 && (
                      <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                        {unreadCnt > 9 ? "9+" : unreadCnt}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin footer */}
          <div className="p-4 border-t bg-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Admin</p>
              <p className="text-xs text-green-500">● Online</p>
            </div>
          </div>
        </div>

        {/* ═══════════════════ MAIN CHAT ════════════════════════════════════ */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">

          {/* Chat Header */}
          <div className="p-5 border-b flex justify-between items-center bg-white shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <button
                className="text-gray-500 hover:text-gray-800 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>

              {activeRoom ? (
                <>
                  <div className="relative shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: avatarColor(activeRoom.userId) }}
                    >
                      {userIdShort(activeRoom.userId).replace("#", "").slice(0, 2)}
                    </div>
                    <span
                      className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white"
                      style={{
                        background: onlineUsers.has(activeRoom.userId?.toString())
                          ? "#22c55e" : "#d1d5db",
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-gray-800">
                      User {userIdShort(activeRoom.userId)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {userTyping ? (
                        <span className="text-orange-500 animate-pulse">typing...</span>
                      ) : onlineUsers.has(activeRoom.userId?.toString()) ? (
                        <span className="text-green-500">Online</span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Select a conversation</p>
              )}
            </div>

            {activeRoom && (
              <div className="flex items-center gap-4 text-gray-500 text-lg">
                <button className="hover:text-orange-500 transition">
                  <Video size={20} />
                </button>
                <button className="hover:text-orange-500 transition">
                  <Phone size={20} />
                </button>
                <button className="hover:text-orange-500 transition hidden sm:block">
                  <User size={20} />
                </button>
                <button className="hover:text-orange-500 transition">
                  <MoreVertical size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ minHeight: 0 }}>

            {/* Empty state — no room selected */}
            {!activeRoom && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                  <MessageSquare size={36} className="text-orange-300" />
                </div>
                <p className="text-gray-500 font-medium">No conversation selected</p>
                <p className="text-gray-400 text-sm mt-1">
                  Choose a chat from the sidebar to start responding
                </p>
              </motion.div>
            )}

            {/* Loading */}
            {activeRoom && loadingMsgs && (
              <div className="flex justify-center py-10">
                <Loader2 size={22} className="animate-spin text-orange-400" />
              </div>
            )}

            {/* No messages yet */}
            {activeRoom && !loadingMsgs && messages.length === 0 && (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-400 text-sm">No messages yet — say hello! 👋</p>
              </div>
            )}

            {/* Message bubbles */}
            {!loadingMsgs && messages.map((msg, i) => {
              const isAdmin = msg.senderType === "admin";
              return (
                <motion.div
                  key={msg._id || `opt-${i}`}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col gap-1 max-w-xs">
                    <div
                      className={`px-5 py-3 rounded-2xl text-sm shadow-sm ${
                        isAdmin
                          ? "bg-orange-500 text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <div className={`flex items-center gap-1 px-1 ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-gray-400">
                        {formatTime(msg.createdAt)}
                      </span>
                      {isAdmin && (
                        msg._id
                          ? <CheckCheck size={11} className="text-orange-400" />
                          : <Check      size={11} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing indicator */}
            <AnimatePresence>
              {userTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="flex justify-start"
                >
                  <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-gray-400"
                          style={{ animation: "typingBounce 1.2s infinite", animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {activeRoom && (
            <div className="p-5 border-t flex items-center gap-4 bg-white shrink-0">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-gray-50 text-gray-800"
              />

              <label className="cursor-pointer text-gray-400 hover:text-orange-500 transition">
                <Paperclip size={20} />
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file || !activeRoom) return;
                    const socket = getSocket();
                    socket.emit("send-message", {
                      roomId:     activeRoom._id.toString(),
                      senderType: "admin",
                      senderId:   ADMIN_ID,
                      message:    `📎 ${file.name}`,
                    });
                    e.target.value = "";
                  }}
                />
              </label>

              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className={`p-3 rounded-xl text-white transition shadow-md ${
                  message.trim()
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-gray-200 cursor-not-allowed"
                }`}
              >
                <Send size={17} className={message.trim() ? "text-white" : "text-gray-400"} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

