'use client'
import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Voice search hook (Web Speech API).
 * Works in Chrome, Edge, Safari (iOS 14.5+) and Android Chrome. Needs HTTPS (or localhost).
 *
 * const { supported, listening, interim, error, start, stop, toggle } =
 *   useVoiceSearch({ lang: "en-IN", onResult: (text) => ... })
 */

const ERROR_MESSAGES = {
  "not-allowed": "Microphone permission denied. Allow mic access in your browser settings.",
  "service-not-allowed": "Microphone permission denied. Allow mic access in your browser settings.",
  "no-speech": "I didn't hear anything. Tap the mic and try again.",
  "audio-capture": "No microphone found on this device.",
  "network": "Network error. Check your connection and try again.",
  "language-not-supported": "This language isn't supported for voice search.",
}

/** Clean up what the speech engine returns so the search is exact. */
export function cleanTranscript(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/[.?!,;:।]+$/g, "") // trailing punctuation some browsers add
    .trim()
}

export function useVoiceSearch({ lang = "en-IN", onResult, onInterim } = {}) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState("")
  const [error, setError] = useState("")

  const recRef = useRef(null)
  const finalRef = useRef("")
  const onResultRef = useRef(onResult)
  const onInterimRef = useRef(onInterim)

  useEffect(() => { onResultRef.current = onResult }, [onResult])
  useEffect(() => { onInterimRef.current = onInterim }, [onInterim])

  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)
    setSupported(!!SR)
    return () => {
      try { recRef.current?.abort() } catch {}
    }
  }, [])

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError("Voice search isn't supported in this browser. Try Chrome, Edge or Safari.")
      return
    }
    try { recRef.current?.abort() } catch {}

    setError("")
    setInterim("")
    finalRef.current = ""

    const rec = new SR()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => setListening(true)

    rec.onresult = (event) => {
      let interimText = ""
      let finalText = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interimText += r[0].transcript
      }
      if (finalText) finalRef.current += finalText
      const live = cleanTranscript(finalRef.current + interimText)
      setInterim(live)
      onInterimRef.current?.(live)
    }

    rec.onerror = (e) => {
      if (e.error === "aborted") return
      setError(ERROR_MESSAGES[e.error] || "Voice search failed. Please try again.")
    }

    rec.onend = () => {
      setListening(false)
      const text = cleanTranscript(finalRef.current)
      finalRef.current = ""
      setInterim("")
      recRef.current = null
      if (text) onResultRef.current?.(text)
    }

    recRef.current = rec
    try {
      rec.start()
    } catch {
      setError("Couldn't start the microphone. Please try again.")
      setListening(false)
    }
  }, [lang])

  const stop = useCallback(() => {
    try { recRef.current?.stop() } catch {}
  }, [])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  // auto-clear error after a few seconds
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(""), 4500)
    return () => clearTimeout(t)
  }, [error])

  return { supported, listening, interim, error, start, stop, toggle, setError }
}