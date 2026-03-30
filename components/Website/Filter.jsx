'use client'
import useFetch from '@/hooks/useFetch'
import React, { useEffect, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from '../ui/checkbox'
import { Slider } from '../ui/slider'
import ButtonLoading from '../Application/ButtonLoading'
import { useRouter, useSearchParams } from 'next/navigation'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { Button } from '../ui/button'
import Link from 'next/link'
import { sizes } from '@/lib/utils'

const Filter = () => {
    const  searchParams = useSearchParams()

    const [selectedCategory, setSelectedCategory] = useState([])
    const [selectedColor, setSelectedColor] = useState([])
    const [selectedSize, setSelectedSize] = useState([])
    
    const [priceFilter, setPriceFilter] = useState({minPrice: 0, maxPrice: 3000})
    const { data: categoryData } = useFetch('/api/category/get-category')
    const { data: colorData } = useFetch('/api/product-variant/colors')
    const { data: sizeData } = useFetch('/api/product-variant/sizes')

    const urlSearchParams = new URLSearchParams(searchParams.toString())
    const router = useRouter()

    useEffect(()=>{
        searchParams.get('category') ? setSelectedCategory(searchParams.get('category').split(',')) : setSelectedCategory([])
        searchParams.get('color') ? setSelectedColor(searchParams.get('color').split(',')) : setSelectedColor([])
        searchParams.get('size') ? setSelectedSize(searchParams.get('size').split(',')) : setSelectedSize([])
    },[searchParams])

    const handlePriceChange = (value) => {
     setPriceFilter({ minPrice: value[0], maxPrice: value[1] })
    }

    const handleCategoryFilter = (categorySlug) => {
      const params = new URLSearchParams(searchParams.toString())

      let newSelectedCategory = [...selectedCategory]
      if (newSelectedCategory.includes(categorySlug)) {
        newSelectedCategory = newSelectedCategory.filter(cat => cat !== categorySlug)
      } else {
        newSelectedCategory.push(categorySlug)
      }

      setSelectedCategory(newSelectedCategory)

      newSelectedCategory.length > 0
        ? params.set('category', newSelectedCategory.join(','))
        : params.delete('category')

      router.push(`${WEBSITE_SHOP}?${params.toString()}`)
    }



    const handleColorFilter = (color) => {
      const params = new URLSearchParams(searchParams.toString())

      let newSelectedColor = [...selectedColor]
      if (newSelectedColor.includes(color)) {
        newSelectedColor = newSelectedColor.filter(c => c !== color)
      } else {
        newSelectedColor.push(color)
      }

      setSelectedColor(newSelectedColor)

      newSelectedColor.length > 0
        ? params.set('color', newSelectedColor.join(','))
        : params.delete('color')

      router.push(`${WEBSITE_SHOP}?${params.toString()}`)
    }


    const handleSizeFilter = (size) => {
      const params = new URLSearchParams(searchParams.toString())

      let newSelectedSize = [...selectedSize]
      if (newSelectedSize.includes(size)) {
        newSelectedSize = newSelectedSize.filter(s => s !== size)
      } else {
        newSelectedSize.push(size)
      }

      setSelectedSize(newSelectedSize)

      newSelectedSize.length > 0
        ? params.set('size', newSelectedSize.join(','))
        : params.delete('size')

      router.push(`${WEBSITE_SHOP}?${params.toString()}`)
    }


    const handleGenderFilter = (gender) => {
    const params = new URLSearchParams(searchParams.toString())

    // same gender dobara click → remove
    if (searchParams.get('gender') === gender) {
      params.delete('gender')
    } else {
      params.set('gender', gender) // men | women | kids
    }

    params.delete('page') // pagination reset (important)

    router.push(`${WEBSITE_SHOP}?${params.toString()}`)
  }



    const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())

    params.set('minPrice', priceFilter.minPrice)
    params.set('maxPrice', priceFilter.maxPrice)

    router.push(`${WEBSITE_SHOP}?${params.toString()}`)
  }

  return (
    <div>
      {searchParams.size > 0 && 
        <Button type="button" variant='destructive' className="w-full" asChild>
            <Link href={WEBSITE_SHOP}>
              Clear Filter
            </Link>
        </Button>
      }
    <Accordion type="multiple" defaultValue={['1', '2', '3', '4']} className="cursor-pointer">
    <AccordionItem value="item-1">
        <AccordionTrigger className="uppercase font-semibold cursor-pointer">Category</AccordionTrigger>
        <AccordionContent>
         <div className='max-h-48 overflow-auto'>
           <ul>
            {categoryData && categoryData.success && categoryData.data.map((category)=>(
                <li key={category._id}>
                    <label className='flex items-center space-x-3'>
                     <Checkbox className='cursor-pointer'
                      onCheckedChange={()=> handleCategoryFilter(category.slug)}
                      checked={selectedCategory.includes(category.slug)}
                     />
                     <span>{category.name}</span>
                    </label>
                </li>
            ))}
           </ul>
         </div>
        </AccordionContent>
    </AccordionItem>

    <AccordionItem value="item-2">
        <AccordionTrigger className="uppercase font-semibold cursor-pointer">Color</AccordionTrigger>
        <AccordionContent>
         <div className='max-h-48 overflow-auto'>
           <ul>
            {colorData && colorData.success && colorData.data.map((color)=>(
                <li key={color}>
                    <label className='flex items-center space-x-3'>
                     <Checkbox className='cursor-pointer'
                      onCheckedChange={()=> handleColorFilter(color)}
                      checked={selectedColor.includes(color)}
                     />
                     <span>{color}</span>
                    </label>
                </li>
            ))}
           </ul>
         </div>
        </AccordionContent>
    </AccordionItem>


    <AccordionItem value="item-3">
    <AccordionTrigger className="uppercase font-semibold cursor-pointer">Size</AccordionTrigger>
    <AccordionContent>
       <div className="max-h-48 overflow-auto">
          <ul>
            {sizes.map((size) => (
              <li key={size.value}>
                <label className="flex items-center space-x-3">
                  <Checkbox
                    className="cursor-pointer"
                    onCheckedChange={() => handleSizeFilter(size.value)}
                    checked={selectedSize.includes(size.value)}
                  />
                  <span>{size.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
    </AccordionContent>
    </AccordionItem>


        <AccordionItem value="item-gender">
      <AccordionTrigger className="uppercase font-semibold cursor-pointer">
        Gender
      </AccordionTrigger>

      <AccordionContent>
        <div className="max-h-48 overflow-auto">
          <ul>
            {['men', 'women', 'kids'].map((gender) => (
              <li key={gender}>
                <label className="flex items-center space-x-3">
                  <Checkbox
                    className="cursor-pointer"
                    onCheckedChange={() => handleGenderFilter(gender)}
                    checked={searchParams.get('gender') === gender}
                  />
                  <span className="capitalize">{gender}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>


    <AccordionItem value="item-4">
        <AccordionTrigger className="uppercase font-semibold cursor-pointer">Price</AccordionTrigger>
        <AccordionContent>
         <Slider defaultValue={[0, 3000]} max={3000} step={1} onValueChange={handlePriceChange} className='p-4'/>
         <div className='flex justify-between items-center pt-4 '>
            <span>{priceFilter.minPrice.toLocaleString('en-IN',{ style:'currency', currency: 'INR'})}</span>
            <span>{priceFilter.maxPrice.toLocaleString('en-IN',{ style:'currency', currency: 'INR'})}</span>
         </div>

         <div className='mt-4'>
            <ButtonLoading onClick={handlePriceFilter} type='button' text="Filter price"
             className="rounded-full p-4 cursor-pointer border-2 border-orange-500 hover:bg-orange-400 hover:text-white transition-all duration-300"
            />
         </div>
        </AccordionContent>
    </AccordionItem>


    </Accordion>
    </div>
  )
}

export default Filter