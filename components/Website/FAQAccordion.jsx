"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQS } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div>
      <h3 className="text-2xl font-display font-semibold text-ink mb-4">
        Frequently Asked Questions
      </h3>
      <div className="divide-y divide-black/5">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-4 text-left group"
                aria-expanded={open}
              >
                <span className="font-medium text-ink group-hover:text-forest-700 transition-colors">
                  {item.q}
                </span>
                <span
                  className={cn(
                    "shrink-0 w-7 h-7 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center transition-transform duration-300",
                    open && "rotate-45 bg-forest-600 text-white"
                  )}
                >
                  <Plus size={15} strokeWidth={2.5} />
                </span>
              </button>
              {open && (
                <p className="text-sm text-ink/60 pb-4 pr-10 leading-relaxed animate-[fadeIn_0.2s_ease-out]">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}