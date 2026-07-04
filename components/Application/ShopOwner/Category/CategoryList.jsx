'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { showToast } from '@/lib/showToast'
import { SHOP_OWNER_CATEGORY_ADD } from '@/routes/ShopOwnerPanelRoute'
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

const CategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/shopowner/category/get')
      if (data.success) setCategories(data.data)
    } catch (err) {
      showToast('error', 'Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (id) => {
    try {
      setDeletingId(id)
      const { data } = await axios.delete('/api/shopowner/category/delete', { data: { id } })
      if (data.success) {
        showToast('success', data.message)
        setCategories((prev) => prev.filter((c) => c._id !== id))
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
          <p className="text-sm text-gray-500">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'}</p>
          <Link href={SHOP_OWNER_CATEGORY_ADD}>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No categories yet. Add your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{category.name}</td>
                    <td className="py-3 pr-4">
                      {category.shop ? (
                        <Badge className="bg-blue-100 text-blue-700">My Category</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Global</Badge>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        {category.shop ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="outline" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this category?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove "{category.name}" from your categories.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category._id)}
                                  disabled={deletingId === category._id}
                                >
                                  {deletingId === category._id ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Admin-owned</span>
                        )}
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

export default CategoryList