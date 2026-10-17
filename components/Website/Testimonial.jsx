"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, BadgeCheck } from "lucide-react";

const testimonials = [
  {
    title: "Always great service",
    text: "Easy to order and shoes at a great price. Delivery spot on and love the shoes.",
    author: "Michelle J Davies",
    time: "14 hours ago",
  },
  {
    title: "Quick and helpful support chat",
    text: "Issue with size of shoe ordered and wanted support on exchange.",
    author: "Robert Kircher-Smith",
    time: "14 hours ago",
  },
  {
    title: "Quick and efficient",
    text: "Quick and efficient delivery. Considerably cheaper than the manufacturer’s own.",
    author: "Rachel",
    time: "14 hours ago",
  },
  {
    title: "Great customer service",
    text: "Orders always come quickly. Had a recent experience that was better than most.",
    author: "CW",
    time: "15 hours ago",
  },
  {
    title: "Great customer service",
    text: "Orders always come quickly. Had a recent experience that was better than most.",
    author: "CW",
    time: "15 hours ago",
  },
  {
    title: "Great customer service",
    text: "Orders always come quickly. Had a recent experience that was better than most.",
    author: "CW",
    time: "15 hours ago",
  },
];

const AVATAR_GRADIENTS = [
  "from-orange-500 to-amber-500",
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-indigo-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-sky-500",
];

const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const Stars = ({ size = 16 }) => (
  <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={size} className="fill-amber-400 text-amber-400" />
    ))}
  </div>
);

const Testimonial = () => {
  const sliderRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [progress, setProgress] = useState(0);

  const updateState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
    setProgress(max > 0 ? el.scrollLeft / max : 1);
  }, []);

  useEffect(() => {
    updateState();
    const el = sliderRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [updateState]);

  const scrollByCard = (direction) => {
    const el = sliderRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 24 : 350;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section className="relative w-full overflow-hidden bg-linear-to-b from-white via-gray-50 to-orange-50/40 py-16 sm:py-24">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-amber-300/25 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-4">
              <Quote size={12} className="fill-orange-500" />
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              What our{" "}
              <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                customers
              </span>{" "}
              say
            </h2>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-6">
            {/* rating summary */}
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-900/5 px-5 py-3">
              <p className="text-4xl font-extrabold text-gray-900 leading-none">
                4.5
                <span className="text-lg font-semibold text-gray-400">/5</span>
              </p>
              <div>
                <Stars size={15} />
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold text-gray-800">97,234</span> reviews
                </p>
              </div>
            </div>

            {/* arrows */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canLeft}
                aria-label="Previous reviews"
                className="w-12 h-12 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 disabled:hover:shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canRight}
                aria-label="Next reviews"
                className="w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((item, index) => (
            <article
              key={index}
              className="group relative w-72.5 sm:w-90 shrink-0 snap-start"
            >
              <div className="relative h-full flex flex-col rounded-3xl bg-white border border-gray-100 p-7 shadow-lg shadow-gray-900/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-orange-500/10 group-hover:border-orange-200 overflow-hidden">
                {/* top accent */}
                <span className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-orange-500 to-amber-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                {/* big quote mark */}
                <Quote
                  size={70}
                  className="absolute -top-1 right-4 text-gray-900/5 group-hover:text-orange-500/15 transition-colors duration-500 fill-current"
                />

                <div className="flex items-center justify-between mb-5">
                  <Stars />
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                    <BadgeCheck size={13} />
                    Verified
                  </span>
                </div>

                <h4 className="text-lg font-bold text-gray-900 mb-2.5 group-hover:text-orange-600 transition-colors duration-300">
                  {item.title}
                </h4>

                <p className="text-gray-600 text-[15px] leading-relaxed flex-1">
                  {item.text}
                </p>

                {/* author */}
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                  <span
                    className={`w-11 h-11 rounded-full bg-linear-to-br ${
                      AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
                    } text-white text-sm font-bold flex items-center justify-center shadow-md shrink-0`}
                  >
                    {getInitials(item.author)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.author}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* PROGRESS + FOOTER */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            Rated <span className="font-semibold text-gray-900">4.5/5</span> based on{" "}
            <span className="font-semibold text-gray-900">97,234 reviews</span>. Showing our
            5-star reviews.
          </p>

          <div className="w-full sm:w-48 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-orange-500 to-amber-400 transition-[width] duration-200"
              style={{ width: `${Math.max(progress * 100, 12)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;