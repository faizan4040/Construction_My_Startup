"use client";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    title: "Always great service",
    text:
      "Easy to order and shoes at a great price. Delivery spot on and love the shoes.",
    author: "Michelle J Davies",
    time: "14 hours ago",
  },
  {
    title: "Quick and helpful support chat",
    text:
      "Issue with size of shoe ordered and wanted support on exchange.",
    author: "Robert Kircher-Smith",
    time: "14 hours ago",
  },
  {
    title: "Quick and efficient",
    text:
      "Quick and efficient delivery. Considerably cheaper than the manufacturer’s own.",
    author: "Rachel",
    time: "14 hours ago",
  },
  {
    title: "Great customer service",
    text:
      "Orders always come quickly. Had a recent experience that was better than most.",
    author: "CW",
    time: "15 hours ago",
  },
  {
    title: "Great customer service",
    text:
      "Orders always come quickly. Had a recent experience that was better than most.",
    author: "CW",
    time: "15 hours ago",
  },
  {
    title: "Great customer service",
    text:
      "Orders always come quickly. Had a recent experience that was better than most.",
    author: "CW",
    time: "15 hours ago",
  },
];

const Testimonial = () => {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    sliderRef.current.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    sliderRef.current.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-20">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            What our customers say
          </h2>

          <div className="flex gap-3">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar"
        >
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="
                min-w-70 sm:min-w-85
                bg-white
                rounded-2xl
                p-6
                shadow-sm
                hover:shadow-md
                transition
              "
            >
              {/* STARS */}
              <div className="text-green-600 font-semibold mb-2">
                ★★★★★ <span className="text-xs text-gray-500 ml-1">Verified</span>
              </div>

              <h4 className="font-semibold mb-2">{item.title}</h4>

              <p className="text-gray-600 text-sm mb-4">
                {item.text}
              </p>

              <p className="text-xs text-gray-500">
                {item.author}, {item.time}
              </p>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-600">
            Rated <span className="font-semibold">4.5/5</span> based on{" "}
            <span className="font-semibold">97,234 reviews</span>.  
            Showing our 5-star reviews.
          </p>

         
        </div>

      </div>
    </section>
  );
};

export default Testimonial;
