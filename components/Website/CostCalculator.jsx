"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  RotateCcw,
  MapPin,
  Ruler,
  Sparkles,
  Download,
  Info,
  TrendingUp,
} from "lucide-react";
import { STATES, QUALITY_TIERS, TIER_ORDER, HOW_CALCULATED } from "@/lib/data";
import {
  buildEstimate,
  tierTotals,
  toSqFt,
  formatINR,
  formatNumber,
  formatCompactINR,
} from "@/lib/calculate";
import { downloadEstimatePdf } from "@/lib/generatePdf";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TierToggle from "./TierToggle";
import DonutChart from "./DonutChart";
import ResourceTable from "./ResourceTable";
import FAQAccordion from "./FAQAccordion";
import ToastStack from "./Toast";

const STATE_NAMES = Object.keys(STATES);

export default function CostCalculator() {
  const [stateName, setStateName] = useState(STATE_NAMES[0]);
  const [city, setCity] = useState(STATES[STATE_NAMES[0]][0]);
  const [areaInput, setAreaInput] = useState("1200");
  const [areaUnit, setAreaUnit] = useState("sqft");

  const [calculated, setCalculated] = useState(false);
  const [globalTier, setGlobalTier] = useState("medium");
  const [overrides, setOverrides] = useState({});
  const [mobileNumber, setMobileNumber] = useState("");
  const [toasts, setToasts] = useState([]);
  const [error, setError] = useState("");

  const areaSqFt = toSqFt(areaInput, areaUnit);

  const estimate = useMemo(
    () => buildEstimate(areaSqFt, city, globalTier, overrides),
    [areaSqFt, city, globalTier, overrides]
  );

  const tiers = useMemo(() => tierTotals(areaSqFt, city), [areaSqFt, city]);

  function pushToast(message) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }

  function handleCalculate() {
    if (!areaInput || Number(areaInput) <= 0) {
      setError("Enter a plot area greater than 0 to calculate.");
      return;
    }
    setError("");
    setOverrides({});
    setCalculated(true);
  }

  function handleReset() {
    setStateName(STATE_NAMES[0]);
    setCity(STATES[STATE_NAMES[0]][0]);
    setAreaInput("1200");
    setAreaUnit("sqft");
    setGlobalTier("medium");
    setOverrides({});
    setCalculated(false);
    setError("");
  }

  function handleStateChange(next) {
    setStateName(next);
    setCity(STATES[next][0]);
  }

  function handleRowTierChange(id, tier) {
    setOverrides((prev) => ({ ...prev, [id]: tier }));
  }

  function handleGlobalTierChange(tier) {
    setGlobalTier(tier);
    setOverrides({});
  }

  function handleBuyNow(row) {
    pushToast(`Added ${row.name} to your ConstructEzy cart`);
  }

  async function handleDownloadPdf() {
    if (!mobileNumber || mobileNumber.trim().length < 10) {
      pushToast("Enter a valid 10-digit mobile number");
      return;
    }
    await downloadEstimatePdf({
      city,
      state: stateName,
      areaSqFt,
      areaUnit,
      areaInput,
      tier: globalTier,
      rows: estimate.rows,
      total: estimate.total,
      perSqFt: estimate.perSqFt,
    });
    pushToast("Your PDF estimate is downloading");
  }

  return (
    <main className="bg-[#FBF8F0] min-h-screen pb-20">
      <ToastStack toasts={toasts} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-cream via-cream to-cream-dark border-b border-black/5">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-forest-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16 relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-forest-700 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-black/5 mb-4">
            <Sparkles size={13} /> INSTANT, LINE-BY-LINE ESTIMATE
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink leading-tight max-w-2xl">
            Home Construction <span className="text-forest-600">Cost Calculator</span>
          </h1>
          <p className="mt-4 text-ink/60 max-w-xl text-[15px] leading-relaxed">
            Estimate your full build cost — cement, tiles, paint, electrical and more — then
            order materials in 60 minutes from ConstructEzy.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Input bar */}
        <div className="bg-white rounded-[28px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] border border-black/5 -mt-8 sm:-mt-10 relative p-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-0 lg:divide-x lg:divide-black/5">
            <SelectField
              icon={<MapPin size={12} />}
              label="State"
              value={stateName}
              onChange={handleStateChange}
              options={STATE_NAMES}
              className="lg:pr-4"
            />

            <SelectField
              icon={<MapPin size={12} />}
              label="City"
              value={city}
              onChange={setCity}
              options={STATES[stateName]}
              className="lg:px-4"
            />

            <div className="flex-[1.3] lg:px-4 py-1">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ink/40 mb-1.5 uppercase">
                <Ruler size={12} /> Plot Area
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  placeholder="e.g. 1200"
                  className="h-9 border-0 shadow-none focus-visible:ring-0 px-0 text-[15px] font-medium tabular-nums bg-transparent"
                />
                <div className="inline-flex rounded-full bg-cream-dark p-0.5 text-xs shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setAreaUnit("sqft")}
                    className={cn(
                      "h-7 px-2.5 rounded-full font-medium transition-all duration-200 hover:bg-transparent",
                      areaUnit === "sqft" ? "bg-ink text-white shadow-sm hover:bg-ink hover:text-white" : "text-ink/50 hover:text-ink"
                    )}
                  >
                    Sq.Ft
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setAreaUnit("sqm")}
                    className={cn(
                      "h-7 px-2.5 rounded-full font-medium transition-all duration-200 hover:bg-transparent",
                      areaUnit === "sqm" ? "bg-ink text-white shadow-sm hover:bg-ink hover:text-white" : "text-ink/50 hover:text-ink"
                    )}
                  >
                    Sq.M
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:pl-3 shrink-0">
              <Button
                onClick={handleCalculate}
                className="group h-12 px-6 rounded-full bg-gold hover:bg-gold-600 text-ink font-semibold gap-2 transition-all duration-200 whitespace-nowrap shadow-[0_4px_14px_-4px_rgba(242,183,5,0.6)] hover:shadow-[0_6px_20px_-4px_rgba(242,183,5,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                <Calculator size={17} className="transition-transform duration-300 group-hover:rotate-[-8deg]" />
                Calculate
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                aria-label="Reset"
                className="group h-12 w-12 rounded-full border-black/10 hover:border-black/20 hover:bg-cream-dark text-ink/60 hover:text-ink shrink-0"
              >
                <RotateCcw size={16} className="transition-transform duration-500 group-hover:-rotate-180" />
              </Button>
            </div>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-3 pl-2 animate-[fadeIn_0.2s_ease-out]">{error}</p>
        )}

        {/* Pre-calculation helper panel */}
        {!calculated && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-cream rounded-[28px] p-7 sm:p-9">
              <h2 className="font-display text-2xl font-semibold text-ink mb-2">
                Tell us about your plot — we'll do the math.
              </h2>
              <p className="text-ink/60 mb-7 leading-relaxed">
                Three quick details and we'll break down every material your home needs, with
                quantities, costs, and a tap to order the ones ConstructEzy delivers in 60 minutes.
              </p>
              <ol className="space-y-5">
                <Step n={1} title="Pick your city">
                  Rates are localised — Bangalore, Mumbai, Chennai and 25+ more.
                </Step>
                <Step n={2} title="Enter built-up area">
                  Sq.Feet or Sq.Meter — toggle anytime. Typical home: 1,000–2,000 sqft.
                </Step>
                <Step n={3} title="Tune quality per material">
                  Start at Medium, then dial any line item to Basic or Premium.
                </Step>
              </ol>
            </div>

            <div className="bg-white rounded-[28px] border border-black/5 p-7 sm:p-9 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-forest-600 mb-1.5">
                YOU'LL SEE
              </p>
              <h3 className="font-display text-2xl font-semibold text-ink mb-2">
                13 materials, one bill
              </h3>
              <p className="text-ink/60 mb-6 leading-relaxed">
                From foundation to finish, with the ConstructEzy-deliverable items called out for
                one-click ordering.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Cement",
                  "TMT Steel",
                  "Bricks",
                  "Aggregate",
                  "Sand",
                  "Tiles & Flooring",
                  "Windows & Grills",
                  "Doors",
                  "+5 more",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="text-sm px-3.5 py-1.5 rounded-full border border-black/10 text-ink/70 hover:border-forest-600/40 hover:text-forest-700 transition-colors duration-200"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {calculated && (
          <div className="mt-10 space-y-6 animate-[fadeIn_0.35s_ease-out]">
            {/* Summary bar */}
            <div className="relative overflow-hidden bg-linear-to-br from-forest-800 to-forest-900 text-white rounded-[28px] p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
              <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-gold/10 blur-3xl" />
              <div className="relative">
                <p className="text-xs tracking-wide text-white/50 mb-1.5 font-semibold">
                  YOUR ESTIMATE
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-semibold">
                  A {formatNumber(areaInput)} {areaUnit === "sqm" ? "sq.m" : "sq.ft"} home in{" "}
                  {city}
                </h2>
                <p className="text-white/55 text-sm mt-1.5">
                  at {QUALITY_TIERS[globalTier].label} quality · 13 categories included
                </p>
              </div>
              <div className="relative flex gap-10">
                <div>
                  <p className="text-xs tracking-wide text-white/50 mb-1.5 font-semibold">
                    COST PER SQ.FT
                  </p>
                  <p className="font-display text-2xl font-semibold">
                    {formatINR(estimate.perSqFt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-wide text-white/50 mb-1.5 font-semibold">
                    TOTAL ESTIMATED COST
                  </p>
                  <p className="font-display text-2xl font-semibold text-gold">
                    {formatINR(estimate.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Distribution + quality */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-[28px] border border-black/5 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-display font-semibold text-ink mb-1">
                  Cost distribution
                </h3>
                <p className="text-sm text-ink/45 mb-6">By category · hover to inspect</p>
                <DonutChart rows={estimate.rows} total={estimate.total} />
              </div>

              <div className="bg-white rounded-[28px] border border-black/5 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-display font-semibold text-ink mb-1">
                  Build quality
                </h3>
                <p className="text-sm text-ink/45 mb-6">
                  Applied to all rows · override individually below
                </p>

                <div className="bg-cream rounded-2xl p-4 flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-ink/70">TIER</span>
                  <TierToggle value={globalTier} onChange={handleGlobalTierChange} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {TIER_ORDER.map((key) => {
                    const active = key === globalTier;
                    return (
                      <button
                        key={key}
                        onClick={() => handleGlobalTierChange(key)}
                        className={cn(
                          "rounded-2xl p-4 text-left border transition-all duration-200",
                          active
                            ? "border-forest-600 bg-forest-50 shadow-sm"
                            : "border-black/10 hover:border-black/20 hover:-translate-y-0.5"
                        )}
                      >
                        <p
                          className={cn(
                            "text-[11px] font-semibold tracking-wide mb-1",
                            active ? "text-forest-700" : "text-ink/45"
                          )}
                        >
                          {QUALITY_TIERS[key].label.toUpperCase()}
                        </p>
                        <p className="font-display text-lg font-semibold text-ink">
                          {formatCompactINR(tiers[key])}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <p className="flex items-start gap-2 text-xs text-ink/50 mt-4 bg-cream rounded-xl p-3.5">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  Inclusive of material + labour. GST extra. Site conditions may vary ±10%.
                </p>
              </div>
            </div>

            {/* Resource table */}
            <div className="bg-white rounded-[28px] border border-black/5 p-6 sm:p-8 shadow-sm">
              <ResourceTable
                rows={estimate.rows}
                areaSqFt={areaSqFt}
                onRowTierChange={handleRowTierChange}
                onBuyNow={handleBuyNow}
              />
            </div>

            {/* Total bar */}
            <div className="bg-gradient-to-br from-forest-800 to-forest-900 text-white rounded-[28px] p-6 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <span className="text-xs tracking-wide text-white/55 font-semibold flex items-center gap-2">
                <TrendingUp size={14} />
                TOTAL ESTIMATED COST · {QUALITY_TIERS[globalTier].label.toUpperCase()} QUALITY
              </span>
              <span className="font-display text-2xl font-semibold">
                <span className="text-gold">{formatINR(estimate.total)}</span>{" "}
                <span className="text-white/55 text-base font-sans">
                  {formatINR(estimate.perSqFt)}/sq ft
                </span>
              </span>
            </div>

            {/* PDF download */}
            <div className="bg-cream rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-start gap-3.5">
                <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-forest-700 shrink-0 shadow-sm">
                  <Download size={18} />
                </span>
                <div>
                  <p className="font-semibold text-ink">Download your full estimate</p>
                  <p className="text-sm text-ink/60 max-w-md leading-relaxed">
                    Get a clean, itemised PDF of your {formatCompactINR(estimate.total)} estimate
                    — handy for sharing with your contractor, bank or family. Enter your mobile
                    number to download. We may reach out about your project — no spam.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Mobile number"
                  className="h-11 rounded-full flex-1 sm:w-44 bg-white border-black/10"
                />
                <Button
                  onClick={handleDownloadPdf}
                  className="h-11 px-5 rounded-full bg-gold hover:bg-gold-600 text-ink font-semibold whitespace-nowrap gap-2 transition-all duration-200 shadow-[0_4px_14px_-4px_rgba(242,183,5,0.6)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download size={16} /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* How is this calculated */}
        <div className="mt-20">
          <h3 className="font-display text-2xl font-semibold text-ink mb-6">
            How Is This Estimate Calculated?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_CALCULATED.map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center mb-3">
                  <c.icon size={18} className="text-forest-600" strokeWidth={2} />
                </div>
                <p className="font-semibold text-ink mb-1">{c.title}</p>
                <p className="text-sm text-ink/60 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 bg-white rounded-[28px] border border-black/5 p-6 sm:p-9 shadow-sm">
          <FAQAccordion />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

function SelectField({ icon, label, value, onChange, options, className = "" }) {
  return (
    <div className={cn("flex-1 py-1", className)}>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ink/40 mb-1.5 uppercase">
        {icon} {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 border-0 shadow-none px-0 gap-2 text-[15px] font-medium text-ink focus:ring-0 [&>svg]:text-ink/35 [&>svg]:opacity-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-black/5 shadow-xl">
          {options.map((opt) => (
            <SelectItem
              key={opt}
              value={opt}
              className="rounded-lg focus:bg-forest-50 focus:text-forest-800 cursor-pointer"
            >
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <li className="flex gap-4">
      <span className="w-8 h-8 rounded-full bg-white text-forest-700 font-semibold flex items-center justify-center shrink-0 text-sm shadow-sm">
        {n}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-ink/60 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}