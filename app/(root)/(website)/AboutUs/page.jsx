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
          alt="About Sports Fitness"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 text-white">
            <h1 className="text-6xl lg:text-5xl font-extrabold leading-tight">
              ABOUT US
            </h1>
          </div>
        </div>
      </section>

      {/* ---------- WHO ARE WE ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
            <h2 className="text-5xl mb-4 font-sans">
             We are the UK’s no. 1 online retailer for run, gym and hike.
            </h2>
          </div>

        <p className="rounded-2xl  w-full ">
            Our mission is to help our customers to lead a happier 
            and healthier life through running and fitness, 
            and to help you make the best product choices 
            to achieve your fitness goals.
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
            We are the UK’s no. 1 online retailer for run, gym and hike.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed">
            Our mission is to help our customers to lead a happier and healthier
            life through running and fitness, and to help you make the best product
            choices to achieve your fitness goals.
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
            <h2 className="text-2xl font-bold mb-4">Our history</h2>

            <p className="text-gray-700 text-lg mb-4 leading-relaxed">
            Founded by professional footballer Bruce Bannister, All Spikes
            Unlimited opened its doors in 1982 – the first sports store of its kind
            we might add, providing purely technical sports gear for sports people.
            We’ve been trendsetters for a long time now.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed">
            Today we are All Spikes.com, with the UK’s widest, yet most carefully
            curated product range and millions of loyal customers.
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
              We live running and fitness and with over 30 years of 
              expertise we work hard to deliver industry leading 
              expert advice and support to help you make the best 
              product choices. From the UK’s only free online gait
               analysis, to our shoe and jacket finders, live chat 
               expert advice as well as our Running, Trail and
                Training advice hubs, we’re on hand now to help 
                you find your perfect product.
            </p>
          </div>

          <img
            src={IMAGES.expert}
            alt="Experts"
            className="rounded-2xl shadow-xl w-full object-cover"
          />
        </div>
      </section>

      {/* ---------- PRODUCTS + AWARDS ---------- */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* ---------- CARD 1 : WHO ARE WE ---------- */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <img
                src={IMAGES.product}
                alt="Who are we"
                className="w-full h-64 object-cover"
            />

            <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">Over 12,000 products</h2>

                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                With over 12,000 run, gym and hike products online, we have the right 
                product for you – and it’s our role to help you find it. 
                We are proud to share the most comprehensive, most detailed 
                product knowledge in the industry with you - and from video 
                guides to live expert advice, we’re here to help you to make
                 the most informed choices possible.
                </p>

                
            </div>
            </div>

            {/* ---------- CARD 2 : OUR HISTORY ---------- */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <img
                src={IMAGES.winning}
                alt="Our history"
                className="w-full h-64 object-cover"
            />

            <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">Award-winning</h2>

                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                    We are incredibly proud to be listed as one of the 
                    London Stock Exchange’s Companies to Inspire Britain,
                    as well as being awarded a prestigious Feefo Gold Award 
                    for excellence in customer service. We’re also very proud
                    to have been voted Best Online Retailer by the public at
                    the Running Awards in 2017. We never stop working tirelessly
                    to make our customer experience better and better and whatever
                    your fitness goal, we are here to help every step of the way.
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
              Leave no footprints
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We believe that there’s no fun to be had standing still. But we know that moving leaves footprints. So we are working in a number of ways to reduce our footprints. We are learning. We are discovering what we don’t know and finding somethings are really complex with no clear answer.
              We are in it for the long-haul. This is a marathon, not a sprint.
            </p>
            
          </div>

          <img
            src={IMAGES.footprints}
            alt="Sustainability"
            className="rounded-2xl shadow-xl w-full object-cover"
          />
        </div>
      </section>

    </div>
  )
}

export default AboutUs
