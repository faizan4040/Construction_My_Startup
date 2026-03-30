import React from "react"
import Link from "next/link"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const shopLinks = [
  { label: "Men's Running Shoes",           gender: "men",   category: "running-shoes"  },
  { label: "Women's Running Shoes",         gender: "women", category: "running-shoes"  },
  { label: "Men's Walking Shoes & Boots",   gender: "men",   category: "walking-shoes"  },
  { label: "Women's Walking Shoes & Boots", gender: "women", category: "walking-shoes"  },
  { label: "Men's Trail Running Shoes",     gender: "men",   category: "trail-running"  },
  { label: "Women's Trail Running Shoes",   gender: "women", category: "trail-running"  },
]

const ProductInfo = () => {
  return (
    <section className="w-full py-1">
      <div
        className="
          max-w-7xl
          mx-auto
          px-4 sm:px-8 lg:px-20
          grid grid-cols-1 lg:grid-cols-2
          gap-10 lg:gap-52
          items-start
        "
      >
        {/* LEFT CONTENT */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 lg:text-lg">
            Lace up for your next adventure
            <p className="text-gray-700 leading-relaxed mb-5">
              Lace up for your next adventure with{" "}
              <span className="font-semibold">All Spikes.com</span> – India's #1
              performance destination.
            </p>
          </h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            Whether you're chasing a PB on the road, pushing your limits on the
            track, or tackling rugged trails, we're here to power every step of your
            journey. With 40 years of expertise and over 15,000 products, we bring
            you the latest innovations from the world's biggest sports brands.
          </p>

          <p className="text-gray-700 leading-relaxed mb-5">
            From cutting-edge men's and women's running shoes to high-tech hiking
            boots, lightweight walking shoes, performance apparel and essential
            outdoor gear, we've got everything you need to go faster, further and
            stronger.
          </p>

          <p className="text-gray-700 leading-relaxed mb-5">
            But we're not just here to sell gear — we're here to inspire. That's why
            we partner with elite athletes, coaches, and gear experts to bring you
            training tips, in-depth reviews, and 1,000+ expert articles.
          </p>

          <p className="text-gray-700 leading-relaxed">
            We are here to support every step of your journey — the early mornings,
            late nights, long miles and relentless dedication. No shortcuts, no
            hacks — just grit, passion and the greatest gear on the market.
          </p>
        </div>

        {/* RIGHT LINKS */}
        <div className="flex flex-col gap-10 text-2xl font-medium lg:pt-12">
          {shopLinks.map((item, index) => (
            <Link
              key={index}
              // builds: /shop?gender=men&category=running-shoes
              href={`${WEBSITE_SHOP}?gender=${item.gender}&category=${item.category}`}
              className="
                w-fit
                relative
                cursor-pointer
                after:absolute
                after:left-0
                after:-bottom-1
                after:h-0.5
                after:w-0
                after:bg-black
                after:transition-all
                after:duration-300
                hover:after:w-full
              "
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductInfo