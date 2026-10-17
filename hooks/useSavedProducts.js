'use client'
import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "saved_products"
const CHANGE_EVENT = "saved-products-change"

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(raw || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorage(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // storage full / blocked - ignore
  }
  // tell every component on this page (header badge, buttons, saved page)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/**
 * Save-for-later store (localStorage based, works for guests and logged-in users).
 * Place this file at: hooks/useSavedProducts.js
 */
export function useSavedProducts() {
  const [saved, setSaved] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => setSaved(readStorage())
    sync()
    setReady(true)
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener("storage", sync) // other tabs
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const isSaved = useCallback(
    (id) => saved.some((p) => p?._id === id),
    [saved]
  )

  // returns true if product is now saved, false if it was removed
  const toggle = useCallback((product) => {
    if (!product?._id) return false
    const current = readStorage()
    const exists = current.some((p) => p?._id === product._id)
    const next = exists
      ? current.filter((p) => p?._id !== product._id)
      : [{ ...product, savedAt: Date.now() }, ...current]
    writeStorage(next)
    return !exists
  }, [])

  const remove = useCallback((id) => {
    writeStorage(readStorage().filter((p) => p?._id !== id))
  }, [])

  const clearAll = useCallback(() => writeStorage([]), [])

  return { saved, count: saved.length, ready, isSaved, toggle, remove, clearAll }
}