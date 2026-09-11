"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import axios from "axios"

const ShopDashboardContext = createContext(null)

export const ShopDashboardProvider = ({ children }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/shopowner/dashboard/overview")
      if (res.data?.success) setData(res.data.data)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <ShopDashboardContext.Provider value={{ data, loading, refetch: fetchDashboard }}>
      {children}
    </ShopDashboardContext.Provider>
  )
}

export const useShopDashboard = () => {
  const ctx = useContext(ShopDashboardContext)
  if (!ctx) throw new Error("useShopDashboard must be used inside ShopDashboardProvider")
  return ctx
}