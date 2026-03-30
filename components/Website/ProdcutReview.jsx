'use client'

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { zodResolver } from "@hookform/resolvers/zod"
import { FaStar } from "react-icons/fa"
import axios from "axios"

import { zSchema } from "@/lib/zodSchema"
import ButtonLoading from "../Application/ButtonLoading"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { showToast } from "@/lib/showToast"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import Reviewlist from "./Reviewlist"
import useFetch from "@/hooks/useFetch"

/* ------------------------------------------------ */
const ProductReview = ({ productId }) => {
  const queryClient = useQueryClient()
  const auth = useSelector((store) => store.authStore.auth)

  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [reviewCount, setReviewCount] = useState({
    totalReviews: 0,
    averageRating: 0,
    rating: {},
  })

  const { data: reviewDetails } = useFetch(
    `/api/review/details?productId=${productId}`
  )

  useEffect(() => {
    if (reviewDetails && reviewDetails.success) {
      setReviewCount(reviewDetails.data)
    }
  }, [reviewDetails])

  const average = reviewCount?.averageRating || 0
  const totalReviews = reviewCount?.totalReviews || 0
  const ratingBreakdown = reviewCount?.rating || {}

  /* Zod schema */
  const formSchema = zSchema.pick({
    productId: true,
    userId: true,
    rating: true,
    title: true,
    review: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: productId,
      userId: auth?._id || "",
      rating: 0,
      title: "",
      review: "",
    },
  })

  /* Update form when productId or auth changes */
  useEffect(() => {
    if (productId) form.setValue("productId", productId)
    if (auth?._id) form.setValue("userId", auth._id)
  }, [productId, auth])

  /* Toggle form — show message if not logged in */
  const handleWriteReview = () => {
    if (!auth) {
      showToast("error", "Please log in to write a review.")
      return
    }
    setShowForm((prev) => !prev)
  }

  /* Submit — guard if somehow called without auth */
  const handleReviewSubmit = async (values) => {
    if (!auth) {
      showToast("error", "Please log in to submit a review.")
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...values,
        rating: Number(values.rating),
      }

      const { data } = await axios.post("/api/review/create", payload, {
        withCredentials: true,
      })

      if (!data.success) throw new Error(data.message)

      showToast("success", data.message)

      form.reset({
        productId,
        userId: auth._id,
        rating: 0,
        title: "",
        review: "",
      })

      setShowForm(false)
      queryClient.invalidateQueries(["product-review"])
    } catch (error) {
      showToast("error", error.message)
    } finally {
      setLoading(false)
    }
  }

  /* Fetch paginated reviews */
  const fetchReview = async ({ pageParam = 1 }) => {
    const { data } = await axios.get(
      `/api/review/get?productId=${productId}&page=${pageParam}`
    )
    if (!data.success) throw new Error(data.message)
    return data.data
  }

  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["product-review", productId],
    queryFn: fetchReview,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? false,
  })

  /* ------------------------------------------------ */
  return (
    <div className="border rounded-xl bg-white shadow-sm mb-20">

      {/* Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-xl">
        <h2 className="text-2xl font-semibold">Ratings & Reviews</h2>
      </div>

      {/* Summary */}
      <div className="p-6 grid md:grid-cols-2 gap-10">

        {/* Average */}
        <div>
          <h3 className="text-6xl font-bold">{average.toFixed(1)}</h3>

          <div className="flex gap-1 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < Math.round(average) ? "text-yellow-400" : "text-gray-300"
                }
              />
            ))}
          </div>

          <p className="text-sm text-gray-600">Based on {totalReviews} reviews</p>

          {/* Write a review button — always visible, guards inside */}
          <button
            onClick={handleWriteReview}
            className="mt-5 px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            {showForm ? "Cancel" : "Write a review"}
          </button>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star] || 0
            const percent = totalReviews ? (count / totalReviews) * 100 : 0

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-6 text-sm font-medium">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-gray-600 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Form */}
      <div className="p-6 border-t bg-gray-50">

        {showForm && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleReviewSubmit)}
              className="space-y-5 max-w-xl"
            >

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Great shoes!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Rating</FormLabel>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`cursor-pointer text-2xl ${
                            star <= field.value
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Review */}
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Review</FormLabel>
                    <FormControl>
                      <textarea
                        rows="4"
                        className="w-full p-3 border rounded-md"
                        placeholder="Share your experience..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ButtonLoading
                loading={loading}
                type="submit"
                text="Submit Review"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              />
            </form>
          </Form>
        )}

        {/* Reviews List */}
        <div className="mt-12 border-t pt-6">
          <h5 className="text-xl font-semibold text-gray-900">
            {data?.pages?.[0]?.totalReviews || 0} Reviews
          </h5>

          {data?.pages?.[0]?.totalReviews === 0 && (
            <p className="mt-2 text-gray-500 text-sm">
              No reviews yet. Be the first to write one!
            </p>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {data?.pages?.map((page) =>
            page.reviews.map((review) => (
              <Reviewlist key={review._id} review={review} />
            ))
          )}
        </div>

        {/* Loading indicator */}
        {isFetching && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Loading reviews...
          </p>
        )}

        {/* Load More */}
        {hasNextPage && !isFetching && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => fetchNextPage()}
              className="px-6 py-2 rounded-full"
            >
              Load more reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductReview