'use client'

import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Info,
  Truck,
  CreditCard,
  RotateCcw,
  Tag,
  FileText,
  Star,
  Clock,
  Phone,
  Mail,
} from "lucide-react"
import Testimonial from '@/components/Website/Testimonial'

const categories = [
  { label: "Everything You Need To Know", icon: Info },
  { label: "Delivery", icon: Truck },
  { label: "Orders and Payments", icon: CreditCard },
  { label: "Returns and Refunds", icon: RotateCcw },
  { label: "Promotions", icon: Tag },
  { label: "Terms and Conditions", icon: FileText },
  { label: "Ultra Membership", icon: Star },
  { label: "Recently viewed articles", icon: Clock },
  { label: "Contact Us Via Phone", icon: Phone },
  { label: "Contact Us Via Web Form", icon: Mail },
]

const ContactUs = () => {
  const [activeCategory, setActiveCategory] = useState("Everything You Need To Know")

  return (
    <div className="w-full">
      {/* ---------- TOP BANNER ---------- */}
      <div className="bg-black text-white py-20 text-center">
        <h1 className="text-4xl lg:text-5xl font-extrabold">
          Can I Change Or Add To An Order?
        </h1>
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* ---------- LEFT SIDEBAR ---------- */}
        <aside className="lg:col-span-1 border-r pr-8 min-w-70">
          <h3 className="font-bold text-xl mb-6">Other Categories</h3>

          <ul className="space-y-4">
            {categories.map((item, index) => {
              const Icon = item.icon
              const isActive = activeCategory === item.label

              return (
                <li
                  key={index}
                  onClick={() => setActiveCategory(item.label)}
                  className={`flex items-center gap-3 cursor-pointer text-lg relative w-fit
                    after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-black
                    after:w-0 hover:after:w-full after:transition-all after:duration-300
                    ${isActive ? 'font-semibold after:w-full text-black' : 'text-gray-700'}
                  `}
                >
                  <Icon size={20} />
                  {item.label}
                </li>
              )
            })}
          </ul>
        </aside>

        {/* ---------- RIGHT CONTENT ---------- */}
        <section className="lg:col-span-3">
          <h2 className="text-3xl font-bold mb-6">
            {activeCategory}
          </h2>

          {/* SAME CONTENT – switches based on category */}
          {activeCategory === "Everything You Need To Know" && (
            <div className="space-y-5 text-gray-700 leading-relaxed">
              <p>
                We will do our best to make any changes to your order provided that it
                hasn't been packed.
              </p>

              <p>
                If you are contacting us outside of business hours please email us at{" "}
                <strong>customerservice@AllSpikes.com</strong> and mark your email
                subject as:
                <br />
                <strong>URGENT - CHANGE TO ORDER</strong>
              </p>

              <p>
                If you would like to give our friendly Customer Service team a call you
                can do so on:
                <br />
                <strong>+44 (0)1274 530 530</strong>
              </p>

              <div>
                <h4 className="font-semibold mt-6 mb-2">Our opening hours are:</h4>
                <p><strong>Monday – Friday</strong><br />9am – 5.30pm</p>
                <p className="mt-2"><strong>Saturdays</strong><br />9am – 4.45pm</p>
                <p className="mt-2"><strong>Sundays</strong><br />Closed</p>
              </div>

              <p>
                Outside of these hours you can leave a message on our answering machines
                and we'll get back to you as soon as we're back in the office.
              </p>

              <p className="italic">
                Please note: We are closed on UK bank holidays.
              </p>
            </div>
          )}

          {activeCategory !== "Everything You Need To Know" && (
            <p className="text-gray-700 text-lg">
              Content for <strong>{activeCategory}</strong> will appear here.
            </p>
          )}

          {/* ---------- RELATED QUESTIONS DROPDOWN ---------- */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-4">Related Questions</h3>

            <Accordion type="single" collapsible>
              {[
                "Can I Cancel My Order?",
                "Contact Us Via Live Chat",
                "How Do I Return From The UK?",
                "Contact Us Via Web Form",
                "Contact Us Via Phone",
              ].map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:underline">
                    {item}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Please contact our customer service team for further assistance regarding this topic.
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

      </div>
        <section>
            <Testimonial/>
        </section>
    </div>
  )
}

export default ContactUs
