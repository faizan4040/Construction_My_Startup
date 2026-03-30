'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import React, { use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IMAGES } from "@/routes/AllImages";
import { showToast } from '@/lib/showToast'
import axios from 'axios'

const breadCrumbData = [
  {
    href: ADMIN_DASHBOARD,
    label: 'HOME'
  },
  {
    href: ADMIN_MEDIA_SHOW,
    label: 'Media'
  },
  {
    href: '',
    label: 'Edit Media'
  }

]

  const EditMedia = ({params}) => {
  const { id } = use(params)
  const {data: mediaData} = useFetch(`/api/media/get/${id}`)
  const [loading, setLoading] = useState(false)


  const formSchema = zSchema.pick({
      _id: true,
      alt: true,
      title: true
    })
   
 
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id:   "",
      alt:   "",
      title: "",
    },
  });

  useEffect(()=>{
    if(mediaData && mediaData.success){
      const data = mediaData.data
      form.reset({
        _id: data._id,
        alt: data.alt,
        title: data.title
      })
    }
  }, [mediaData])

  const onSubmit = async (values) => {
   try {
         setLoading(true)
         const { data: response } = await axios.put("/api/media/update", values);
         if (!response.success) {
          throw new Error(response.message);
         }
   
         showToast('success', response.message)
       } catch (error) {
          showToast('error', error.message);
       } finally {
         setLoading(false);
       }
     };




  return (
    <div>
      <BreadCrumb breadcrumbData={breadCrumbData}/>
      <div className='py-4'>
         <Card className="py-0 rounded-3xl shadow-sm ">
           <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
           <h4 className='text-xl font-semibold'>Edit Media</h4>
        </CardHeader>
        <CardContent className='pb-5'>
          <div className="mt-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className='mb-5'>
                  <Image
                   src={mediaData?.data?.secure_url || IMAGES.image_placeholder}
                   width={200}
                   height={200}
                   alt={mediaData?.alt || 'Image'}
                   className='rounded-3xl'
                  />
                </div>

              
                <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter alt"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                {/* Submit */}
                <ButtonLoading
                  loading={loading}
                  type="submit"
                  text="Update Media"
                  className="bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
                />

                
              </form>
            </Form>
            </div>

        </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EditMedia