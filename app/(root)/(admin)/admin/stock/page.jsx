'use client'

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
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Pencil, Trash2 } from "lucide-react"
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_VARIANT_EDIT, ADMIN_STOCK_SHOW } from "@/routes/AdminPanelRoute"
import { IMAGES } from "@/routes/AllImages"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import axios from "axios"
import { showToast } from "@/lib/showToast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_STOCK_SHOW, label: 'Stock' },
]

const Stock = () => {
  const { data, loading, refetch } = useFetch("/api/dashboard/admin/stock-overview")
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const stockTable = data?.data?.stockTable || []

  // ===== DELETE HANDLER =====
const handleDelete = async () => {
  if (!deleteId) return
  setDeleteLoading(true)
  try {
    const { data: res } = await axios.put("/api/product-variant/delete", {
      ids: [deleteId],
      deleteType: "SD"
    })
    if (!res.success) throw new Error(res.message)
    showToast('success', 'Variant deleted successfully.')
    refetch()
  } catch (error) {
    showToast('error', error.message)
  } finally {
    setDeleteLoading(false)
    setDeleteId(null)
  }
}

  // ===== STATUS BADGE =====
  const renderStatus = (status) => {
    if (status === "Out of Stock") {
      return (
        <Badge className="bg-red-600 text-white flex w-fit items-center gap-1">
          <XCircle size={14} /> Out of Stock
        </Badge>
      )
    }
    if (status === "Low Stock") {
      return (
        <Badge className="bg-yellow-500 text-black flex w-fit items-center gap-1 animate-pulse">
          <AlertTriangle size={14} /> Low Stock
        </Badge>
      )
    }
    return (
      <Badge className="bg-green-600 text-white flex w-fit items-center gap-1">
        <CheckCircle size={14} /> In Stock
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center text-muted-foreground">
        Loading stock data...
      </div>
    )
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="py-4">
        <Card className="rounded-2xl shadow-sm w-full">
          <CardHeader className="border-b text-2xl">
            <CardTitle>Product Stock Overview</CardTitle>
          </CardHeader>

          <CardContent className="p-4">
            <div className="max-h-125 overflow-y-auto">
              <Table>

                {/* TABLE HEADER */}
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-center">Sold</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                {/* TABLE BODY */}
                <TableBody>
                  {stockTable.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No stock data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockTable.map(row => (
                      <TableRow key={row.variantId} className="h-16">

                        {/* PRODUCT */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16">
                              <Image
                                src={
                                  row.image
                                    ? row.image.startsWith("http")
                                      ? row.image
                                      : `${process.env.NEXT_PUBLIC_API_URL}${row.image}`
                                    : IMAGES.image_placeholder
                                }
                                alt={row.productName}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                            <div className="leading-tight">
                              <p className="font-medium text-sm">{row.productName}</p>
                              <p className="text-xs text-muted-foreground">SKU: {row.sku}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* SOLD */}
                        <TableCell className="text-center font-medium">
                          {row.totalSold}
                        </TableCell>

                        {/* STOCK */}
                        <TableCell className="text-center font-medium">
                          {row.remainingStock}
                        </TableCell>

                        {/* STATUS */}
                        <TableCell>
                          {renderStatus(row.status)}
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">

                            {/* EDIT */}
                            <Link
                              href={ADMIN_PRODUCT_VARIANT_EDIT(row.variantId)}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                            >
                              <Pencil size={14} />
                            </Link>

                            {/* DELETE */}
                            <button
                              onClick={() => setDeleteId(row.variantId)}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>
                        </TableCell>

                      </TableRow>
                    ))
                  )}
                </TableBody>

              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DELETE CONFIRM DIALOG */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the variant. You can restore it from trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default Stock

