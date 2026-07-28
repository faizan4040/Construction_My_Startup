"use client";

import React from "react";
import { useSelector } from "react-redux";
import BuyerSupplierSection from "@/components/Website/BuyerSupplierSection";
import CuponBanner from "@/components/Website/CuponBanner";
import FeatureProduct from "@/components/Website/FeatureProduct";
import JustDropped from "@/components/Website/JustDropped";
import LabourSlider from "@/components/Website/LabourSlider";
import ShopBySlider from "@/components/Website/ShopBySlider";
import TrendingPage from "@/components/Website/TrendingPage";
import PartnerDashboard from "@/components/Application/Labour/PartnerDashboard";

const Home = () => {
  // auth IS the user object directly — same as Navbar reads it.
  const auth = useSelector((state) => state.authStore.auth);

  if (auth?.role === "laber") {
    return <PartnerDashboard />;
  }

  return (
    <>
      <section>
        <CuponBanner />
      </section>

      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
        <TrendingPage />
      </section>

      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
        <LabourSlider />
      </section>

      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
        <FeatureProduct />
      </section>

      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
        <ShopBySlider />
      </section>

      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
        <JustDropped />
      </section>

      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
        <BuyerSupplierSection />
      </section>
    </>
  );
};

export default Home;





// import BuyerSupplierSection from '@/components/Website/BuyerSupplierSection'
// import CuponBanner from '@/components/Website/CuponBanner'
// import FeatureProduct from '@/components/Website/FeatureProduct'
// import JustDropped from '@/components/Website/JustDropped'
// import LabourSlider from '@/components/Website/LabourSlider'
// import ShopBySlider from '@/components/Website/ShopBySlider'
// import TrendingPage from '@/components/Website/TrendingPage'
// // import InventoryCategories from '@/components/Website/InventoryCategories'
// // import ProductInfo from '@/components/Website/ProductInfo'
// // import Shopby from '@/components/Website/Shopby'
// // import Testimonial from '@/components/Website/Testimonial'
// // import TrendingCards from '@/components/Website/TrendingCards'
// // import Videoads from '@/components/Website/Videoads'
// // import VideoPack from '@/components/Website/VideoPack'
// import React from 'react'

// const Home = () => {
//   return (
//    <>
//      <section>
//        <CuponBanner/>
//      </section>

//      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
//        <TrendingPage/>
//      </section>

//      {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
//        <InventoryCategories/>
//     </section> */}

//      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
//        <LabourSlider/>
//      </section>

//      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
//        <FeatureProduct/>
//     </section>


//      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
//        <ShopBySlider/>
//     </section>


//      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
//        <JustDropped/>
//     </section>


//     {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
//        <VideoPack/>
//     </section> */}

//     {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
//       <Shopby/>  
//     </section> */}


//     <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
//      <BuyerSupplierSection/>
//     </section>


//     {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
//        <TrendingCards/>  
//     </section> */}


//     {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-24">
//        <Videoads/>
//     </section> */}

//     {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
//        <ProductInfo/>
//     </section> */}

//      {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
//        <Testimonial/>
//     </section> */}


   
//    </>
//   )
// }

// export default Home