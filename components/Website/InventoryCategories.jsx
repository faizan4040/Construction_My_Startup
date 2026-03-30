"use client"

import React from "react"
import {
  Hammer,
  Building2,
  Truck,
  Wrench,
  HardHat,
  Factory,
} from "lucide-react"

const categories = [
  { name: "Raw Materials", icon: Hammer },
  { name: "Machinery", icon: Factory },
  { name: "Transport", icon: Truck },
  { name: "Workers", icon: HardHat },
  { name: "Structure Core", icon: Building2 },
  { name: "Power Grid", icon: Wrench },
]

const InventoryCategories = () => {
  return (
    <div className="relative w-full flex justify-center -mt-16 px-4 z-20">

      {/* CONTAINER */}
      <div className="
        w-full max-w-6xl
        bg-white/80 backdrop-blur-lg
        rounded-2xl
        shadow-[0_10px_40px_rgba(0,0,0,0.15)]
        border border-gray-200
        p-4
      ">

        {/* SCROLL ROW */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">

          {categories.map((cat, i) => {
            const Icon = cat.icon

            return (
              <div
                key={i}
                className="
                  min-w-35
                  flex flex-col items-center justify-center
                  bg-white
                  rounded-xl
                  px-4 py-5
                  border border-gray-200
                  shadow-sm
                  hover:shadow-md
                  transition-all duration-300
                  cursor-pointer
                  group
                "
              >
                {/* ICON */}
                <div className="
                  w-10 h-10
                  flex items-center justify-center
                  rounded-full
                  bg-yellow-100
                  text-yellow-600
                  group-hover:bg-yellow-500 group-hover:text-white
                  transition-all
                ">
                  <Icon size={20} />
                </div>

                {/* TITLE */}
                <p className="mt-3 text-sm font-medium text-gray-700 text-center">
                  {cat.name}
                </p>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}

export default InventoryCategories