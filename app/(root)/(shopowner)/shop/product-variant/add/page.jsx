'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import {
  SHOP_OWNER_DASHBOARD,
  SHOP_OWNER_VARIANT_SHOW,
} from '@/routes/ShopOwnerPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PackagePlus, ImagePlus, Boxes, IndianRupee, X, Loader2, UploadCloud } from 'lucide-react'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: SHOP_OWNER_VARIANT_SHOW, label: 'Variants' },
  { href: '', label: 'Add Variant' },
]

const MAX_IMAGES = 5

const AddProductVariant = () => {
  const [loading, setLoading] = useState(false)
  const [productOption, setProductOption] = useState([])
  const { data: getProducts } = useFetch('/api/shopowner/product/get')

  const [selectedMedia, setSelectedMedia] = useState([]) // [{ _id, url, uploading?, tempId? }]
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (getProducts && getProducts.success) {
      setProductOption(getProducts.data)
    }
  }, [getProducts])

  const formSchema = zSchema.pick({
    product: true,
    color: true,
    size: true,
    gender: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
    sku: true,
    stock: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: '',
      color: '',
      size: '',
      gender: '',
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      sku: '',
      stock: 0,
    },
  })

  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0
    if (mrp > 0 && sellingPrice > 0) {
      const discountPercentage = ((mrp - sellingPrice) / mrp) * 100
      form.setValue('discountPercentage', Math.round(discountPercentage))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('mrp'), form.watch('sellingPrice')])

  useEffect(() => {
    return () => {
      selectedMedia.forEach((m) => {
        if (m.uploading && m.url?.startsWith('blob:')) {
          URL.revokeObjectURL(m.url)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mrpValue = Number(form.watch('mrp')) || 0
  const sellingPriceValue = Number(form.watch('sellingPrice')) || 0
  const discountValue = Number(form.watch('discountPercentage')) || 0
  const savedAmount = mrpValue > sellingPriceValue ? mrpValue - sellingPriceValue : 0
  const selectedProductName = productOption.find((p) => p._id === form.watch('product'))?.name

  /* ────────────── Direct upload: device → Cloudinary → Media model (shopowner) ────────────── */

  const uploadSingleFile = async (file, tempId) => {
    try {
      const { data: sig } = await axios.post('/api/shopowner/cloudinary-signature')
      if (!sig.success) throw new Error(sig.message || 'Could not get upload signature.')

      const { signature, timestamp, api_key, cloud_name, folder } = sig.data

      if (!cloud_name || !api_key) {
        throw new Error('Cloudinary is not configured correctly on the server.')
      }

      const cloudForm = new FormData()
      cloudForm.append('file', file)
      cloudForm.append('api_key', api_key)
      cloudForm.append('timestamp', timestamp)
      cloudForm.append('signature', signature)
      if (folder) cloudForm.append('folder', folder)

      const { data: cloudRes } = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        cloudForm
      )

      const { data: mediaRes } = await axios.post('/api/shopowner/media/create', {
        asset_id: cloudRes.asset_id,
        public_id: cloudRes.public_id,
        secure_url: cloudRes.secure_url,
        format: cloudRes.format,
      })

      if (!mediaRes.success) throw new Error(mediaRes.message || 'Could not save media.')

      setSelectedMedia((prev) =>
        prev.map((m) => {
          if (m.tempId !== tempId) return m
          if (m.url?.startsWith('blob:')) URL.revokeObjectURL(m.url)
          return { _id: mediaRes.data._id, url: cloudRes.secure_url, uploading: false }
        })
      )
    } catch (error) {
      showToast('error', error?.response?.data?.message || error.message || 'Image upload failed.')
      setSelectedMedia((prev) => {
        const failed = prev.find((m) => m.tempId === tempId)
        if (failed?.url?.startsWith('blob:')) URL.revokeObjectURL(failed.url)
        return prev.filter((m) => m.tempId !== tempId)
      })
    }
  }

  const handleFiles = (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (files.length === 0) return

    const remainingSlots = MAX_IMAGES - selectedMedia.length
    if (remainingSlots <= 0) {
      showToast('error', `You can upload a maximum of ${MAX_IMAGES} images.`)
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      showToast('error', `Only ${remainingSlots} more image(s) allowed. Uploading the first ${remainingSlots}.`)
    }

    filesToUpload.forEach((file) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const localPreviewUrl = URL.createObjectURL(file)

      setSelectedMedia((prev) => [...prev, { tempId, url: localPreviewUrl, uploading: true }])
      uploadSingleFile(file, tempId)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  const removeMedia = (identifier) => {
    setSelectedMedia((prev) => {
      const target = prev.find((m) => (m._id ?? m.tempId) === identifier)
      if (target?.uploading && target.url?.startsWith('blob:')) URL.revokeObjectURL(target.url)
      return prev.filter((m) => (m._id ?? m.tempId) !== identifier)
    })
  }

  const isAnyUploading = selectedMedia.some((m) => m.uploading)

  /* ────────────── Submit ────────────── */

  const onSubmit = async (values) => {
    try {
      const readyMedia = selectedMedia.filter((m) => !m.uploading && m._id)
      if (readyMedia.length <= 0) {
        showToast('error', 'Please add at least one variant photo.')
        return
      }
      if (isAnyUploading) {
        showToast('error', 'Please wait — some photos are still uploading.')
        return
      }

      setLoading(true)
      values.media = readyMedia.map((m) => m._id)

      const { data: response } = await axios.post('/api/shopowner/product-variant/add', values)
      if (!response.success) throw new Error(response.message)

      form.reset()
      setSelectedMedia([])
      showToast('success', response.message)
    } catch (error) {
      showToast('error', error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="mt-4 mb-5 sm:mb-6 rounded-2xl sm:rounded-3xl bg-linear-to-br from-orange-500 via-orange-400 to-amber-300 p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 sm:-right-10 sm:-top-10 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-white/10" />
        <div className="absolute right-10 bottom-0 sm:right-16 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-white/10" />
        <div className="relative flex items-start sm:items-center gap-3">
          <div className="rounded-xl sm:rounded-2xl bg-white/20 p-2.5 sm:p-3 backdrop-blur-sm shrink-0">
            <PackagePlus className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight">Add a product variant</h1>
            <p className="text-xs sm:text-sm text-orange-50 mt-0.5">
              Different size, color, or stock for an existing product.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] gap-5 sm:gap-6 items-start">
        <Card className="rounded-2xl sm:rounded-3xl shadow-sm border-gray-200/70 order-2 lg:order-1 w-full min-w-0">
          <CardContent className="p-4 sm:p-5 md:p-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">

                {/* Parent product */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">1</span>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">Choose the product</h4>
                  </div>
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {productOption.length === 0 ? (
                            <div className="rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-500">
                              No products yet.{' '}
                              <a href="/shop/product/add" className="text-orange-500 font-medium underline underline-offset-2">
                                Add a product first
                              </a>{' '}
                              before creating variants.
                            </div>
                          ) : (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="rounded-xl h-11 w-full">
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                {productOption.map((p) => (
                                  <SelectItem key={p._id} value={p._id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Variant attributes */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">2</span>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">Variant details</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Color<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Grey" className="rounded-xl h-11 w-full" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Size<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 50kg" className="rounded-xl h-11 w-full" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Gender<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="rounded-xl h-11 w-full">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="kids">Kids</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">SKU<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CEM-50-GRY-001" className="rounded-xl h-11 w-full" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Stock<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" className="rounded-xl h-11 w-full" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Pricing */}
                <section className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-stone-900 dark:to-stone-900 border border-orange-100 dark:border-stone-700 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <IndianRupee className="h-4 w-4 text-orange-500 shrink-0" />
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">Pricing</h4>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                    <FormField
                      control={form.control}
                      name="mrp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">MRP (₹)<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="400" className="rounded-xl h-11 w-full bg-white dark:bg-background" {...field} />
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
                          <FormLabel className="text-sm">Selling Price (₹)<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="350" className="rounded-xl h-11 w-full bg-white dark:bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem className="xs:col-span-2 sm:col-span-1">
                          <FormLabel className="text-sm">Discount (%)</FormLabel>
                          <FormControl>
                            <Input type="number" readOnly placeholder="auto" className="rounded-xl h-11 w-full bg-white/60 dark:bg-background text-gray-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Media */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">3</span>
                      <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">Variant photos</h4>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{selectedMedia.length}/{MAX_IMAGES}</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      handleFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />

                  {selectedMedia.length < MAX_IMAGES && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                      }}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`cursor-pointer rounded-xl sm:rounded-2xl border-2 border-dashed p-5 sm:p-8 text-center transition-all
                        ${isDragging
                          ? 'border-orange-500 bg-orange-100 scale-[1.01]'
                          : 'border-gray-300 bg-gray-50/60 dark:bg-card hover:border-orange-400 hover:bg-orange-50'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <div className={`rounded-full p-2.5 sm:p-3 transition-colors ${isDragging ? 'bg-orange-200' : 'bg-orange-100'}`}>
                          {isDragging ? (
                            <UploadCloud className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                          ) : (
                            <ImagePlus className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {isDragging ? 'Drop your images here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-[11px] sm:text-xs text-gray-500">JPG, PNG, WEBP • Up to {MAX_IMAGES} images</p>
                      </div>
                    </div>
                  )}

                  {selectedMedia.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                      {selectedMedia.map((media) => (
                        <div
                          key={media._id ?? media.tempId}
                          className="group relative aspect-square overflow-hidden rounded-lg sm:rounded-xl border bg-white shadow-sm"
                        >
                          <Image
                            src={media.url}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
                            className="object-cover"
                            unoptimized={media.uploading}
                          />
                          {media.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Loader2 className="h-5 w-5 text-white animate-spin" />
                            </div>
                          )}
                          {!media.uploading && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeMedia(media._id ?? media.tempId)
                              }}
                              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 transition sm:group-hover:opacity-100 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <ButtonLoading
                  loading={loading || isAnyUploading}
                  type="submit"
                  text={isAnyUploading ? 'Uploading photos...' : '+ Add Variant'}
                  className="w-full sm:w-auto rounded-xl h-12 px-8 bg-orange-500 text-white font-semibold hover:bg-orange-600 shadow-lg shadow-orange-200"
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Live preview */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] w-full max-w-sm mx-auto lg:max-w-none lg:mx-0 space-y-4">
          <Card className="rounded-2xl sm:rounded-3xl shadow-sm border-gray-200/70 overflow-hidden">
            <div className="relative aspect-square bg-gray-100 dark:bg-stone-800">
              {selectedMedia[0] ? (
                <Image
                  src={selectedMedia[0].url}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-cover"
                  unoptimized={selectedMedia[0].uploading}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <Boxes className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
              )}
              {discountValue > 0 && sellingPriceValue > 0 && (
                <span className="absolute top-3 left-3 rounded-full bg-orange-500 text-white text-xs font-bold px-2.5 py-1">
                  {discountValue}% OFF
                </span>
              )}
            </div>
            <CardContent className="p-3.5 sm:p-4 space-y-2">
              <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] break-words">
                {selectedProductName || 'Select a product to preview'}
              </p>
              <div className="flex flex-wrap items-baseline gap-2 pt-1">
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ₹{sellingPriceValue || 0}
                </span>
                {mrpValue > sellingPriceValue && (
                  <span className="text-sm text-gray-400 line-through">₹{mrpValue}</span>
                )}
              </div>
              {savedAmount > 0 && (
                <p className="text-xs text-green-600 font-medium">You save ₹{savedAmount}</p>
              )}
              <p className="text-xs text-gray-400 pt-1">
                {selectedMedia.filter((m) => !m.uploading).length} photo
                {selectedMedia.length !== 1 ? 's' : ''} ready
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AddProductVariant