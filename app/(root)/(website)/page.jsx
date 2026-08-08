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
import BookNow from "@/components/Application/Labour/BookNow";
import GeoUpdater from "@/components/Application/Labour/GeoUpdater";
import Testimonial from '@/components/Website/Testimonial'
// import Shopby from '@/components/Website/Shopby'

const Home = () => {
  // auth IS the user object directly — same as Navbar reads it.
  const auth = useSelector((state) => state.authStore.auth);

  if (auth?.role === "laber") {
    return (
      <>
        <GeoUpdater userId={auth?._id} />
        <PartnerDashboard />
      </>
    );
  }

  return (
    <>
      <section>
        <CuponBanner />
      </section>

      {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-1">
     <Shopby/>  
    </section>  */}

      {/* <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
        <TrendingPage />
      </section> */}

      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10">
        <BookNow />
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

     <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <Testimonial/>
    </section> 
    </>
  );
};

export default Home;



