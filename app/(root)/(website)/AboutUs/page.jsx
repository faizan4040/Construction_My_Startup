'use client'

import { IMAGES } from '@/routes/AllImages'
import React from 'react'

const AboutUs = () => {
  return (
    <div className="w-full">

      {/* ---------- HERO BANNER ---------- */}
      <section className="relative h-[60vh] w-full">
        <img
          src={IMAGES.aboutus}
          alt="About Constructezy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 text-white">
            <h1 className="text-6xl lg:text-5xl font-extrabold leading-tight">
              ABOUT CONSTRUCTEZY
            </h1>
          </div>
        </div>
      </section>

      {/* ---------- WHO ARE WE ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
            <h2 className="text-5xl mb-4 font-sans">
             We are a modern platform connecting you with trusted labor, plumbers, and home service professionals.
            </h2>
          </div>

        <p className="rounded-2xl  w-full ">
            Our mission is to make it simple and affordable to hire skilled workers for construction, repairs, and daily home needs. 
            We help customers find reliable professionals quickly while ensuring quality service and fair pricing.
        </p>
      </section>

      {/* ---------- OUR HISTORY ---------- */}
    <section className="bg-gray-100 py-20">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ---------- CARD 1 : WHO ARE WE ---------- */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <img
            src={IMAGES.Who_are_we}
            alt="Who are we"
            className="w-full h-64 object-cover"
        />

        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Who are we?</h2>

            <p className="text-gray-700 text-lg mb-4 leading-relaxed">
            Constructezy is a one-stop solution for all your construction and home service needs.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed">
            From skilled labor to plumbing and household support, we connect you with verified professionals 
            who deliver reliable and efficient services at your convenience.
            </p>
        </div>
        </div>

        {/* ---------- CARD 2 : OUR HISTORY ---------- */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <img
            src={IMAGES.Our_history}
            alt="Our history"
            className="w-full h-64 object-cover"
        />

        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our journey</h2>

            <p className="text-gray-700 text-lg mb-4 leading-relaxed">
            Constructezy started with a simple goal — to solve the everyday problem of finding reliable workers.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed">
            We are building a platform where customers can easily hire trusted professionals without delays, 
            confusion, or high costs.
            </p>
        </div>
        </div>

    </div>
    </section>


      {/* ---------- EXPERTS BANNER ---------- */}
      <section className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-6">
              Experts in what we do
            </h2>
            <p className="text-lg leading-relaxed">
              We work with experienced and verified professionals who specialize in construction, plumbing, and home services. 
              Our focus is on delivering quality work, reliable service, and complete customer satisfaction every time.
            </p>
          </div>

          <img
            src={IMAGES.Repair_Maintenance}
            alt="Experts"
            className="rounded-2xl shadow-xl w-full object-cover"
          />
        </div>
      </section>

      {/* ---------- PRODUCTS + AWARDS ---------- */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ---------- CARD 1 : SERVICES ---------- */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <img
                src={IMAGES.product}
                alt="Services"
                className="w-full h-64 object-cover"
            />

            <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">All services in one place</h2>

                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                From construction labor to plumbing and daily home services, we provide everything you need on a single platform.
                </p>

                <p className="text-gray-700 text-lg leading-relaxed">
                Our goal is to save your time and effort by giving you quick access to the right professionals whenever you need them.
                </p>
            </div>
            </div>

            {/* ---------- CARD 2 : TRUST ---------- */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <img
                src={IMAGES.Repair_Maintenance}
                alt="Trust"
                className="w-full h-64 object-cover"
            />

            <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">Trusted & Reliable</h2>

                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                    We focus on building trust by connecting customers with verified and skilled workers.
                </p>

                <p className="text-gray-700 text-lg leading-relaxed">
                    With affordable pricing, transparent service, and reliable professionals, we aim to make your experience smooth and hassle-free.
                </p>
            </div>
            </div>

        </div>
        </section>


      {/* ---------- SUSTAINABILITY ---------- */}
      <section className="bg-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          <div>
            <h2 className="text-4xl font-extrabold mb-6">
              Building a Better Future
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We believe in creating opportunities for skilled workers while making services accessible for everyone.
            </p>

            <p className="text-lg leading-relaxed">
              Constructezy is committed to improving the way people connect with service providers — making it faster, easier, and more reliable.
            </p>
            
          </div>

          <img
            src={IMAGES.laber}
            alt="Future"
            className="rounded-2xl shadow-xl w-full object-cover"
          />
        </div>
      </section>

    </div>
  )
}

export default AboutUs