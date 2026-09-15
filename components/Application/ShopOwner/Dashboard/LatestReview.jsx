"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IMAGES } from "@/routes/AllImages"
import { IoStar } from "react-icons/io5"
import { useShopDashboard } from "@/contexts/ShopDashboardContext"

const LatestReview = () => {
  const { data, loading } = useShopDashboard()
  const reviews = data?.latestReview || []

  if (loading) {
    return <div className="bg-white dark:bg-card rounded-2xl shadow-sm h-full flex items-center justify-center text-sm text-gray-400">Loading reviews...</div>
  }

  if (!reviews.length) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm h-full flex items-center justify-center p-10">
        <span className="text-sm text-gray-400">No reviews on your products yet</span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-sm h-full overflow-hidden flex flex-col">
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Feedback</p>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Latest Reviews</h2>
        </div>
        <span className="text-xs text-gray-400">last {reviews.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {reviews.map((review) => {
          const product = review.product
          const image = product?.media?.[0]?.secure_url || IMAGES.product_placeholder

          return (
            <div key={review._id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={image} />
                  <AvatarFallback>{product?.name?.[0] || "P"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate text-gray-800 dark:text-gray-100">{product?.name || "Unknown Product"}</span>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IoStar key={i} className={`text-sm ${i < review.rating ? "text-yellow-500" : "text-gray-200"}`} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LatestReview



