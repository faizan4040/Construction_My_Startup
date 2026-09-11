"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"

const POLL_INTERVAL = 15000 // 15s

/**
 * @param {string} endpoint - e.g. "/api/shopowner/dashboard/notifications/orders" or "/api/dashboard/admin/notifications/orders"
 * @param {string} storageKey - localStorage key, unique per role, e.g. "shopowner_last_seen_order_id"
 */
export function useOrderNotifications(endpoint, storageKey) {
  const [notifications, setNotifications] = useState([])
  const [unseenCount, setUnseenCount] = useState(0)
  const audioRef = useRef(null)
  const lastSeenRef = useRef(null)
  const isFirstLoad = useRef(true)
  const inFlight = useRef(false)

  useEffect(() => {
    audioRef.current = new Audio("/assets/sounds/new-order.mp3")
    audioRef.current.volume = 0.6
    lastSeenRef.current =
      typeof window !== "undefined" ? localStorage.getItem(storageKey) : null
  }, [storageKey])

  const playSound = useCallback(() => {
    audioRef.current?.play().catch(() => {
      // Autoplay blocked until the user interacts with the page once — expected browser behavior.
    })
  }, [])

  const fetchNotifications = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    try {
      const res = await axios.get(endpoint, {
        params: { after: lastSeenRef.current || "" },
      })

      if (res.data?.success) {
        const orders = res.data.data || []
        setNotifications(orders)
        setUnseenCount(orders.length)

        if (!isFirstLoad.current && orders.length > 0) {
          playSound()
        }
        isFirstLoad.current = false
      }
    } catch (err) {
      console.error("Notification fetch error:", err)
    } finally {
      inFlight.current = false
    }
  }, [endpoint, playSound])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAllRead = useCallback(() => {
    if (notifications.length > 0) {
      const latestId = notifications[0]._id || notifications[0].id
      lastSeenRef.current = latestId
      localStorage.setItem(storageKey, latestId)
    }
    setUnseenCount(0)
  }, [notifications, storageKey])

  return { notifications, unseenCount, markAllRead }
}