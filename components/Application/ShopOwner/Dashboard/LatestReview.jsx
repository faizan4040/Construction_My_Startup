"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useFetch from "@/hooks/useFetch"
import { IMAGES } from "@/routes/AllImages"
import { IoStar } from "react-icons/io5"

const LatestReview = () => {
  const { data, loading } = useFetch("/api/shopowner/dashboard/latest-review")
  const reviews = data?.data || []

  if (loading) {
    return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading reviews...</div>
  }

  if (!reviews.length) {
    return (
      <Card className="rounded-2xl sm:rounded-3xl shadow-sm h-full flex items-center justify-center border-gray-200/70 overflow-hidden">
        <div className="h-1.5 bg-violet-500 absolute top-0 w-full" />
        <span className="text-sm text-muted-foreground">No reviews on your products yet</span>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl sm:rounded-3xl shadow-sm h-full bg-background border-gray-200/70 overflow-hidden">
      <div className="h-1.5 bg-violet-500" />
      <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Feedback</p>
          <CardTitle className="text-lg font-semibold">Latest Reviews</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">last {reviews.length}</span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          <Table className="table-fixed w-full">
            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
              <TableRow>
                <TableHead className="w-[75%]">Product</TableHead>
                <TableHead className="text-right w-[25%]">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review, index) => {
                const product = review.product
                const image = product?.media?.[0]?.secure_url || IMAGES.product_placeholder

                return (
                  <TableRow key={review._id} className={`hover:bg-muted/50 ${index % 2 === 0 ? "bg-muted/20" : ""}`}>
                    <TableCell className="max-w-55">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={image} />
                          <AvatarFallback>{product?.name?.[0] || "P"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{product?.name || "Unknown Product"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <IoStar key={i} className={`text-sm ${i < review.rating ? "text-yellow-500" : "text-muted"}`} />
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