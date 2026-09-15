'use client'

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { showToast } from "@/lib/showToast"
import { Loader2, CameraOff } from "lucide-react"

const ScannerPage = () => {
  const scannerRef = useRef(null)
  const isRunningRef = useRef(false) // tracks actual running state, not just intent
  const [scanning, setScanning] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false
    const scanner = new Html5Qrcode("scanner-box")
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (scanning) return
          setScanning(true)

          try {
            const res = await fetch("/api/courier/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ labelCode: decodedText }),
            })
            const data = await res.json()
            setLastResult(data)
            showToast(data.success ? "success" : "error", data.message)
          } catch {
            showToast("error", "Scan failed. Try again.")
          } finally {
            setTimeout(() => setScanning(false), 1500)
          }
        },
        () => {} // per-frame "no QR found" callback — ignore, this fires constantly
      )
      .then(() => {
        if (!cancelled) {
          isRunningRef.current = true // ✅ only now is it safe to call stop()
          setInitializing(false)
        } else {
          // Component unmounted before start resolved — stop it immediately
          scanner.stop().catch(() => {})
        }
      })
      .catch((err) => {
        // Camera permission denied, no camera found, or already in use elsewhere
        if (!cancelled) {
          setInitializing(false)
          setCameraError(
            err?.message?.includes("Permission")
              ? "Camera permission denied. Please allow camera access and reload."
              : "Could not start camera. Make sure no other app is using it."
          )
        }
      })

    return () => {
      cancelled = true
      // ✅ only stop if it actually started — this is what was crashing before
      if (isRunningRef.current) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {})
        isRunningRef.current = false
      }
    }
  }, [])

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-3">Scan Shipment Label</h2>

      {initializing && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Starting camera...</p>
        </div>
      )}

      {cameraError && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-red-500 text-center">
          <CameraOff className="w-8 h-8" />
          <p className="text-sm">{cameraError}</p>
        </div>
      )}

      <div
        id="scanner-box"
        className="w-full rounded-lg overflow-hidden border"
        style={{ display: cameraError ? 'none' : 'block' }}
      />

      {lastResult && (
        <div className={`mt-4 p-3 rounded-md text-sm ${lastResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {lastResult.message}
        </div>
      )}
    </div>
  )
}

export default ScannerPage