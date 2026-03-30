'use client'
import Filter from '@/components/Website/Filter'
import Sorting from '@/components/Website/Sorting'
import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import React, { useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import useWindowSize from '@/hooks/useWindowSize'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import ProductBox from '@/components/Website/ProductBox'
import ButtonLoading from '@/components/Application/ButtonLoading'


const breadCrumb = {
  title: 'Shop',
  links: [{ label: 'Shop', href: WEBSITE_SHOP }],
}

const Shop = () => {
   const searchParams = useSearchParams().toString()
   const [limit, setLimit] = useState(9)
   const [sorting, setSorting] = useState('default_sorting')
   const [isMobileFilter, setIsMobileFilter] = useState(false)
   const windowSize = useWindowSize()


    const fetchProduct = async ({ pageParam = 0 }) => {
      const { data } = await axios.get(
        `/api/shop?page=${pageParam}&limit=${limit}&sort=${sorting}&${searchParams}`
      )
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch products")
      }

      return {
        products: data.data.products,
        nextPage: data.data.nextPage,
      }
    }

    const {error, data, isFetching, fetchNextPage, hasNextPage} = useInfiniteQuery({
    queryKey: ['products', limit, sorting, searchParams],
    queryFn: fetchProduct,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage?.nextPage ?? undefined,
  })

  return (
    <div>
      <WebsiteBreadcrumb title={breadCrumb.title} links={breadCrumb.links} />
      <section className="lg:flex lg:px-24 md:px-10 px-4 my-16">
        {windowSize.width > 1024 ? 
      
        <div className="lg:w-72 w-full lg:me-6 mb-8 lg:mb-0">
          <div className="sticky top-24 bg-gray-50 p-4 rounded">
            <Filter />
          </div>
        </div>
        :
        <>   
        <Sheet  open={isMobileFilter} onOpenChange={() => setIsMobileFilter(false)}>
        <SheetContent side='left'>
          <SheetHeader className="border-b">
            <SheetTitle>Filter</SheetTitle>
           
          </SheetHeader>
          <div className='p-4 overflow-auto h-[calc(100, h-80px)]'>
             <Filter/>
          </div>
        </SheetContent>
        </Sheet>
        </>
      }
      
        <div className="lg:w-[calc(100%-18rem)]">
        <Sorting 
        limit={limit}
        setLimit={setLimit}
        sorting={sorting}
        setSorting={setSorting}
        mobileFilterOpen={isMobileFilter}
        setMobileFilterOpen={setIsMobileFilter}
        />
       

       {isFetching  && <div className='p-3 font-semibold text-center'>Loading...</div>}
       {error  && <div className='p-3 font-semibold text-center'>{error.message}</div>}


       <div className='grid lg:grid-cols-3 grid-cols-2 lg:gap-10 gap-5 mt-8'>
         {data?.pages?.map(page =>
          page.products.map(product => (
            <ProductBox key={product._id} product={product} />
          ))
        )}
       </div>

       {/* Load more button */}
       <div className='flex justify-center mt-10'>
           {hasNextPage ? 
              <ButtonLoading type="button" loading={isFetching} text="Load More" onClick={fetchNextPage}/>
            :
            <>
             {!isFetching && <span>No More data to load.</span>}
            </>

           }    
       </div>

        </div>
      </section>
    </div>
  )
}

export default Shop


