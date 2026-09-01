'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import Select from '@/components/Application/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import React, { use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'

const breadcrumbData = [
  {href: ADMIN_DASHBOARD, label: 'Home'},
  {href: ADMIN_CATEGORY_SHOW, label: 'Category'},
  {href: '', label: 'Edit Category'},
]

    const EditCategory = ({ params }) => {

    const { id } = use(params)
    const { data: categoryData } = useFetch(`/api/category/get/${id}`)
    const { data: getCategory } = useFetch('/api/category/get-category')

    const [loading, setLoading] = useState(false)
    const [isSubcategory, setIsSubcategory] = useState(false)
    const [parentOption, setParentOption] = useState([])

    const formSchema = zSchema.pick({
      _id: true, name: true, slug: true
    })

 
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: id,
      name: "",
      slug: "",
      parent: "",
    },
  });


  useEffect(() => {
    if(categoryData && categoryData.success){
      const data = categoryData.data
      form.reset({
        _id: data?._id,
        name: data?.name,
        slug: data?.slug,
        parent: data?.parent || "",
      })
      setIsSubcategory(!!data?.parent)
    }
  }, [categoryData])

  useEffect(() => {
    if (getCategory && getCategory.success) {
      // a category can't be its own parent, and only top-level categories can be a parent
      const topLevel = getCategory.data.filter((cat) => !cat.parent && cat._id !== id)
      const options = topLevel.map((cat) => ({ label: cat.name, value: cat._id }))
      setParentOption(options)
    }
  }, [getCategory, id])


  useEffect(() => {
    const name = form.getValues('name')
    if(name){
        form.setValue('slug', slugify(name).toLowerCase())
    }
  },[form.watch('name')])


  const onSubmit = async (values) => {
    setLoading(true)
   try{

      if(isSubcategory && !values.parent){
        setLoading(false)
        return showToast('error', 'Please select a parent category.')
      }

      const payload = {
        ...values,
        parent: isSubcategory ? values.parent : null,
      }

      const {data: response} = await axios.put('/api/category/update', payload)
      if(!response.success){
        throw new Error(response.message)
      }
      
      showToast('success', response.message)
    } catch(error){
      showToast('error', error.message)
   } finally{
    setLoading(false)
   }
  }


  return (
    <div>
        <BreadCrumb breadcrumbData={breadcrumbData}/>
        <div className='py-4'>
        <Card className="py-0 rounded-3xl shadow-sm ">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
        <h4 className='text-xl font-semibold'>Edit Category</h4>
        </CardHeader>
        <CardContent className='pb-5'>
            <div className="mt-5">
            <Form {...form}>
                <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                >

                {/* Parent picker — only shown if this category is (or is becoming) a subcategory */}
                {isSubcategory && (
                  <div className='mb-5'>
                    <FormField
                      control={form.control}
                      name="parent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Category<span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Select
                              options={parentOption}
                              selected={field.value}
                              setSelected={field.onChange}
                              isMulti={false}
                              placeholder="Select a top-level category"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className='mb-5'>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter category name"
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
                    name="slug"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                        <Input
                            type="text"
                            placeholder="Enter slug"
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
                    text="Update Category"
                    className="  bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
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

export default EditCategory

















// 'use client'

// import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import ButtonLoading from '@/components/Application/ButtonLoading'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import useFetch from '@/hooks/useFetch'
// import { showToast } from '@/lib/showToast'
// import { zSchema } from '@/lib/zodSchema'
// import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
// import { zodResolver } from '@hookform/resolvers/zod'
// import axios from 'axios'
// import React, { use, useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import slugify from 'slugify'

// const breadcrumbData = [
//   {href: ADMIN_DASHBOARD, label: 'Home'},
//   {href: ADMIN_CATEGORY_SHOW, label: 'Category'},
//   {href: '', label: 'Edit Category'},
// ]

//     const EditCategory = ({ params }) => {

//     const { id } = use(params)
//     const { data: categoryData } = useFetch(`/api/category/get/${id}`)

//     const [loading, setLoading] = useState(false)
//     const formSchema = zSchema.pick({
//       _id: true, name: true, slug: true
//     })

 
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       _id: id,
//       name: "",
//       slug: "",    
//     },
//   });


//   useEffect(() => {
//     if(categoryData && categoryData.success){
//       const data = categoryData.data
//       form.reset({
//         _id: data?._id,
//         name: data?.name,
//         slug: data?.slug
//       })
//     }
//   }, [categoryData])


//   useEffect(() => {
//     const name = form.getValues('name')
//     if(name){
//         form.setValue('slug', slugify(name).toLowerCase())
//     }
//   },[form.watch('name')])


//   const onSubmit = async (values) => {
//     setLoading(true)
//    try{
//       const {data: response} = await axios.put('/api/category/update', values)
//       if(!response.success){
//         throw new Error(response.message)
//       }
      
//       showToast('success', response.message)
//     } catch(error){
//       showToast('error', error.message)
//    } finally{
//     setLoading(false)
//    }
//   }


//   return (
//     <div>
//         <BreadCrumb breadcrumbData={breadcrumbData}/>
//         <div className='py-4'>
//         <Card className="py-0 rounded-3xl shadow-sm ">
//         <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
//         <h4 className='text-xl font-semibold'>Edit Category</h4>
//         </CardHeader>
//         <CardContent className='pb-5'>
//             <div className="mt-5">
//             <Form {...form}>
//                 <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-6"
//                 >
//                 <div className='mb-5'>
//                 <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                     <FormItem>
//                         <FormLabel>Name</FormLabel>
//                         <FormControl>
//                         <Input
//                             type="text"
//                             placeholder="Enter category name"
//                             {...field}
//                         />
//                         </FormControl>
//                         <FormMessage />
//                     </FormItem>
//                     )}
//                 />
//                 </div>

//                 <div className='mb-5'>
//                 <FormField
//                     control={form.control}
//                     name="slug"
//                     render={({ field }) => (
//                     <FormItem>
//                         <FormLabel>Slug</FormLabel>
//                         <FormControl>
//                         <Input
//                             type="text"
//                             placeholder="Enter slug"
//                             {...field}
//                         />
//                         </FormControl>
//                         <FormMessage />
//                     </FormItem>
//                     )}
//                 />
//                 </div>
//                 {/* Submit */}
//                 <ButtonLoading
//                     loading={loading}
//                     type="submit"
//                     text="Update Category"
//                     className="  bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
//                 />
//                 </form>
//             </Form>
//             </div>
//         </CardContent>
//         </Card>
//         </div>
//     </div>
//   )
// }

// export default EditCategory 