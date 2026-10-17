"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calculator,
  RotateCcw,
  MapPin,
  Ruler,
  Sparkles,
  Download,
  Info,
  TrendingUp,
  Loader2,
  Layers,
  Clock,
  Phone,
  ShieldCheck,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Gauge,
  RefreshCw,
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
const CITY_COUNT = Object.values(STATES).reduce((sum, list) => sum + list.length, 0);

const SQM_TO_SQFT = 10.7639;
const MAX_SQFT = 500000;
const PRESETS_SQFT = [600, 800, 1000, 1200, 1500, 2000, 2500, 3000];

const round2 = (n) => Math.round(n * 100) / 100;

/* Smoothly animates a number whenever `target` changes */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);

  useEffect(() => {
    const from = valueRef.current;
    if (from === target) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      valueRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export default function CostCalculator() {
  /* ── Form inputs ── */
  const [stateName, setStateName] = useState(STATE_NAMES[0]);
  const [city, setCity] = useState(STATES[STATE_NAMES[0]][0]);
  const [areaInput, setAreaInput] = useState("1200");
  const [areaUnit, setAreaUnit] = useState("sqft");
  const canonSqFt = useRef(1200); // last valid area in sq.ft (keeps unit toggling lossless)

  /* ── Calculated snapshot (results only change when Calculate is pressed) ── */
  const [submitted, setSubmitted] = useState(null);
  const [globalTier, setGlobalTier] = useState("medium");
  const [overrides, setOverrides] = useState({});

  /* ── PDF / misc ── */
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [error, setError] = useState("");

  const resultsRef = useRef(null);
  const calculated = Boolean(submitted);

  const unitFactor = areaUnit === "sqm" ? SQM_TO_SQFT : 1;
  const liveSqFt = (parseFloat(areaInput) || 0) * unitFactor;
  const areaSqFt = toSqFt(areaInput, areaUnit);

  const estimate = useMemo(
    () =>
      submitted
        ? buildEstimate(submitted.areaSqFt, submitted.city, globalTier, overrides)
        : null,
    [submitted, globalTier, overrides]
  );

  const tiers = useMemo(
    () => (submitted ? tierTotals(submitted.areaSqFt, submitted.city) : null),
    [submitted]
  );

  const sampleCount = useMemo(() => {
    try {
      return buildEstimate(1000, STATES[STATE_NAMES[0]][0], "medium", {}).rows.length;
    } catch {
      return 13;
    }
  }, []);

  const isStale =
    calculated &&
    (city !== submitted.city || Math.abs((areaSqFt || 0) - submitted.areaSqFt) > 0.5);

  const animatedTotal = useCountUp(Number(estimate?.total) || 0);

  /* ── Helpers ── */
  function pushToast(message) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }

  function handleAreaChange(e) {
    const v = e.target.value;
    setAreaInput(v);
    setError("");
    const n = parseFloat(v);
    if (Number.isFinite(n)) canonSqFt.current = n * unitFactor;
  }

  function handleUnitChange(next) {
    if (next === areaUnit) return;
    setAreaUnit(next);
    if (areaInput === "") return;
    const sqft = canonSqFt.current;
    setAreaInput(String(next === "sqm" ? round2(sqft / SQM_TO_SQFT) : round2(sqft)));
  }

  function applyPreset(sqft) {
    canonSqFt.current = sqft;
    setAreaInput(String(areaUnit === "sqm" ? round2(sqft / SQM_TO_SQFT) : sqft));
    setError("");
  }

  function handleStateChange(next) {
    setStateName(next);
    setCity(STATES[next][0]);
  }

  function handleCalculate() {
    const n = parseFloat(areaInput);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a plot area greater than 0 to calculate.");
      return;
    }
    const sqft = toSqFt(areaInput, areaUnit);
    if (!(sqft > 0)) {
      setError("Enter a valid plot area to calculate.");
      return;
    }
    if (sqft > MAX_SQFT) {
      setError("That plot area looks too large. Please enter up to 5,00,000 sq.ft.");
      return;
    }
    setError("");
    setOverrides({});
    setSubmitted({ stateName, city, areaInput, areaUnit, areaSqFt: sqft });
    setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      80
    );
  }

  function handleReset() {
    setStateName(STATE_NAMES[0]);
    setCity(STATES[STATE_NAMES[0]][0]);
    setAreaInput("1200");
    setAreaUnit("sqft");
    canonSqFt.current = 1200;
    setGlobalTier("medium");
    setOverrides({});
    setSubmitted(null);
    setMobileNumber("");
    setMobileError("");
    setError("");
  }

  function handleRowTierChange(id, tier) {
    setOverrides((prev) => ({ ...prev, [id]: tier }));
  }

  function handleGlobalTierChange(tier) {
    setGlobalTier(tier);
    setOverrides({});
  }

  function handleBuyNow(row) {
    pushToast(`Added ${row.name} to your QuickMason cart`);
  }

  function handleShare() {
    if (!submitted || !estimate) return;
    const unit = submitted.areaUnit === "sqm" ? "sq.m" : "sq.ft";
    const text =
      `Home construction estimate (${QUALITY_TIERS[globalTier].label} quality)\n` +
      `${formatNumber(submitted.areaInput)} ${unit} in ${submitted.city}, ${submitted.stateName}\n` +
      `Total: ${formatINR(estimate.total)} (${formatINR(estimate.perSqFt)}/sq ft)\n` +
      `Calculated on QuickMason`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  async function handleDownloadPdf() {
    if (!submitted || !estimate || downloading) return;

    const digits = mobileNumber.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setMobileError("Enter a valid 10-digit mobile number");
      pushToast("Enter a valid 10-digit mobile number");
      return;
    }
    setMobileError("");
    setDownloading(true);

    try {
      await downloadEstimatePdf({
        city: submitted.city,
        state: submitted.stateName,
        areaSqFt: submitted.areaSqFt,
        areaUnit: submitted.areaUnit,
        areaInput: submitted.areaInput,
        tier: globalTier,
        rows: estimate.rows,
        total: estimate.total,
        perSqFt: estimate.perSqFt,
        mobile: digits,
      });
      pushToast("Your PDF estimate is downloading");
    } catch (err) {
      console.error("PDF generation failed:", err);
      pushToast("Could not create the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const unitLabel = submitted?.areaUnit === "sqm" ? "sq.m" : "sq.ft";

  return (
    <main className="bg-[#FBF8F0] min-h-screen pb-24">
      <ToastStack toasts={toasts} />

      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="pointer-events-none absolute -top-28 -right-20 w-96 h-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-forest-600/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-28 sm:pt-20 sm:pb-32">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-gold bg-white/10 backdrop-blur px-3.5 py-1.5 rounded-full border border-white/10 mb-5">
            <Sparkles size={13} /> INSTANT, LINE-BY-LINE ESTIMATE
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.05] max-w-3xl">
            Home Construction{" "}
            <span className="relative inline-block text-gold">
              Cost Calculator
              <span className="absolute left-0 -bottom-1.5 h-1 w-full rounded-full bg-gold/40" />
            </span>
          </h1>
          <p className="mt-6 text-white/65 max-w-xl text-base sm:text-[17px] leading-relaxed">
            Estimate your full build cost, from cement and tiles to paint and electricals, then
            order materials in 60 minutes from QuickMason.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { icon: Layers, text: `${sampleCount} materials priced` },
              { icon: MapPin, text: `${CITY_COUNT} cities, ${STATE_NAMES.length} states` },
              { icon: Clock, text: "60-minute delivery" },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 text-sm text-white/80 bg-white/10 border border-white/10 backdrop-blur rounded-full pl-2 pr-4 py-1.5"
              >
                <span className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
                  <Icon size={14} className="text-gold" />
                </span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* ───────────── INPUT CARD ───────────── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
          className="relative -mt-16 sm:-mt-20 bg-white rounded-[32px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] border border-black/5 p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.35fr_auto] gap-3 lg:gap-4 items-stretch">
            <SelectField
              icon={<MapPin size={13} />}
              label="State"
              value={stateName}
              onChange={handleStateChange}
              options={STATE_NAMES}
            />
            <SelectField
              icon={<Building2 size={13} />}
              label="City"
              value={city}
              onChange={(v) => {
                setCity(v);
                setError("");
              }}
              options={STATES[stateName]}
            />

            {/* Plot area */}
            <div className="rounded-2xl bg-cream/70 border border-black/5 px-4 py-3 transition-all focus-within:bg-white focus-within:border-forest-600 focus-within:ring-4 focus-within:ring-forest-600/10">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-ink/45 mb-1 uppercase">
                <Ruler size={13} /> Plot Area
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="any"
                  value={areaInput}
                  onChange={handleAreaChange}
                  onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                  placeholder="e.g. 1200"
                  aria-invalid={Boolean(error)}
                  className="h-9 border-0 shadow-none focus-visible:ring-0 px-0 text-lg font-semibold tabular-nums bg-transparent"
                />
                <div className="inline-flex rounded-full bg-white border border-black/5 p-0.5 text-xs shrink-0 shadow-sm">
                  {[
                    { key: "sqft", label: "Sq.Ft" },
                    { key: "sqm", label: "Sq.M" },
                  ].map((u) => (
                    <button
                      key={u.key}
                      type="button"
                      onClick={() => handleUnitChange(u.key)}
                      className={cn(
                        "h-7 px-3 rounded-full font-semibold transition-all duration-200 cursor-pointer",
                        areaUnit === u.key
                          ? "bg-forest-800 text-white shadow-sm"
                          : "text-ink/50 hover:text-ink"
                      )}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
              {liveSqFt > 0 && (
                <p className="text-[11px] text-ink/40 mt-0.5 tabular-nums">
                  {areaUnit === "sqft"
                    ? `approx. ${formatNumber(round2(liveSqFt / SQM_TO_SQFT))} sq.m`
                    : `approx. ${formatNumber(Math.round(liveSqFt))} sq.ft`}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-stretch gap-2">
              <Button
                type="submit"
                className="group flex-1 lg:flex-none h-auto min-h-14 px-7 rounded-2xl bg-gradient-to-br from-gold to-gold-600 hover:from-gold-600 hover:to-gold text-ink font-bold gap-2 whitespace-nowrap shadow-[0_10px_24px_-8px_rgba(242,183,5,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
              >
                <Calculator size={18} className="transition-transform duration-300 group-hover:-rotate-12" />
                Calculate
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                size="icon"
                aria-label="Reset"
                title="Reset"
                className="group h-auto min-h-14 w-14 rounded-2xl border-black/10 hover:border-black/20 hover:bg-cream text-ink/60 hover:text-ink shrink-0"
              >
                <RotateCcw size={18} className="transition-transform duration-500 group-hover:-rotate-180" />
              </Button>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-4 pt-4 border-t border-black/5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-ink/40 uppercase mr-1">
              Quick pick
            </span>
            {PRESETS_SQFT.map((p) => {
              const active = Math.abs(liveSqFt - p) < 0.6;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer tabular-nums",
                    active
                      ? "bg-forest-800 border-forest-800 text-white shadow-sm"
                      : "bg-white border-black/10 text-ink/65 hover:border-forest-600/50 hover:text-forest-700 hover:-translate-y-0.5"
                  )}
                >
                  {areaUnit === "sqm" ? `${round2(p / SQM_TO_SQFT)} sq.m` : `${formatNumber(p)} sq.ft`}
                </button>
              );
            })}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 animate-[ceFade_0.2s_ease-out]"
            >
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </p>
          )}
        </form>

        {/* ───────────── PRE-CALCULATION PANEL ───────────── */}
        {!calculated && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] border border-black/5 p-7 sm:p-10 shadow-sm">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-3 leading-tight">
                Tell us about your plot. We'll do the math.
              </h2>
              <p className="text-ink/60 mb-8 leading-relaxed">
                Three quick details and we'll break down every material your home needs, with
                quantities, costs, and a tap to order the ones QuickMason delivers in 60 minutes.
              </p>
              <ol className="space-y-6">
                <Step n={1} title="Pick your city">
                  Rates are localised across {CITY_COUNT} cities in {STATE_NAMES.length} states.
                </Step>
                <Step n={2} title="Enter built-up area">
                  Sq.Feet or Sq.Meter, switch anytime. Typical home: 1,000 to 2,000 sq.ft.
                </Step>
                <Step n={3} title="Tune quality per material">
                  Start at Medium, then dial any line item to Basic or Premium.
                </Step>
              </ol>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 to-forest-900 text-white rounded-[32px] p-7 sm:p-10 shadow-lg">
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold/15 blur-3xl" />
              <p className="relative text-[11px] font-semibold tracking-widest text-gold mb-2">
                YOU'LL SEE
              </p>
              <h3 className="relative font-display text-2xl sm:text-3xl font-semibold mb-3">
                {sampleCount} materials, one bill
              </h3>
              <p className="relative text-white/65 mb-7 leading-relaxed">
                From foundation to finish, with the QuickMason-deliverable items called out for
                one-click ordering.
              </p>
              <div className="relative flex flex-wrap gap-2">
                {[
                  "Cement",
                  "TMT Steel",
                  "Bricks",
                  "Aggregate",
                  "Sand",
                  "Tiles & Flooring",
                  "Windows & Grills",
                  "Doors",
                  `+${Math.max(sampleCount - 8, 0)} more`,
                ].map((chip) => (
                  <span
                    key={chip}
                    className="text-sm px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/85 hover:bg-gold hover:text-ink hover:border-gold transition-all duration-200"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───────────── RESULTS ───────────── */}
        {calculated && estimate && tiers && (
          <div ref={resultsRef} className="mt-10 space-y-6 scroll-mt-28 animate-[ceFade_0.4s_ease-out]">
            {/* Stale inputs notice */}
            {isStale && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3.5">
                <p className="flex items-center gap-2.5 text-sm font-medium text-amber-900">
                  <AlertTriangle size={17} className="shrink-0 text-amber-600" />
                  You changed the inputs. Recalculate to update this estimate.
                </p>
                <Button
                  type="button"
                  onClick={handleCalculate}
                  className="h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-2 px-5"
                >
                  <RefreshCw size={15} /> Recalculate
                </Button>
              </div>
            )}

            {/* Summary */}
            <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-900 to-forest-900 text-white rounded-[32px] p-7 sm:p-10 shadow-xl">
              <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-forest-600/30 blur-3xl" />

              <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                  <p className="text-[11px] tracking-widest text-gold font-semibold mb-2">
                    YOUR ESTIMATE
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-white/90">
                    A {formatNumber(submitted.areaInput)} {unitLabel} home in {submitted.city}
                  </h2>
                  <p className="font-display text-5xl sm:text-6xl font-semibold text-gold mt-4 tabular-nums leading-none">
                    {formatINR(Math.round(animatedTotal))}
                  </p>
                  <p className="text-white/55 text-sm mt-3">
                    Total estimated cost at {QUALITY_TIERS[globalTier].label} quality
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:max-w-xl w-full lg:w-auto">
                  <Kpi icon={Gauge} label="Per sq.ft" value={formatINR(estimate.perSqFt)} />
                  <Kpi icon={Ruler} label="Area" value={`${formatNumber(submitted.areaInput)} ${unitLabel}`} />
                  <Kpi icon={Layers} label="Categories" value={String(estimate.rows.length)} />
                  <Kpi icon={ShieldCheck} label="Quality" value={QUALITY_TIERS[globalTier].label} />
                </div>
              </div>
            </div>

            {/* Distribution + Quality */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-[32px] border border-black/5 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-display font-semibold text-ink mb-1">
                  Cost distribution
                </h3>
                <p className="text-sm text-ink/45 mb-6">By category, hover to inspect</p>
                <DonutChart rows={estimate.rows} total={estimate.total} />
              </div>

              <div className="bg-white rounded-[32px] border border-black/5 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-display font-semibold text-ink mb-1">
                  Build quality
                </h3>
                <p className="text-sm text-ink/45 mb-6">
                  Applied to all rows, override individually below
                </p>

                <div className="bg-cream rounded-2xl p-4 flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-semibold tracking-wider text-ink/60">TIER</span>
                  <TierToggle value={globalTier} onChange={handleGlobalTierChange} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {TIER_ORDER.map((key) => {
                    const active = key === globalTier;
                    const base = tiers[globalTier] || 0;
                    const delta = base > 0 ? ((tiers[key] - base) / base) * 100 : 0;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleGlobalTierChange(key)}
                        className={cn(
                          "rounded-2xl p-4 text-left border-2 transition-all duration-200 cursor-pointer",
                          active
                            ? "border-forest-600 bg-forest-50 shadow-sm"
                            : "border-black/5 bg-cream/50 hover:border-black/15 hover:-translate-y-0.5"
                        )}
                      >
                        <p
                          className={cn(
                            "text-[11px] font-semibold tracking-wider mb-1",
                            active ? "text-forest-700" : "text-ink/45"
                          )}
                        >
                          {QUALITY_TIERS[key].label.toUpperCase()}
                        </p>
                        <p className="font-display text-lg font-semibold text-ink tabular-nums">
                          {formatCompactINR(tiers[key])}
                        </p>
                        <p
                          className={cn(
                            "text-[11px] font-semibold mt-1",
                            active
                              ? "text-forest-700"
                              : delta > 0
                              ? "text-red-600"
                              : "text-emerald-600"
                          )}
                        >
                          {active ? "Selected" : `${delta > 0 ? "+" : ""}${Math.round(delta)}%`}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <p className="flex items-start gap-2 text-xs text-ink/55 mt-4 bg-cream rounded-xl p-3.5 leading-relaxed">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  Inclusive of material + labour. GST extra. Site conditions may vary by 10%.
                </p>
              </div>
            </div>

            {/* Resource table */}
            <div className="bg-white rounded-[32px] border border-black/5 p-6 sm:p-8 shadow-sm">
              <ResourceTable
                rows={estimate.rows}
                areaSqFt={submitted.areaSqFt}
                onRowTierChange={handleRowTierChange}
                onBuyNow={handleBuyNow}
              />
            </div>

            {/* Total bar */}
            <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white rounded-[28px] p-6 sm:px-8 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <span className="text-xs tracking-widest text-white/60 font-semibold flex items-center gap-2">
                <TrendingUp size={15} className="text-gold" />
                TOTAL ESTIMATED COST, {QUALITY_TIERS[globalTier].label.toUpperCase()} QUALITY
              </span>
              <span className="font-display text-2xl font-semibold">
                <span className="text-gold tabular-nums">{formatINR(estimate.total)}</span>{" "}
                <span className="text-white/55 text-base font-sans">
                  {formatINR(estimate.perSqFt)}/sq ft
                </span>
              </span>
            </div>

            {/* PDF download */}
            <div className="relative overflow-hidden bg-cream rounded-[32px] border border-black/5 p-6 sm:p-9">
              <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gold/20 blur-3xl" />
              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-forest-700 shrink-0 shadow-sm">
                    <Download size={21} />
                  </span>
                  <div>
                    <p className="font-display text-xl font-semibold text-ink">
                      Download your full estimate
                    </p>
                    <p className="text-sm text-ink/60 max-w-md leading-relaxed mt-1">
                      Get a clean, itemised PDF of your {formatCompactINR(estimate.total)} estimate,
                      handy for sharing with your contractor, bank or family. Enter your mobile
                      number to download. We may reach out about your project, no spam.
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-auto lg:min-w-[420px]">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div
                      className={cn(
                        "flex items-center flex-1 h-12 rounded-full bg-white border pl-4 pr-2 transition-all focus-within:ring-4",
                        mobileError
                          ? "border-red-300 focus-within:ring-red-200/60"
                          : "border-black/10 focus-within:border-forest-600 focus-within:ring-forest-600/10"
                      )}
                    >
                      <Phone size={16} className="text-ink/40 shrink-0" />
                      <span className="ml-2 text-sm font-semibold text-ink/60">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                          setMobileError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleDownloadPdf()}
                        placeholder="Mobile number"
                        aria-label="Mobile number"
                        className="flex-1 min-w-0 h-full bg-transparent px-3 text-sm font-medium text-ink placeholder:text-ink/35 focus:outline-none tabular-nums"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={downloading}
                      className="h-12 px-6 rounded-full bg-gradient-to-br from-gold to-gold-600 hover:from-gold-600 hover:to-gold text-ink font-bold whitespace-nowrap gap-2 shadow-[0_10px_24px_-8px_rgba(242,183,5,0.8)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {downloading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" /> Preparing...
                        </>
                      ) : (
                        <>
                          <Download size={17} /> Download PDF
                        </>
                      )}
                    </Button>
                  </div>

                  {mobileError && (
                    <p role="alert" className="text-xs font-medium text-red-600 mt-2 pl-4">
                      {mobileError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleShare}
                    className="mt-3 pl-4 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-900 transition-colors cursor-pointer group"
                  >
                    <MessageCircle size={16} />
                    Share summary on WhatsApp
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── HOW IT'S CALCULATED ───────────── */}
        <div className="mt-20">
          <p className="text-[11px] font-semibold tracking-widest text-forest-600 mb-2">
            TRANSPARENT PRICING
          </p>
          <h3 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-7">
            How Is This Estimate Calculated?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_CALCULATED.map((c, i) => (
              <div
                key={c.title}
                className="group relative bg-white rounded-3xl border border-black/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute top-4 right-5 font-display text-5xl font-semibold text-ink/[0.04] group-hover:text-gold/30 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center mb-4 shadow-md shadow-forest-800/20 transition-transform duration-300 group-hover:rotate-6">
                  <c.icon size={19} className="text-white" strokeWidth={2} />
                </div>
                <p className="relative font-semibold text-ink mb-1.5">{c.title}</p>
                <p className="relative text-sm text-ink/60 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ───────────── FAQ ───────────── */}
        <div className="mt-16 bg-white rounded-[32px] border border-black/5 p-6 sm:p-10 shadow-sm">
          <FAQAccordion />
        </div>
      </div>

      <style>{`
        @keyframes ceFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

/* ───────────── Sub components ───────────── */

function SelectField({ icon, label, value, onChange, options }) {
  return (
    <div className="rounded-2xl bg-cream/70 border border-black/5 px-4 py-3 transition-all focus-within:bg-white focus-within:border-forest-600 focus-within:ring-4 focus-within:ring-forest-600/10 hover:border-black/10">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-ink/45 mb-1 uppercase">
        {icon} {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 border-0 shadow-none px-0 gap-2 text-lg font-semibold text-ink bg-transparent focus:ring-0 [&>svg]:text-ink/35 [&>svg]:opacity-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-black/5 shadow-xl max-h-72">
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

function Kpi({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur px-4 py-3.5 hover:bg-white/15 transition-colors">
      <p className="flex items-center gap-1.5 text-[10px] tracking-widest text-white/50 font-semibold uppercase mb-1.5">
        <Icon size={12} className="text-gold" /> {label}
      </p>
      <p className="font-display text-base sm:text-lg font-semibold text-white truncate tabular-nums">
        {value}
      </p>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <li className="flex gap-4">
      <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 text-white font-semibold flex items-center justify-center shrink-0 text-sm shadow-md shadow-forest-800/20">
        {n}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-ink/60 leading-relaxed mt-0.5">{children}</p>
      </div>
    </li>
  );
}