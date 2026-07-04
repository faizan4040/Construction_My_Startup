'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import { SHOP_OWNER_CATEGORY_SHOW } from '@/routes/ShopOwnerPanelRoute'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
})

const AddCategory = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register, handleSubmit, formState: { errors }, reset,
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  })

  const onSubmit = async (formData) => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/shopowner/category/add', formData)

      if (!data.success) {
        showToast('error', data.message)
        return
      }

      showToast('success', data.message)
      reset()
      router.push(SHOP_OWNER_CATEGORY_SHOW)
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
          <div className="space-y-1.5">
            <Label>Category Name</Label>
            <Input {...register('name')} placeholder="e.g. Cement, Bricks, Steel Rods" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <ButtonLoading type="submit" loading={loading} text="Add Category" className="w-full sm:w-auto" />
        </form>
      </CardContent>
    </Card>
  )
}

export default AddCategory