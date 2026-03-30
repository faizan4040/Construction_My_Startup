'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { showToast } from '@/lib/showToast'
import { updateWarehouseSchema } from '@/lib/zodSchema'
import {
  ADMIN_DASHBOARD,
  ADMIN_WAREHOUSE_SHOW,
} from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_WAREHOUSE_SHOW, label: 'Warehouse' },
  { href: '', label: 'Edit Warehouse' },
]

const EditWarehouse = () => {
  const router = useRouter()
  const params = useParams()
  const warehouseId = params?.id || ''

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  const form = useForm({
    resolver: zodResolver(updateWarehouseSchema),
    defaultValues: {
      _id: '',
      name: '',
      location: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: '',
      email: '',
      manager: '',
      capacity: 0,
      status: 'active',
    },
  })

  useEffect(() => {
    if (!warehouseId) {
      setError('Invalid warehouse ID')
      setFetching(false)
      return
    }

    const fetchWarehouse = async () => {
      try {
        const { data } = await axios.get(`/api/warehouse/${warehouseId}`)

        if (data?.success && data?.data) {
          const w = data.data
          form.reset({
            _id: w._id,
            name: w.name,
            location: w.location,
            address: w.address,
            city: w.city,
            state: w.state,
            zipCode: w.zipCode,
            country: w.country,
            phone: w.phone,
            email: w.email,
            manager: w.manager,
            capacity: Number(w.capacity),
            status: w.status,
          })
        } else {
          setError('Warehouse not found')
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          'Failed to fetch warehouse'
        setError(msg)
        showToast('error', msg)
      } finally {
        setFetching(false)
      }
    }

    fetchWarehouse()
  }, [warehouseId, form])

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const { data } = await axios.put(
        `/api/warehouse/${warehouseId}/update`,
        values
      )

      if (!data?.success) {
        throw new Error(data?.message || 'Update failed')
      }

      showToast('success', data.message)
      setTimeout(() => router.push(ADMIN_WAREHOUSE_SHOW), 1200)
    } catch (err) {
      showToast(
        'error',
        err?.response?.data?.message || err.message
      )
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push(ADMIN_WAREHOUSE_SHOW)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Edit Warehouse</h4>
          </CardHeader>

          <CardContent className="pb-5 px-6">
            <div className="mt-5">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Row 1 - Warehouse Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Warehouse Name *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="e.g., Central Warehouse"
                            {...field}
                            className="rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 2 - Location & Address */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Location *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="e.g., Industrial Area"
                              {...field}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Street address"
                              {...field}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3 - City, State, Zip */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">City *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="City"
                              {...field}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">State *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="State"
                              {...field}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Zip Code *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="12345"
                              {...field}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 4 - Country */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Country *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Country"
                            {...field}
                            className="rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 5 - Phone & Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Phone *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="10-digit number"
                              {...field}
                              maxLength={10}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="warehouse@example.com"
                              {...field}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 6 - Manager & Capacity */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="manager"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Manager Name *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Manager name"
                              {...field}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Capacity (Units) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 7 - Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Status *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-lg">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="maintenance">
                              Maintenance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <ButtonLoading
                      loading={loading}
                      text="Update Warehouse"
                      type="submit"
                      className="flex-1 bg-[#fff0ea] text-orange-400 hover:bg-orange-500 hover:text-white rounded-lg cursor-pointer font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        router.push(ADMIN_WAREHOUSE_SHOW)
                      }
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
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

export default EditWarehouse