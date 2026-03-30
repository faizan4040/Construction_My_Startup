
import React from "react"
import Link from "next/link"
import { IMAGES } from "../../../../routes/AllImages"


export const metadata = {
  title: "Order Tracking | Track Your Order Status",
  description:
    "Track your order easily using your email address, order ID, and delivery postcode. Get real-time delivery updates.",
  keywords: [
    "order tracking",
    "track order",
    "delivery tracking",
    "order status",
    "shipping status",
  ],
  openGraph: {
    title: "Order Tracking | Track Your Order",
    description:
      "Track your order status using order ID, email, and postcode. Fast and reliable order tracking.",
    url: "https://yourwebsite.com/order-tracking",
    siteName: "All Spikes",
    images: [
      {
        url: "https://yourwebsite.com/images/order-tracking.jpg",
        width: 1200,
        height: 630,
        alt: "Order Tracking",
      },
    ],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const OrderTracking = () => {
  return (
<main className="min-h-screen bg-gray-50">
  <div className="lg:grid lg:grid-cols-2 min-h-screen">
    {/* Left: Form */}
    <div className="flex flex-col justify-center px-6 lg:px-24 py-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900 transition">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Order Tracking</span>
      </nav>

      <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
        Delivery Information Order Tracking
      </h1>
      <p className="text-gray-600 text-lg lg:text-xl mb-8">
        Track your order quickly and easily by entering your details below.
      </p>

      <form className="space-y-5 w-full max-w-md" aria-label="Order Tracking Form">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Email Address*
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Order ID*
          </label>
          <input
            type="text"
            placeholder="Enter your Order ID"
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Delivery Postcode / Zip Code*
          </label>
          <input
            type="text"
            placeholder="Enter your postcode"
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black hover:bg-orange-500 cursor-pointer text-white font-semibold py-3 rounded-lg transition"
        >
          Track Order
        </button>
      </form>
    </div>

    {/* Right: Full-height Image */}
    <div className="relative hidden lg:block h-screen">
      <img
        src={IMAGES.ordertrackingposter}
        alt="Order tracking illustration"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  </div>
</main>

  )
}

export default OrderTracking


