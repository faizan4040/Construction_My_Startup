"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { connectSocket } from "@/lib/socket-client";

const ChatContext = createContext(null);

export function ChatProvider({ children, userId }) {

  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [unread, setUnread] = useState(0);

  // 👇 NEW state (controls chat icon visibility)
  const [showButton, setShowButton] = useState(false);

  // Connect socket when userId exists
  useEffect(() => {
    if (!userId) return;

    connectSocket({ userId, role: "user" });

  }, [userId]);

  async function openChat() {
    if (!userId) return;

    // Create or get room
    if (!roomId) {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        setRoomId(data.data._id);
      }
    }

    setShowButton(true); // show floating chat icon
    setOpen(true);       // open chat window
    setUnread(0);
  }

  function closeChat() {
    setOpen(false);
  }

  return (
    <ChatContext.Provider
      value={{
        open,
        setOpen,
        openChat,
        closeChat,
        roomId,
        userId,
        unread,
        setUnread,
        showButton,      // expose
        setShowButton    // expose
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error("useChat must be used inside <ChatProvider>");
  }

  return ctx;
};








// 'use client'

// import { createContext, useContext, useState } from 'react'

// const ChatContext = createContext()

// export const ChatProvider = ({ children }) => {
//   const [open, setOpen] = useState(false)        
//   const [showButton, setShowButton] = useState(false) 

//   return (
//     <ChatContext.Provider value={{ open, setOpen, showButton, setShowButton }}>
//       {children}
//     </ChatContext.Provider>
//   )
// }


// export const useChat = () => useContext(ChatContext)
