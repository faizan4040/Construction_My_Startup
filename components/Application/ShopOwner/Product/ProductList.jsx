'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus } from 'lucide-react'
import { showToast } from '@/lib/showToast'
import { SHOP_OWNER_PRODUCT_ADD } from '@/routes/ShopOwnerPanelRoute'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/shopowner/product/get')
      if (data.success) setProducts(data.data)
    } catch (err) {
      showToast('error', 'Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id) => {
    try {
      setDeletingId(id)
      const { data } = await axios.delete('/api/shopowner/product/delete', { data: { id } })
      if (data.success) {
        showToast('success', data.message)
        setProducts((prev) => prev.filter((p) => p._id !== id))
      } else {
        showToast('error', data.message)
      }
    } catch (err) {
      showToast('error', 'Something went wrong.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">{products.length} product(s)</p>
          <Link href={SHOP_OWNER_PRODUCT_ADD}>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No products yet. Add your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Image</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">MRP</th>
                  <th className="py-2 pr-4">Selling Price</th>
                  <th className="py-2 pr-4">Discount</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                        {product.media?.[0]?.secure_url && (
                          <Image
                            src={product.media[0].secure_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-medium">{product.name}</td>
                    <td className="py-3 pr-4">{product.category?.name ?? '—'}</td>
                    <td className="py-3 pr-4">₹{product.mrp}</td>
                    <td className="py-3 pr-4">₹{product.sellingPrice}</td>
                    <td className="py-3 pr-4">
                      <Badge className="bg-green-100 text-green-700">{product.discountPercentage}%</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`${SHOP_OWNER_PRODUCT_ADD}?id=${product._id}`}>
                          <Button size="icon" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="outline" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{product.name}" from your shop listings. This action can be reversed by support only.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product._id)}
                                disabled={deletingId === product._id}
                              >
                                {deletingId === product._id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProductList