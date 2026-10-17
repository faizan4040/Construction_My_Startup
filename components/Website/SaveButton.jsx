'use client'
import { Bookmark } from "lucide-react"
import { useSavedProducts } from "@/hooks/useSavedProducts"

/**
 * "Buy Later" button that sits on top of a product card.
 * Place this file at: components/Website/SaveButton.jsx
 */
export default function SaveButton({ product, className = "" }) {
  const { isSaved, toggle, ready } = useSavedProducts()
  const saved = ready && isSaved(product?._id)

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved products" : "Save product to buy later"}
      title={saved ? "Remove from saved" : "Save to buy later"}
      className={`group/save absolute top-3 right-3 z-10 h-9 flex items-center gap-1.5 pl-2.5 pr-3 rounded-full
      text-xs font-semibold backdrop-blur-md border shadow-lg cursor-pointer active:scale-95
      transition-all duration-300
      ${saved
        ? "bg-linear-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-orange-500/30"
        : "bg-white/90 text-gray-800 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900"}
      ${className}`}
    >
      <Bookmark
        size={15}
        strokeWidth={2.3}
        className={`transition-transform duration-300 group-hover/save:scale-110 ${saved ? "fill-white" : ""}`}
      />
      <span>{saved ? "Saved" : "Buy Later"}</span>
    </button>
  )
}