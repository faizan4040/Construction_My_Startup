"use client";

import { TIER_ORDER, QUALITY_TIERS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TierToggle({ value, onChange, size = "md" }) {
  const isSm = size === "sm";
  const activeIndex = TIER_ORDER.indexOf(value);
  const count = TIER_ORDER.length;

  return (
    <div
      className={cn(
        // Track height stays explicit so every cell has a real row height
        // to fill. Width is now wide enough that "Premium" (the longest
        // label) never gets squeezed — that squeeze is what was clipping
        // the text, not hover itself.
        "relative grid shrink-0 rounded-full bg-cream-dark p-1",
        isSm ? "h-8 w-[216px]" : "h-10 w-[288px]"
      )}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      <div
        className="absolute top-1 bottom-1 rounded-full bg-forest-600 shadow-md transition-transform duration-300 ease-out pointer-events-none"
        style={{
          width: `calc(${100 / count}% - 4px)`,
          transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 4}px))`,
          left: "2px",
        }}
      />
      {TIER_ORDER.map((key) => {
        const active = value === key;
        return (
          <Button
            key={key}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(key)}
            className={cn(
              // h-full + w-full fill the grid cell exactly; px-2 gives the
              // label real breathing room instead of touching the pill's
              // edge; whitespace-nowrap stops "Premium" from wrapping to a
              // second line and getting clipped by the fixed height.
              "relative z-10 h-full w-full min-w-0 rounded-full px-2 py-0 font-medium leading-none",
              "whitespace-nowrap overflow-visible",
              "transition-colors duration-200 hover:bg-transparent",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              isSm ? "text-xs" : "text-sm",
              active ? "text-white hover:text-white" : "text-ink/55 hover:text-ink"
            )}
          >
            {QUALITY_TIERS[key].label}
          </Button>
        );
      })}
    </div>
  );
}