'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_COUPON_SHOW, ADMIN_DASHBOARD, } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import dayjs from 'dayjs'
import React, { use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_COUPON_SHOW, label: 'Coupons' },
  { href: '', label: 'Edit Coupon' },
]

const EditCoupon  = ({params}) => {
  const { id } = use(params)
  const [loading, setLoading] = useState(false)
  const {data, getCouponData} = useFetch(`/api/coupon/get/${id}`)

  const formSchema = zSchema.pick({
    _id: true,
    code: true,
    discountPercentage: true,
    minShoppingAmount: true,
    validity: true,
  })


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: id,
      code: "",
      discountPercentage: "",
      minShoppingAmount: "",
      validity: "",
    },
  });

  useEffect(()=>{
      if(getCouponData && getCouponData.success){
        const coupon = getCouponData.data
        form.reset({
          _id: coupon._id,
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          minShoppingAmount: coupon.minShoppingAmount,
          validity: dayjs(coupon.validity).format('YYY-MM-DD'),
        })
      }
  },[getCouponData])


  const onSubmit = async (values) => {
    setLoading(true)
    try {

      const { data: response } = await axios.put('/api/coupon/update', values)
      if (!response.success) {
        throw new Error(response.message)
      }

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
      <div className="py-4 ">
        <Card className="py-0 rounded-3xl shadow-sm">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Edit Coupon</h4>
          </CardHeader>

          <CardContent className="pb-5">
            <div className="mt-5">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >

                  {/* Row 1: Name + Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code<span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter product name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Discount Percentage */}
                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount (%)<span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter discount percentage"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minShoppingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min. Shopping Amount<span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter Min. Shopping Amount"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="validity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validity<span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div />
                  </div>


                  <div className='mb-3 mt-5'>
                    <ButtonLoading
                      loading={loading}
                      type="submit"
                      text="+ Save Changes"
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

export default EditCoupon  