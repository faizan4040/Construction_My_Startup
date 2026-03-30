import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_HOME } from "@/routes/WebsiteRoute"
import Link from "next/link"
import React from "react"

const WebsiteBreadcrumb = ({ title, links = [] }) => {
  return (
    <div
      className="relative h-55 sm:h-65 md:h-100 bg-cover bg-center"
      style={{
        backgroundImage: `url(${IMAGES.shopbanner})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-center">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
          {title}
        </h1>

        <ul className="flex items-center gap-2 text-sm text-white">
          <li>
            <Link
              href={WEBSITE_HOME}
              className="font-semibold hover:underline"
            >
              Home
            </Link>
          </li>

          {links.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span>/</span>
              {item.href ? (
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-200">{item.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default WebsiteBreadcrumb
