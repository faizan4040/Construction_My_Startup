'use client'

import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Truck, CornerUpLeft } from "lucide-react";



const DeliveryReturns = () => {
  const [activeTab, setActiveTab] = useState('delivery')

  const data = {
    delivery: [
      { title: 'United Kingdom Shipping Options', content: 'Details about UK Shipping options...' },
      { title: 'Orders Delayed / Missing In Transit', content: 'Information on delayed or missing orders.' },
      { title: 'Local And Import Taxes', content: 'Local and import tax details.' },
      { title: 'Norway Customs And Import Taxes', content: 'Customs info for Norway.' },
      { title: 'Shipping Calculator', content: 'Use our shipping calculator to estimate costs.' },
    ],
    returns: [
      { title: 'Introducing our express exchange service', content: 'We offer fast exchange services.' },
      { title: 'Our Return Policy', content: 'Details about return policy.' },
      { title: 'Return Demo', content: 'How to process returns.' },
      { title: 'Vitality Returns', content: 'Vitality specific return info.' },
      { title: 'Return Instructions', content: 'Step by step instructions.' },
      { title: 'Exchanges', content: 'How to exchange items.' },
      { title: 'Bundles / Free Gift Returns', content: 'Return rules for bundles and gifts.' },
      { title: 'Refunds', content: 'Refund process.' },
      { title: 'Faulty Items', content: 'Procedure for faulty items.' },
      { title: 'Cancellations', content: 'How to cancel orders.' },
    ],
  }

  const contactInfo = [
    "We're available from 9am–5:30pm, Monday to Friday to help with your order and product questions.",
    '+44 (0)1274 530 530',
    'Monday - Friday: 9:00 - 17:30',
    'Chat with us',
    'Monday - Friday: 9:00 - 17:30',
  ]

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
        {/* Top Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900">
            Delivery & Returns
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl mt-2">
            See below information about the delivery & returns options in your country
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'delivery'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 cursor-pointer'
          }`}
        >
          <Truck size={16} /> {/* Delivery icon */}
          Delivery
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'returns'
              ? 'bg-black text-white'
              : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 cursor-pointer'
          }`}
        >
          <CornerUpLeft size={16} /> {/* Returns icon */}
          Returns
        </button>
      </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Accordion */}
          <div className="lg:col-span-2 space-y-4">
            <Accordion type="single" collapsible>
              {data[activeTab].map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-2xl lg:text-3xl font-bold">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 text-lg mt-2">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Right Contact */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Contact Us</h3>
            {contactInfo.map((line, index) => (
              <p key={index} className={`text-gray-700 ${index % 2 === 1 ? 'font-medium' : ''}`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DeliveryReturns
