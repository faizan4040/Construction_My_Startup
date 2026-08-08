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
  LifeBuoy,
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

const ContactUs = () => {
  const [activeCategory, setActiveCategory] = useState("Everything You Need To Know")

  return (
    <div className="w-full bg-[#F5F3EF] text-[#14161A]">

      {/* ---------- TOP BANNER ---------- */}
      <div className="relative bg-[#14161A] text-white py-20 text-center overflow-hidden">
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
            <LifeBuoy size={16} strokeWidth={2.5} />
            Help Center
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.05]">
            Can I Change Or Add To An Order?
          </h1>
        </div>
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* ---------- LEFT SIDEBAR ---------- */}
        <aside className="lg:col-span-1 min-w-70">
          <div className="lg:sticky lg:top-8">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#9098A0] mb-6">
              Other Categories
            </h3>

            <ul className="space-y-1">
              {categories.map((item, index) => {
                const Icon = item.icon
                const isActive = activeCategory === item.label

                return (
                  <li key={index}>
                    <button
                      onClick={() => setActiveCategory(item.label)}
                      className={`w-full flex items-center gap-3 text-left py-2.5 pl-4 border-l-2 transition-colors duration-200
                        ${isActive
                          ? 'border-[#F97316] bg-[#F97316]/10 text-[#14161A] font-semibold'
                          : 'border-transparent text-[#6C7278] hover:text-[#14161A] hover:border-[#D8D4CC]'
                        }
                      `}
                    >
                      <Icon size={18} className={isActive ? 'text-[#F97316]' : 'text-[#9098A0]'} />
                      <span className="text-[15px] leading-snug">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* ---------- RIGHT CONTENT ---------- */}
        <section className="lg:col-span-3 relative bg-white border border-black/5 p-8 lg:p-12">
          <CornerBrackets />

          <h2 className="text-3xl font-extrabold mb-6 tracking-tight">
            {activeCategory}
          </h2>

          {/* SAME CONTENT – switches based on category */}
          {activeCategory === "Everything You Need To Know" && (
            <div className="space-y-5 text-[#3A3D42] leading-relaxed">
              <p>
                We will do our best to make any changes to your order provided that it
                hasn't been packed.
              </p>

              <p>
                If you are contacting us outside of business hours please email us at{" "}
                <strong className="text-[#14161A] font-semibold">customerservice@AllSpikes.com</strong> and mark your email
                subject as:
                <br />
                <strong className="text-[#14161A] font-semibold">URGENT - CHANGE TO ORDER</strong>
              </p>

              <p>
                If you would like to give our friendly Customer Service team a call you
                can do so on:
                <br />
                <strong className="text-[#14161A] font-semibold">+44 (0)1274 530 530</strong>
              </p>

              <div className="border-l-2 border-[#F97316] pl-6">
                <h4 className="font-semibold mt-1 mb-2 text-[#14161A] uppercase tracking-wide text-sm">Our opening hours are:</h4>
                <p><strong className="text-[#14161A]">Monday – Friday</strong><br />9am – 5.30pm</p>
                <p className="mt-2"><strong className="text-[#14161A]">Saturdays</strong><br />9am – 4.45pm</p>
                <p className="mt-2"><strong className="text-[#14161A]">Sundays</strong><br />Closed</p>
              </div>

              <p>
                Outside of these hours you can leave a message on our answering machines
                and we'll get back to you as soon as we're back in the office.
              </p>

              <p className="italic text-[#6C7278]">
                Please note: We are closed on UK bank holidays.
              </p>
            </div>
          )}

          {activeCategory !== "Everything You Need To Know" && (
            <p className="text-[#3A3D42] text-lg">
              Content for <strong className="text-[#14161A] font-semibold">{activeCategory}</strong> will appear here.
            </p>
          )}

          {/* ---------- RELATED QUESTIONS DROPDOWN ---------- */}
          <div className="mt-12 pt-10 border-t border-black/10">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#F97316]">FAQ</span>
            <h3 className="text-2xl font-extrabold mb-4 mt-2 tracking-tight">Related Questions</h3>

            <Accordion type="single" collapsible>
              {[
                "Can I Cancel My Order?",
                "Contact Us Via Live Chat",
                "How Do I Return From The UK?",
                "Contact Us Via Web Form",
                "Contact Us Via Phone",
              ].map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-black/10">
                  <AccordionTrigger className="text-lg font-semibold text-[#14161A] hover:text-[#F97316] hover:no-underline">
                    {item}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6C7278]">
                    Please contact our customer service team for further assistance regarding this topic.
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

      </div>

      <section className="bg-white border-t border-black/5">
        <Testimonial/>
      </section>
    </div>
  )
}

export default ContactUs