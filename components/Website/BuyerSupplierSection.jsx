"use client"

import React, { useState } from "react"
import {
  FaRupeeSign,
  FaHandshake,
  FaGlobe,
  FaBoxes,
  FaChartLine,
  FaMoneyBillWave,
  FaLayerGroup,
  FaTruck,
} from "react-icons/fa"

const BuyerSupplierSection = () => {
  const [activeTab, setActiveTab] = useState("buyer")

  const buyerData = [
    {
      title: "Get Lowest Price",
      desc: "Get rates lower than the existing market prices",
      icon: <FaRupeeSign />,
    },
    {
      title: "Get Credit",
      desc: "No need to worry about working capital",
      icon: <FaHandshake />,
    },
    {
      title: "Pan India & Global",
      desc: "Access services across India and globally",
      icon: <FaGlobe />,
    },
    {
      title: "Multiple Services",
      desc: "All construction services in one place",
      icon: <FaBoxes />,
    },
  ]

  const supplierData = [
    {
      title: "Grow Your Business",
      desc: "Reach more customers and increase earnings",
      icon: <FaChartLine />,
    },
    {
      title: "Advance Payments",
      desc: "Get paid quickly without delays",
      icon: <FaMoneyBillWave />,
    },
    {
      title: "High Order Volume",
      desc: "Get regular and bulk work opportunities",
      icon: <FaLayerGroup />,
    },
    {
      title: "Full Support",
      desc: "We manage logistics and support your work",
      icon: <FaTruck />,
    },
  ]

  const data = activeTab === "buyer" ? buyerData : supplierData

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">

        {/* TITLE */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          {activeTab === "buyer"
            ? "Why Buyers Choose Us"
            : "Why Suppliers Choose Us"}
        </h2>

        {/* TOGGLE */}
        <div className="flex justify-center mb-14">
          <div className="flex bg-white shadow-lg rounded-full p-1 border">
            <button
              onClick={() => setActiveTab("buyer")}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeTab === "buyer"
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Buyer
            </button>

            <button
              onClick={() => setActiveTab("supplier")}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeTab === "supplier"
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Supplier
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.map((item, index) => (
            <div
              key={index}
              className="
                group
                bg-white
                rounded-2xl
                p-6
                shadow-md
                hover:shadow-2xl
                transition-all
                duration-300
                border
                hover:-translate-y-2
              "
            >
              {/* ICON */}
              <div
                className="
                  w-14 h-14
                  flex items-center justify-center
                  rounded-xl
                  bg-black text-white text-xl
                  mb-4
                  group-hover:bg-orange-500
                  transition
                "
              >
                {item.icon}
              </div>

              {/* TITLE */}
              <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-500 transition">
                {item.title}
              </h3>

              {/* DESC */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default BuyerSupplierSection