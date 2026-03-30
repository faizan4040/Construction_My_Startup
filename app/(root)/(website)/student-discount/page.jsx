'use client'

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { IMAGES } from '@/routes/AllImages'

const faqs = [
  {
    title: 'How do I get my student discount?',
    content:
      'Simply sign in with Student Beans or UNiDAYS to verify your student status. Once verified, you will receive a single-use promo code.'
  },
  {
    title: 'Can I receive a discount as a graduate?',
    content:
      'Graduate discounts are subject to the terms of Student Beans and UNiDAYS. Please check directly with the platform.'
  },
  {
    title: 'What student discount does AllSpikes.com offer?',
    content:
      'We currently offer 12% off to verified students on selected products.'
  },
  {
    title: 'How often can I use my student discount code?',
    content:
      'Each promo code is single-use. You must re-verify to receive a new code.'
  },
  {
    title: 'How often can I receive a new promotion code?',
    content:
      'New codes are issued based on Student Beans or UNiDAYS eligibility rules.'
  },
  {
    title: 'Why does my student discount code not work?',
    content:
      'Some items and brands may be excluded. Ensure the code is unused and applied correctly.'
  },
  {
    title: 'Are there any items or brands excluded from the student discount?',
    content:
      'We are currently offering 12% off our AW25 collection. Selected items may be excluded. Maurten, Garmin, and COROS items are excluded. Sale items are excluded. Please see UNiDAYS or Student Beans terms for full details.'
  },
]

const StudentDiscount = () => {
  return (
    <div className="w-full">

      {/* ===== Banner ===== */}
      <section className="relative h-[70vh] flex items-center">
        <img
          src={IMAGES.student_discount}
          alt="Student Discount"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* <div className="absolute inset-0 bg-black/60" /> */}

        {/* <div className="relative z-10 text-white px-6 lg:px-24 w-full">
          <h1 className="text-4xl lg:text-5xl font-extrabold">
            Student Discount
          </h1>
        </div> */}
      </section>

      {/* ===== Breadcrumb ===== */}
      <div className="px-6 lg:px-24 py-6 text-sm text-gray-600">
        Home / <span className="text-black font-medium">Students</span>
      </div>

      {/* ===== Intro Section ===== */}
      <section className="px-6 lg:px-24 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left */}
          <div>
            <h2 className="text-7xl mb-4 font-sans">
              Welcome to the All Spikes Students Discount Page
            </h2>
          </div>

          {/* Right */}
          <div className="text-gray-700 space-y-4">
            <p>
              <strong>AllSpikes.com</strong> are offering <strong>12% off</strong> our
              newest season to verified students – simply sign in with either
              Student Beans or UNiDAYS and start saving!
            </p>

            <p>
              Join or sign in to one of our student discount programmes to verify
              your student status today. Once verified, you'll receive a
              single-use promo code to unlock your discount.
            </p>
          </div>

        </div>
      </section>

      {/* ===== Student Cards ===== */}
      <section className="px-6 lg:px-24 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">

          {/* Student Beans */}
        <div
          className="group rounded-2xl p-20 min-h-80 text-center
          bg-linear-to-br from-purple-600 via-purple-700 to-purple-900
          text-white shadow-lg hover:shadow-2xl transition duration-300
          flex flex-col items-center justify-center gap-8 cursor-pointer"
        >
          <span
            className="text-4xl lg:text-5xl font-extrabold tracking-wide
            transition-all duration-300
            group-hover:scale-105
            group-hover:tracking-widest
            group-hover:text-purple-200
            drop-shadow-md cursor-pointer"
          >
            Student Beans
          </span>

          <button
            className="px-8 py-3 bg-white text-purple-700 rounded-lg
            font-semibold hover:bg-gray-100 transition cursor-pointer"
          >
            Join / Sign Up
          </button>
        </div>



          {/* UNiDAYS */}
          <div
          className="group rounded-2xl p-20 min-h-80 text-center
          bg-linear-to-br from-green-600 via-green-700 to-green-900
          text-white shadow-lg hover:shadow-2xl transition duration-300
          flex flex-col items-center justify-center gap-8 cursor-pointer"
        >
          <span
            className="text-4xl lg:text-5xl font-extrabold tracking-wide
            transition-all duration-300
            group-hover:scale-105
            group-hover:tracking-widest
            group-hover:text-green-200
            drop-shadow-md cursor-pointer"
          >
            UNiDAYS
          </span>

          <button
            className="px-8 py-3 bg-white text-green-700 rounded-lg
            font-semibold hover:bg-gray-100 transition cursor-pointer"
          >
            Join / Sign Up
          </button>
        </div>


        </div>
      </section>

      {/* ===== FAQs ===== */}
      <section className="px-6 lg:px-24 pb-20 max-w-5xl mx-auto">
        <h3 className="text-3xl font-bold mb-8 text-center">
          FAQs
        </h3>

        <Accordion type="single" collapsible>
          {faqs.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="font-sans text-xl lg:text-2xl font-bold cursor-pointer">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-lg mt-2 font-sans">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>


      {/* ===== Student Discount Terms ===== */}
    <section className="w-full bg-gray-100 py-12 px-6">
      <div >
        <p className="text-gray-700 leading-relaxed text-center">
          We are currently offering <strong>12% off</strong> our AW25 collection.
          Selected items might be excluded from this promotion, as indicated on our
          product pages. <strong>Maurten, Garmin and COROS</strong> items are excluded
          from this promotion. Sale-items are excluded from this promotion.
          <br /><br />
          Please see the <strong>UNiDAYS</strong> or <strong>StudentBeans</strong> terms
          and conditions for further details.
        </p>
      </div>
    </section>



    </div>
  )
}

export default StudentDiscount
