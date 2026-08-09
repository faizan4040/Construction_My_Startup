'use client'

import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Truck, CornerUpLeft, Phone, MessageCircle, Clock } from "lucide-react"

/* ── Blueprint grid overlay ── */
const BlueprintGrid = ({ opacity = 0.08 }) => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      opacity,
      backgroundImage:
        'linear-gradient(#4A7A96 1px, transparent 1px), linear-gradient(90deg, #4A7A96 1px, transparent 1px)',
      backgroundSize: '36px 36px',
    }}
  />
)

/* ── Corner-bracket frame ── */
const CornerBrackets = ({ color = '#F97316' }) => (
  <>
    <span className="absolute -top-px -left-px h-5 w-5 border-t-2 border-l-2" style={{ borderColor: color }} />
    <span className="absolute -top-px -right-px h-5 w-5 border-t-2 border-r-2" style={{ borderColor: color }} />
    <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2" style={{ borderColor: color }} />
    <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2" style={{ borderColor: color }} />
  </>
)

const contactIcons = [Clock, Phone, Clock, MessageCircle, Clock]

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
    <div className="w-full bg-[#F5F3EF] text-[#14161A]">

      {/* ---------- HEADER ---------- */}
      <section className="relative bg-[#14161A] text-white py-20 overflow-hidden text-center">
        <BlueprintGrid />
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #F97316 0 14px, transparent 14px 28px)',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-[#F97316] text-xs font-mono uppercase tracking-[0.3em] mb-5">
            <Truck size={16} strokeWidth={2.5} />
            Shipping & Returns
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.05]">
            Delivery &amp; Returns
          </h1>
          <p className="text-[#C9CCD1] text-lg mt-4">
            See below information about the delivery &amp; returns options in your country
          </p>
        </div>
      </section>

      <main className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-14">
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-6 py-3 font-bold uppercase tracking-wide text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'delivery'
                ? 'bg-[#F97316] text-[#14161A]'
                : 'bg-white border border-black/10 text-[#3A3D42] hover:border-[#F97316] cursor-pointer'
            }`}
          >
            <Truck size={16} />
            Delivery
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`px-6 py-3 font-bold uppercase tracking-wide text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'returns'
                ? 'bg-[#14161A] text-white'
                : 'bg-white border border-black/10 text-[#3A3D42] hover:border-[#14161A] cursor-pointer'
            }`}
          >
            <CornerUpLeft size={16} />
            Returns
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left Accordion */}
          <div className="lg:col-span-2 relative bg-white border border-black/5 p-6 lg:p-10">
            <CornerBrackets />
            <span className="block text-[11px] font-mono uppercase tracking-[0.3em] text-[#F97316] mb-6">
              {activeTab === 'delivery' ? 'Delivery / Topics' : 'Returns / Topics'}
            </span>

            <Accordion type="single" collapsible>
              {data[activeTab].map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-black/10">
                  <AccordionTrigger className="text-xl lg:text-2xl font-extrabold tracking-tight text-[#14161A] hover:text-[#F97316] hover:no-underline">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#3A3D42] text-lg mt-2 leading-relaxed">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Right Contact */}
          <div className="relative bg-[#14161A] text-white p-8 h-fit lg:sticky lg:top-8 overflow-hidden">
            <BlueprintGrid opacity={0.06} />
            <div className="relative">
              <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#F97316]">Site Contact</span>
              <h3 className="text-xl font-extrabold tracking-tight mt-2 mb-6">Contact Us</h3>

              <div className="space-y-5">
                {contactInfo.map((line, index) => {
                  const Icon = contactIcons[index]
                  const isEmphasis = index % 2 === 1
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <Icon size={16} className="text-[#F97316] mt-1 shrink-0" />
                      <p className={`text-[#C9CCD1] leading-relaxed ${isEmphasis ? 'font-semibold text-white' : ''}`}>
                        {line}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DeliveryReturns