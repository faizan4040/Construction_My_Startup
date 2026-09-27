'use client'

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { showToast } from "@/lib/showToast"
import { Loader2, CameraOff, CheckCircle2, XCircle, ScanLine } from "lucide-react"

const ScannerPage = () => {
  const router = useRouter()
  const scannerInstanceRef = useRef(null)
  const isRunningRef = useRef(false)     // camera actually chal rahi hai ya nahi
  const isProcessingRef = useRef(false)  // ✅ REF hai, state nahi — stale-closure bug fix

  const [lastResult, setLastResult] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [cameraActive, setCameraActive] = useState(false)

  const stopCamera = async () => {
    if (isRunningRef.current && scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop()
      } catch {}
      isRunningRef.current = false
      setCameraActive(false)
    }
  }

  const startCamera = async () => {
    setInitializing(true)
    setCameraError(null)
    setLastResult(null)
    isProcessingRef.current = false

    const scanner = scannerInstanceRef.current
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // ✅ ref-based guard — closure stale nahi hoti, ye SACH me duplicate rokta hai
          if (isProcessingRef.current) return
          isProcessingRef.current = true

          // ✅ camera turant band — ab aur koi frame process hi nahi hoga,
          // isliye toast bhi sirf EK hi baar chalega
          await stopCamera()

          try {
            const res = await fetch("/api/courier/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ labelCode: decodedText }),
            })
            const data = await res.json()
            setLastResult(data)
            // ✅ ab exactly EK toast — success pe green, fail pe red (showToast isi ke hisaab se dikhata hai)
            showToast(data.success ? "success" : "error", data.message)

            if (data.success && data.data?.orderId) {
              setTimeout(() => {
                router.push(`/delivery/order/${data.data.orderId}`)
              }, 1200)
            }
          } catch {
            setLastResult({ success: false, message: "Scan failed. Try again." })
            showToast("error", "Scan failed. Try again.")
          }
        },
        () => {} // no-QR-found noise — ignore, ye normal hai
      )
      isRunningRef.current = true
      setCameraActive(true)
    } catch (err) {
      setCameraError(
        err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access and reload."
          : "Could not start camera. Make sure no other app is using it."
      )
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    const scanner = new Html5Qrcode("scanner-box", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
      verbose: false,
    })
    scannerInstanceRef.current = scanner
    startCamera()

    return () => {
      if (isRunningRef.current) {
        scanner.stop().then(() => scanner.clear()).catch(() => {})
        isRunningRef.current = false
      }
    }
  }, [])

  const handleScanNext = () => {
    setLastResult(null)
    startCamera() // ✅ camera dobara khulti hai — sirf "Scan Next" dabane par
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <ScanLine className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Scan Shipment Label</h2>
      </div>

      {initializing && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Starting camera...</p>
        </div>
      )}

      {cameraError && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-red-500 text-center">
          <CameraOff className="w-8 h-8" />
          <p className="text-sm">{cameraError}</p>
          <button onClick={startCamera} className="text-sm px-4 py-2 bg-red-50 text-red-600 rounded-md border border-red-200">
            Retry
          </button>
        </div>
      )}

      {/* ✅ camera sirf tab dikhti/chalti hai jab active ho */}
      <div
        id="scanner-box"
        className="w-full rounded-lg overflow-hidden border"
        style={{ display: cameraActive && !cameraError ? "block" : "none" }}
      />

      {/* ✅ result-screen — camera band ho chuki, ek clean success/fail card */}
      {lastResult && !cameraActive && (
        <div
          className={`mt-4 p-5 rounded-xl text-center border ${
            lastResult.success
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {lastResult.success ? (
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
          ) : (
            <XCircle className="w-10 h-10 mx-auto mb-2" />
          )}
          <p className="font-medium">{lastResult.message}</p>

          {!lastResult.success && (
            <button
              onClick={handleScanNext}
              className="mt-4 px-4 py-2 bg-white rounded-md border text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Scan Next Label
            </button>
          )}
          {/* success case me auto-redirect already ho raha hai — button ki zaroorat nahi */}
        </div>
      )}
    </div>
  )
}

export default ScannerPage