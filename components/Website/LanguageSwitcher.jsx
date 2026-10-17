'use client'
import { useEffect, useRef, useState, useCallback } from "react"
import { Languages, Check, X } from "lucide-react"

/**
 * Header language switcher powered by Google Translate.
 * Place this file at: components/Website/LanguageSwitcher.jsx
 */

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "zh-CN", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
]

const SCRIPT_ID = "google-translate-script"

// Hides the default Google Translate banner / tooltip so only our UI shows
const HIDE_GOOGLE_UI = `
  .goog-te-banner-frame, .goog-te-banner-frame.skiptranslate, iframe.skiptranslate { display: none !important; }
  body { top: 0 !important; position: static !important; }
  #goog-gt-tt, .goog-tooltip, .goog-tooltip:hover { display: none !important; }
  .goog-text-highlight { background: none !important; box-shadow: none !important; }
  #google_translate_element { display: none !important; }
`

function getCurrentCode() {
  try {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/)
    if (!match) return "en"
    const parts = decodeURIComponent(match[1]).split("/")
    return parts[2] || "en"
  } catch {
    return "en"
  }
}

function setTranslateCookie(value) {
  const host = window.location.hostname
  document.cookie = `googtrans=${value}; path=/`
  document.cookie = `googtrans=${value}; path=/; domain=${host}`
}

function clearTranslateCookie() {
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT"
  const host = window.location.hostname
  document.cookie = `googtrans=; ${expired}; path=/`
  document.cookie = `googtrans=; ${expired}; path=/; domain=${host}`
  document.cookie = `googtrans=; ${expired}; path=/; domain=.${host}`
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState("en")
  const wrapRef = useRef(null)

  /* Load Google Translate once */
  useEffect(() => {
    setCurrent(getCurrentCode())

    window.googleTranslateElementInit = () => {
      if (window.__gtInitDone || !window.google?.translate?.TranslateElement) return
      window.__gtInitDone = true
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
        },
        "google_translate_element"
      )
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script")
      script.id = SCRIPT_ID
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true
      document.body.appendChild(script)
    } else if (window.google?.translate) {
      window.googleTranslateElementInit()
    }
  }, [])

  /* Click outside */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && e.target instanceof Node && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  const changeLanguage = useCallback((code) => {
    setOpen(false)
    setCurrent(code)

    // Back to original language
    if (code === "en") {
      clearTranslateCookie()
      window.location.reload()
      return
    }

    setTranslateCookie(`/en/${code}`)

    const combo = document.querySelector(".goog-te-combo")
    if (combo) {
      combo.value = code
      combo.dispatchEvent(new Event("change"))
    } else {
      // widget not ready yet - cookie is set, reload applies it
      window.location.reload()
    }
  }, [])

  const active = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0]

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <style dangerouslySetInnerHTML={{ __html: HIDE_GOOGLE_UI }} />
      <div id="google_translate_element" />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        title="Change language"
        className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-300
        ${open
          ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/30"
          : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-orange-400/50"}`}
      >
        <Languages size={19} />
        {current !== "en" && (
          <span className="notranslate absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-[9px] font-bold uppercase leading-[18px] text-center text-white border-2 border-gray-900">
            {current.slice(0, 2)}
          </span>
        )}
      </button>

      {open && (
        <div
          translate="no"
          className="notranslate fixed left-3 right-3 top-[76px] z-50
          sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-4 sm:w-[340px]
          bg-white text-black rounded-3xl shadow-2xl shadow-black/40 border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <Languages size={19} className="text-white" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-base leading-tight">Select language</p>
                <p className="text-xs text-gray-400 mt-0.5">Currently: {active.label}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>

          {/* Language grid */}
          <div className="p-3 max-h-[min(60vh,360px)] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => {
                const isActive = lang.code === current
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center justify-between gap-2 text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer
                    ${isActive
                      ? "bg-orange-50 border-orange-400 ring-2 ring-orange-400/20"
                      : "bg-gray-50 border-gray-100 hover:bg-white hover:border-orange-300 hover:shadow-sm"}`}
                  >
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold truncate ${isActive ? "text-orange-600" : "text-gray-900"}`}>
                        {lang.native}
                      </span>
                      <span className="block text-[11px] text-gray-500 truncate">{lang.label}</span>
                    </span>
                    {isActive && (
                      <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} className="text-white" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500">
            Translated automatically by Google Translate.
          </div>
        </div>
      )}
    </div>
  )
}