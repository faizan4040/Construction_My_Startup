"use client";

import { useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import TierToggle from "./TierToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINR, formatNumber } from "@/lib/calculate";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "delivers", label: "HomeRun delivers" },
];

export default function ResourceTable({ rows, onRowTierChange, onBuyNow, areaSqFt }) {
  const [filter, setFilter] = useState("all"); // "all" | "delivers"

  const visibleRows = filter === "delivers" ? rows.filter((r) => r.delivers) : rows;
  const activeIndex = FILTERS.findIndex((f) => f.value === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-xl font-display font-semibold text-ink">Resource allocation</h3>
          <p className="text-sm text-ink/45">Tap quality to retune any row</p>
        </div>

        {/* Filter toggle — equal-width segments with a sliding active pill */}
        <div
          className="relative grid rounded-full bg-cream-dark p-1 text-sm w-full sm:w-auto"
          style={{ gridTemplateColumns: `repeat(${FILTERS.length}, minmax(0, 1fr))` }}
        >
          <div
            className="absolute top-1 bottom-1 rounded-full bg-ink shadow-md transition-transform duration-300 ease-out"
            style={{
              width: `calc(${100 / FILTERS.length}% - 4px)`,
              transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 4}px))`,
              left: "2px",
            }}
          />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "relative z-10 h-8 px-4 rounded-full font-medium whitespace-nowrap transition-colors duration-200",
                filter === f.value ? "text-white" : "text-ink/55 hover:text-ink"
              )}
            >
              {f.value === "all" ? `All (${rows.length})` : f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-black/5">
        {visibleRows.map((row) => {
          const qtyLabel = row.displayQtyAsArea
            ? `${formatNumber(areaSqFt)} sq ft`
            : `${formatNumber(row.qty, row.qty < 10 ? 2 : 0)} ${row.unit}`;
          const Icon = row.icon;

          const iconBox = (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${row.color}22, ${row.color}0d)` }}
            >
              <Icon size={19} style={{ color: row.color }} strokeWidth={2} />
            </div>
          );

          const nameBlock = (
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-ink">{row.name}</span>
                {row.delivers && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                    <Zap size={10} className="fill-forest-600" /> 60-min
                  </span>
                )}
              </div>
              <div className="text-xs text-ink/45 mt-0.5 truncate">
                {qtyLabel} · {row.spec}
              </div>
            </div>
          );

          const buyControl = row.delivers ? (
            <Button
              size="sm"
              onClick={() => onBuyNow(row)}
              className="rounded-full bg-forest-600 hover:bg-forest-700 text-white gap-1.5 shadow-sm hover:shadow-md transition-all duration-150 active:scale-95 whitespace-nowrap"
            >
              <ShoppingCart size={13} />
              Buy Now
            </Button>
          ) : (
            <span className="text-xs text-ink/30 whitespace-nowrap">Not deliverable</span>
          );

          return (
            <div key={row.id} className="group py-4 transition-colors duration-200 hover:bg-cream/60 rounded-xl px-2 -mx-2">
              {/* ── Mobile layout (< sm): stacked ── */}
              <div className="flex flex-col gap-3 sm:hidden">
                <div className="flex items-center gap-3">
                  {iconBox}
                  <div className="flex-1 min-w-0">{nameBlock}</div>
                  <div className="text-right font-semibold text-ink shrink-0 tabular-nums">
                    {formatINR(row.cost)}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 pl-[56px]">
                  <TierToggle size="sm" value={row.tier} onChange={(tier) => onRowTierChange(row.id, tier)} />
                  {buyControl}
                </div>
              </div>

              {/* ── Desktop layout (sm and up): single row ── */}
              <div className="hidden sm:flex items-center gap-4">
                {iconBox}
                <div className="w-48 lg:w-56 shrink-0">{nameBlock}</div>
                <div className="flex-1" />
                <TierToggle size="sm" value={row.tier} onChange={(tier) => onRowTierChange(row.id, tier)} />
                <div className="w-28 text-right font-semibold text-ink shrink-0 tabular-nums">
                  {formatINR(row.cost)}
                </div>
                <div className="w-32 shrink-0 flex justify-end">{buyControl}</div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink/40 mt-4">
        Planning estimate, accurate to about ±10%. Final cost depends on quality choices, site
        conditions, design complexity and live market rates.
      </p>
    </div>
  );
}