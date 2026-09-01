'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import Select from '@/components/Application/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'

const breadcrumbData = [
  {href: ADMIN_DASHBOARD, label: 'Home'},
  {href: ADMIN_CATEGORY_SHOW, label: 'Category'},
  {href: '', label: 'Add Category'},
]

// empty attribute row template
const emptyAttribute = () => ({ label: '', presets: [], allowCustom: true, _presetInput: '' })

const AddCategory = () => {
    const [loading, setLoading] = useState(false)
    const [categoryType, setCategoryType] = useState('top') // 'top' | 'sub'
    const [parentOption, setParentOption] = useState([])

    // ===== Dynamic attribute builder state (only used when categoryType === 'sub') =====
    // e.g. Cement -> [{ label: "Weight", presets: ["25kg","50kg"], allowCustom: true }]
    const [attributes, setAttributes] = useState([])

    // only top-level categories can be a parent
    const { data: getCategory } = useFetch('/api/category/get-category')

    useEffect(() => {
      if (getCategory && getCategory.success) {
        const topLevel = getCategory.data.filter((cat) => !cat.parent)
        const options = topLevel.map((cat) => ({ label: cat.name, value: cat._id }))
        setParentOption(options)
      }
    }, [getCategory])

    const formSchema = zSchema.pick({
      name: true, slug: true
    })


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      parent: "",
    },
  });


  useEffect(() => {
    const name = form.getValues('name')
    if(name){
        form.setValue('slug', slugify(name).toLowerCase())
    }
  },[form.watch('name')])

  // ===== Attribute builder helpers =====
  const addAttributeRow = () => {
    setAttributes(prev => [...prev, emptyAttribute()])
  }

  const removeAttributeRow = (index) => {
    setAttributes(prev => prev.filter((_, i) => i !== index))
  }

  const updateAttributeField = (index, field, value) => {
    setAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, [field]: value } : attr))
  }

  const addPresetValue = (index) => {
    setAttributes(prev => prev.map((attr, i) => {
      if (i !== index) return attr
      const newPreset = attr._presetInput.trim()
      if (!newPreset) return attr
      if (attr.presets.includes(newPreset)) return { ...attr, _presetInput: '' }
      return { ...attr, presets: [...attr.presets, newPreset], _presetInput: '' }
    }))
  }

  const removePresetValue = (index, presetToRemove) => {
    setAttributes(prev => prev.map((attr, i) =>
      i === index ? { ...attr, presets: attr.presets.filter(p => p !== presetToRemove) } : attr
    ))
  }


  const onSubmit = async (values) => {
    setLoading(true)
   try{

      if(categoryType === 'sub' && !form.getValues('parent')){
        setLoading(false)
        return showToast('error', 'Please select a parent category.')
      }

      // validate attribute rows: every added row must at least have a label
      const cleanedAttributes = attributes
        .filter(a => a.label.trim())
        .map(({ label, presets, allowCustom }) => ({ label: label.trim(), presets, allowCustom }))

      const payload = {
        ...values,
        parent: categoryType === 'sub' ? form.getValues('parent') : null,
        attributes: categoryType === 'sub' ? cleanedAttributes : [],
      }

      const {data: response} = await axios.post('/api/category/create', payload)
      if(!response.success){
        throw new Error(response.message)
      }

      form.reset()
      setAttributes([])
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
        <h4 className='text-xl font-semibold'>Add Category</h4>
        </CardHeader>
        <CardContent className='pb-5'>
            <div className="mt-5">
            <Form {...form}>
                <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                >

                {/* Top-level vs Subcategory */}
                <div className='mb-5'>
                  <FormLabel className="mb-2 block">What are you adding?</FormLabel>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryType('top')
                        form.setValue('parent', '')
                        setAttributes([])
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                        categoryType === 'top'
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-600 border-gray-300 hover:border-orange-300"
                      )}
                    >
                      Top-level Category
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryType('sub')
                        form.setValue('parent', '')
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                        categoryType === 'sub'
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-600 border-gray-300 hover:border-orange-300"
                      )}
                    >
                      Subcategory
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {categoryType === 'top'
                      ? "e.g. \"Civil & Interiors\" — a broad group shown in the main menu."
                      : "e.g. \"Cement\" — sits inside a top-level category, products get linked here."}
                  </p>
                </div>

                {/* Parent picker — only when adding a subcategory */}
                {categoryType === 'sub' && (
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
                            placeholder={categoryType === 'sub' ? "e.g. Cement" : "e.g. Civil & Interiors"}
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

                {/* ===== Dynamic Attribute Builder — only for Subcategories ===== */}
                {categoryType === 'sub' && (
                  <div className='mb-5 rounded-2xl border border-gray-200 p-4'>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <FormLabel className="block">Variant Options (Size / Weight / Diameter / Color...)</FormLabel>
                        <p className="text-xs text-gray-500 mt-1">
                          Define what options Shopowners will pick from when adding products under
                          this subcategory — e.g. Cement → "Weight" with 25kg, 50kg presets.
                          Optional — skip if this subcategory doesn't need size/weight variants.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addAttributeRow}
                        className="shrink-0 px-3 py-1.5 rounded-lg border border-orange-400 text-orange-500 text-sm font-medium hover:bg-orange-50 cursor-pointer"
                      >
                        + Add Option
                      </button>
                    </div>

                    {attributes.length === 0 && (
                      <p className="text-sm text-gray-400">No options added yet.</p>
                    )}

                    <div className="space-y-4">
                      {attributes.map((attr, index) => (
                        <div key={index} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Input
                              placeholder="Option name — e.g. Weight, Diameter, Color"
                              value={attr.label}
                              onChange={(e) => updateAttributeField(index, 'label', e.target.value)}
                              className="bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => removeAttributeRow(index)}
                              className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer"
                              title="Remove this option"
                            >
                              ×
                            </button>
                          </div>

                          {/* Preset values */}
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-600 mb-1">Preset values (optional)</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {attr.presets.map((preset) => (
                                <span
                                  key={preset}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs"
                                >
                                  {preset}
                                  <button
                                    type="button"
                                    onClick={() => removePresetValue(index, preset)}
                                    className="hover:text-red-500 cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="e.g. 25kg — press Enter to add"
                                value={attr._presetInput}
                                onChange={(e) => updateAttributeField(index, '_presetInput', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addPresetValue(index)
                                  }
                                }}
                                className="bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => addPresetValue(index)}
                                className="shrink-0 px-3 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-orange-300 cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Allow custom toggle */}
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={attr.allowCustom}
                              onChange={(e) => updateAttributeField(index, 'allowCustom', e.target.checked)}
                            />
                            Allow Shopowners to type a custom value too (not just presets)
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <ButtonLoading
                    loading={loading}
                    type="submit"
                    text="+ Add Category"
                    className=" bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
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

export default AddCategory












// 'use client'

// import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import ButtonLoading from '@/components/Application/ButtonLoading'
// import Select from '@/components/Application/Select'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { cn } from '@/lib/utils'
// import useFetch from '@/hooks/useFetch'
// import { showToast } from '@/lib/showToast'
// import { zSchema } from '@/lib/zodSchema'
// import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
// import { zodResolver } from '@hookform/resolvers/zod'
// import axios from 'axios'
// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import slugify from 'slugify'

// const breadcrumbData = [
//   {href: ADMIN_DASHBOARD, label: 'Home'},
//   {href: ADMIN_CATEGORY_SHOW, label: 'Category'},
//   {href: '', label: 'Add Category'},
// ]

//     const AddCategory = () => {
//     const [loading, setLoading] = useState(false)
//     const [categoryType, setCategoryType] = useState('top') // 'top' | 'sub'
//     const [parentOption, setParentOption] = useState([])

//     // only top-level categories can be a parent
//     const { data: getCategory } = useFetch('/api/category/get-category')

//     useEffect(() => {
//       if (getCategory && getCategory.success) {
//         const topLevel = getCategory.data.filter((cat) => !cat.parent)
//         const options = topLevel.map((cat) => ({ label: cat.name, value: cat._id }))
//         setParentOption(options)
//       }
//     }, [getCategory])

//     const formSchema = zSchema.pick({
//       name: true, slug: true
//     })

 
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       slug: "",    
//       parent: "",
//     },
//   });


//   useEffect(() => {
//     const name = form.getValues('name')
//     if(name){
//         form.setValue('slug', slugify(name).toLowerCase())
//     }
//   },[form.watch('name')])


//   const onSubmit = async (values) => {
//     setLoading(true)
//    try{

//       if(categoryType === 'sub' && !form.getValues('parent')){
//         setLoading(false)
//         return showToast('error', 'Please select a parent category.')
//       }

//       const payload = {
//         ...values,
//         parent: categoryType === 'sub' ? form.getValues('parent') : null,
//       }

//       const {data: response} = await axios.post('/api/category/create', payload)
//       if(!response.success){
//         throw new Error(response.message)
//       }
      
//       form.reset()
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
//         <h4 className='text-xl font-semibold'>Add Category</h4>
//         </CardHeader>
//         <CardContent className='pb-5'>
//             <div className="mt-5">
//             <Form {...form}>
//                 <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-6"
//                 >

//                 {/* Top-level vs Subcategory */}
//                 <div className='mb-5'>
//                   <FormLabel className="mb-2 block">What are you adding?</FormLabel>
//                   <div className="flex gap-3">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setCategoryType('top')
//                         form.setValue('parent', '')
//                       }}
//                       className={cn(
//                         "px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
//                         categoryType === 'top'
//                           ? "bg-orange-500 text-white border-orange-500"
//                           : "bg-white text-gray-600 border-gray-300 hover:border-orange-300"
//                       )}
//                     >
//                       Top-level Category
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setCategoryType('sub')
//                         form.setValue('parent', '')
//                       }}
//                       className={cn(
//                         "px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
//                         categoryType === 'sub'
//                           ? "bg-orange-500 text-white border-orange-500"
//                           : "bg-white text-gray-600 border-gray-300 hover:border-orange-300"
//                       )}
//                     >
//                       Subcategory
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-2">
//                     {categoryType === 'top'
//                       ? "e.g. \"Civil & Interiors\" — a broad group shown in the main menu."
//                       : "e.g. \"Cement\" — sits inside a top-level category, products get linked here."}
//                   </p>
//                 </div>

//                 {/* Parent picker — only when adding a subcategory */}
//                 {categoryType === 'sub' && (
//                   <div className='mb-5'>
//                     <FormField
//                       control={form.control}
//                       name="parent"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Parent Category<span className='text-red-500'>*</span></FormLabel>
//                           <FormControl>
//                             <Select
//                               options={parentOption}
//                               selected={field.value}
//                               setSelected={field.onChange}
//                               isMulti={false}
//                               placeholder="Select a top-level category"
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 )}

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
//                             placeholder={categoryType === 'sub' ? "e.g. Cement" : "e.g. Civil & Interiors"}
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
//                     text="+ Add Category"
//                     className=" bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
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

// export default AddCategory








// 'use client'

// import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import ButtonLoading from '@/components/Application/ButtonLoading'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { showToast } from '@/lib/showToast'
// import { zSchema } from '@/lib/zodSchema'
// import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
// import { zodResolver } from '@hookform/resolvers/zod'
// import axios from 'axios'
// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import slugify from 'slugify'

// const breadcrumbData = [
//   {href: ADMIN_DASHBOARD, label: 'Home'},
//   {href: ADMIN_CATEGORY_SHOW, label: 'Category'},
//   {href: '', label: 'Add Category'},
// ]

//     const AddCategory = () => {
//     const [loading, setLoading] = useState(false)
//     const formSchema = zSchema.pick({
//       name: true, slug: true
//     })

 
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       slug: "",    
//     },
//   });


//   useEffect(() => {
//     const name = form.getValues('name')
//     if(name){
//         form.setValue('slug', slugify(name).toLowerCase())
//     }
//   },[form.watch('name')])


//   const onSubmit = async (values) => {
//     setLoading(true)
//    try{
//       const {data: response} = await axios.post('/api/category/create', values)
//       if(!response.success){
//         throw new Error(response.message)
//       }
      
//       form.reset()
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
//         <h4 className='text-xl font-semibold'>Add Category</h4>
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
//                     text="+ Add Category"
//                     className=" bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
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

// export default AddCategory  