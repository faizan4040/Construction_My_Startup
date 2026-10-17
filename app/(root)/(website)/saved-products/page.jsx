'use client'
import Link from "next/link"
import { Bookmark, Trash2, ShoppingBag, X, ArrowRight } from "lucide-react"
import ProductBox from "@/components/Website/ProductBox"
import { useSavedProducts } from "@/hooks/useSavedProducts"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

/**
 * Saved products page (buy later list).
 * Place this at: app/(website)/saved-products/page.jsx  -> route: /saved-products
 */
export default function SavedProductsPage() {
  const { saved, count, ready, remove, clearAll } = useSavedProducts()

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-8 sm:py-12 min-h-[70vh]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
            <Bookmark size={22} className="text-white" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {ready ? `${count} ${count === 1 ? "item" : "items"} saved to buy later` : "Loading..."}
            </p>
          </div>
        </div>

        {ready && count > 0 && (
          <div className="flex items-center gap-3">
            <Link
              href={WEBSITE_SHOP}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-900 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-all"
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-200 text-sm font-semibold text-red-600 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all cursor-pointer"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {!ready && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl bg-gray-200 animate-pulse shadow" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {ready && count === 0 && (
        <div className="flex flex-col items-center text-center py-16 sm:py-24 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/60">
          <span className="w-20 h-20 rounded-3xl bg-white shadow-lg flex items-center justify-center mb-6">
            <Bookmark size={34} className="text-orange-500" />
          </span>
          <h2 className="text-xl font-bold text-gray-900">No saved products yet</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Tap "Buy Later" on any product and it will show up here, ready for when you want to buy.
          </p>
          <Link
            href={WEBSITE_SHOP}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Browse Products
            <ArrowRight size={17} />
          </Link>
        </div>
      )}

      {/* Saved grid */}
      {ready && count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {saved.map((product) => (
            <div key={product._id} className="relative">
              <ProductBox product={product} />

              <button
                type="button"
                onClick={() => remove(product._id)}
                aria-label="Remove from saved products"
                title="Remove from saved"
                className="absolute top-3 right-3 z-10 h-9 flex items-center gap-1.5 pl-2.5 pr-3 rounded-full text-xs font-semibold
                bg-white/90 text-red-600 border border-red-100 shadow-lg backdrop-blur-md
                hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <X size={15} strokeWidth={2.5} />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}