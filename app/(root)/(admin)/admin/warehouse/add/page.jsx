'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { showToast } from '@/lib/showToast'
import { warehouseSchema } from '@/lib/zodSchema'
import { ADMIN_WAREHOUSE_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_WAREHOUSE_SHOW, label: 'Warehouse' },
  { href: '', label: 'Add Warehouse' },
]

const AddWarehouse = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
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

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const { data: response } = await axios.post('/api/warehouse/create', values)
      
      if (!response.success) {
        throw new Error(response.message)
      }
      
      showToast('success', response.message)
      form.reset()
      setTimeout(() => router.push(ADMIN_WAREHOUSE_SHOW), 1500)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className='py-4'>
        <Card className="py-0 rounded-3xl shadow-sm">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className='text-xl font-semibold'>Add New Warehouse</h4>
          </CardHeader>
          <CardContent className='pb-5 px-6'>
            <div className="mt-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Row 1 - Warehouse Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-base font-medium'>Warehouse Name *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="e.g., Central Warehouse"
                            {...field}
                            className='rounded-lg'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 2 - Location & Address */}
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-base font-medium'>Location *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="e.g., Industrial Area"
                              {...field}
                              className='rounded-lg'
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
                          <FormLabel className='text-base font-medium'>Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Street address"
                              {...field}
                              className='rounded-lg'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3 - City, State, Zip */}
                  <div className='grid grid-cols-3 gap-4'>
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-base font-medium'>City *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="City"
                              {...field}
                              className='rounded-lg'
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
                          <FormLabel className='text-base font-medium'>State *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="State"
                              {...field}
                              className='rounded-lg'
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
                          <FormLabel className='text-base font-medium'>Zip Code *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="12345"
                              {...field}
                              className='rounded-lg'
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
                        <FormLabel className='text-base font-medium'>Country *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Country"
                            {...field}
                            className='rounded-lg'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 5 - Phone & Email */}
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-base font-medium'>Phone *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="10-digit number"
                              {...field}
                              className='rounded-lg'
                              maxLength={10}
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
                          <FormLabel className='text-base font-medium'>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="warehouse@example.com"
                              {...field}
                              className='rounded-lg'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 6 - Manager & Capacity */}
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name="manager"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-base font-medium'>Manager Name *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Manager name"
                              {...field}
                              className='rounded-lg'
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
                          <FormLabel className='text-base font-medium'>Capacity (Units) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className='rounded-lg'
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
                        <FormLabel className='text-base font-medium'>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className='rounded-lg'>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className='pt-4'>
                    <ButtonLoading
                      loading={loading}
                      type="submit"
                      text="+ Add Warehouse"
                      className="w-full bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white rounded-lg py-2"
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

export default AddWarehouse