"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useFetch from "@/hooks/useFetch"
import { IMAGES } from "@/routes/AllImages"
import { IoStar } from "react-icons/io5"

const LatestReview = () => {
  const { data, loading } = useFetch(
    "/api/dashboard/admin/latest-review"
  )

  const reviews = data?.data || []

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Loading reviews...
      </div>
    )
  }

  if (!reviews.length) {
    return (
      <Card className="rounded-2xl shadow-sm h-full flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          No reviews found
        </span>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm h-full bg-background">
      {/* HEADER */}
      <CardHeader className="px-6 py-5 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Latest Reviews
        </CardTitle>

        <span className="text-xs text-muted-foreground">
          Showing last {reviews.length} reviews
        </span>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          <Table className="table-fixed w-full">
            {/* STICKY HEADER */}
            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
              <TableRow>
                <TableHead className="w-[75%]">
                  Product
                </TableHead>
                <TableHead className="text-right w-[25%]">
                  Rating
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {reviews.map((review, index) => {
                const product = review.product
                const image =
                  product?.media?.[0]?.secure_url ||
                  IMAGES.product_placeholder

                return (
                  <TableRow
                    key={review._id}
                    className={`hover:bg-muted/50 ${
                      index % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                  >
                    {/* PRODUCT */}
                    <TableCell className="max-w-55">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={image} />
                          <AvatarFallback>
                            {product?.name?.[0] || "P"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {product?.name || "Unknown Product"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* RATING */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <IoStar
                            key={i}
                            className={`text-sm ${
                              i < review.rating
                                ? "text-yellow-500"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default LatestReview
