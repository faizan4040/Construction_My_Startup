/**
 * Shared Google Translate helpers (used by the header LanguageSwitcher and the Footer).
 * Place this file at: lib/googleTranslate.js
 */

export const LANGUAGES = [
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
const STYLE_ID = "google-translate-hide-ui"
const ELEMENT_ID = "google_translate_element"

// Hides Google's default banner / tooltip so only our own UI is visible
const HIDE_GOOGLE_UI = `
  .goog-te-banner-frame, .goog-te-banner-frame.skiptranslate, iframe.skiptranslate { display: none !important; }
  body { top: 0 !important; position: static !important; }
  #goog-gt-tt, .goog-tooltip, .goog-tooltip:hover { display: none !important; }
  .goog-text-highlight { background: none !important; box-shadow: none !important; }
  #${ELEMENT_ID} { display: none !important; }
`

/** Language currently applied by Google Translate (read from its cookie). */
export function getCurrentLanguage() {
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

/** Loads the Google Translate script once. Safe to call from many components. */
export function loadGoogleTranslate() {
  if (typeof window === "undefined") return

  // style that hides Google's own UI
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = HIDE_GOOGLE_UI
    document.head.appendChild(style)
  }

  // hidden mount point, created outside React so React never fights with Google's DOM edits
  if (!document.getElementById(ELEMENT_ID)) {
    const div = document.createElement("div")
    div.id = ELEMENT_ID
    div.style.display = "none"
    document.body.appendChild(div)
  }

  window.googleTranslateElementInit = () => {
    if (window.__gtInitDone || !window.google?.translate?.TranslateElement) return
    window.__gtInitDone = true
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        autoDisplay: false,
        includedLanguages: LANGUAGES.map((l) => l.code).join(","),
      },
      ELEMENT_ID
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
}

/** Switches the whole site to `code` ("en" restores the original language). */
export function setLanguage(code) {
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
    // widget not ready yet: the cookie is set, a reload applies it
    window.location.reload()
  }
}