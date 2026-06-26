'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import Editor from '@/components/Application/Admin/Editor'
import MediaModal from '@/components/Application/Admin/MediaModal'
import ButtonLoading from '@/components/Application/ButtonLoading'
import MaterialCategorySelect from '@/components/Application/ShopOwner/MaterialCategorySelect'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_PRODUCT_SHOW } from '@/routes/ShopOwnerPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: SHOP_OWNER_PRODUCT_SHOW, label: 'Product' },
  { href: '', label: 'Add Product' },
]

const AddShopProduct = () => {
  const [loading, setLoading] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])
  const { data: getCategory } = useFetch('/api/category?deleteType=SD&&size=10000')

  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  useEffect(() => {
    if (getCategory && getCategory.success) {
      setCategoryOption(getCategory.data) // raw docs — MaterialCategorySelect needs name + _id
    }
  }, [getCategory])

  const formSchema = zSchema.pick({
    name: true,
    slug: true,
    category: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
    description: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      category: '',
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      description: '',
    },
  })

  useEffect(() => {
    const name = form.getValues('name')
    if (name) {
      form.setValue('slug', slugify(name).toLowerCase())
    }
  }, [form.watch('name')])

  // discount auto-calculation (same logic as admin form)
  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0

    if (mrp > 0 && sellingPrice > 0) {
      const discountPercentage = ((mrp - sellingPrice) / mrp) * 100
      form.setValue('discountPercentage', Math.round(discountPercentage))
    }
  }, [form.watch('mrp'), form.watch('sellingPrice')])

  const editor = (event, editor) => {
    const data = editor.getData()
    form.setValue('description', data)
  }

  // live preview numbers for the price card
  const mrpValue = Number(form.watch('mrp')) || 0
  const sellingPriceValue = Number(form.watch('sellingPrice')) || 0
  const discountValue = Number(form.watch('discountPercentage')) || 0
  const savedAmount = mrpValue > sellingPriceValue ? mrpValue - sellingPriceValue : 0

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      if (selectedMedia.length <= 0) {
        return showToast('error', 'Please select at least one product photo.')
      }

      const mediaIds = selectedMedia.map((media) => media._id)
      values.media = mediaIds

      const { data: response } = await axios.post('/api/shopowner/product/add', values)
      if (!response.success) {
        throw new Error(response.message)
      }

      form.reset()
      setSelectedMedia([])
      showToast('success', response.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="py-4">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold">List a new product</h1>
          <p className="text-sm text-gray-500">
            Add cement, bricks, steel, or any other material — it goes live on the storefront as soon as you save.
          </p>
        </div>

        <Card className="py-0 rounded-3xl shadow-sm">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Product Details</h4>
          </CardHeader>

          <CardContent className="pb-5">
            <div className="mt-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  {/* Material category — visual selector */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Material <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <MaterialCategorySelect
                            options={categoryOption}
                            selected={field.value}
                            setSelected={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Name + Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name<span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="e.g. UltraTech Cement 50kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug<span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="auto-generated-from-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Pricing block */}
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-[#fff8f5] dark:bg-stone-900 p-4">
                    <p className="text-sm font-semibold mb-4 text-gray-600 dark:text-gray-300">Pricing</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <FormField
                        control={form.control}
                        name="mrp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MRP (₹)<span className='text-red-500'>*</span></FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sellingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selling Price (₹)<span className='text-red-500'>*</span></FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 350" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount (%)</FormLabel>
                            <FormControl>
                              <Input type="number" readOnly placeholder="auto-calculated" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {sellingPriceValue > 0 && (
                      <p className="text-sm mt-3 text-orange-600 font-medium">
                        Customers pay ₹{sellingPriceValue}
                        {savedAmount > 0 && <> and save ₹{savedAmount} ({discountValue}% off)</>}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className='max-w-6xl'>
                    <FormLabel>Description<span className='text-red-500'>*</span></FormLabel>
                    <Editor onChange={editor} />
                    <FormMessage></FormMessage>
                  </div>

                  {/* Media */}
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background p-4 shadow-sm">
                    <MediaModal
                      open={open}
                      setOpen={setOpen}
                      selectedMedia={selectedMedia}
                      setSelectedMedia={setSelectedMedia}
                      isMultiple={true}
                    />

                    <div
                      onClick={() => setOpen(true)}
                      className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-card p-6 text-center transition hover:border-orange-400 hover:bg-orange-50"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-orange-100 p-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0-9l-3 3m3-3l3 3m0-12a4 4 0 00-8 0" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Click to upload product photos
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG, WEBP • Max 5 images</p>
                      </div>
                    </div>

                    {selectedMedia.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {selectedMedia.map((media) => (
                          <div key={media._id} className="group relative aspect-square overflow-hidden rounded-xl border bg-white shadow-sm">
                            <Image src={media.url} alt="" fill className="object-cover transition-transform group-hover:scale-105" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedMedia((prev) => prev.filter((item) => item._id !== media._id))
                              }}
                              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm font-bold leading-none text-white opacity-0 transition group-hover:opacity-100 cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className='mb-3 mt-5'>
                    <ButtonLoading
                      loading={loading}
                      type="submit"
                      text="+ Add Product"
                      className="bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
                    />
                  </div>

                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AddShopProduct