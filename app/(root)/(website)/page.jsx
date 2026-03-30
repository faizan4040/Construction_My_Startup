import CuponBanner from '@/components/Website/CuponBanner'
import FeatureProduct from '@/components/Website/FeatureProduct'
import InventoryCategories from '@/components/Website/InventoryCategories'
import JustDropped from '@/components/Website/JustDropped'
import ProductInfo from '@/components/Website/ProductInfo'
import ProductSlider from '@/components/Website/ProductSlider'
import Shopby from '@/components/Website/Shopby'
import ShopBySlider from '@/components/Website/ShopBySlider'
import Testimonial from '@/components/Website/Testimonial'
import TrendingCards from '@/components/Website/TrendingCards'
import Videoads from '@/components/Website/Videoads'
import VideoPack from '@/components/Website/VideoPack'
import React from 'react'

const Home = () => {
  return (
   <>
     <section>
       <CuponBanner/>
     </section>

     <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
       <InventoryCategories/>
    </section>

     <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
       <ProductSlider />
    </section>

     <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
       <FeatureProduct/>
    </section>


     <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
       <ShopBySlider/>
    </section>

     <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
       <JustDropped/>
    </section>


    <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
       <VideoPack/>
    </section>

    <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
      <Shopby/>  
    </section>


    <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
       <TrendingCards/>  
    </section>


    <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-24">
       <Videoads/>
    </section>

    <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
       <ProductInfo/>
    </section>

     <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
       <Testimonial/>
    </section>

    



    



   
   </>
  )
}

export default Home