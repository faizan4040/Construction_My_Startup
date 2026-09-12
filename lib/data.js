import {
  Package,
  Construction,
  Grid3x3,
  Mountain,
  Waves,
  LayoutGrid,
  AppWindow,
  Zap,
  ShowerHead,
  DoorClosed,
  PaintBucket,
  ChefHat,
  HardHat,
  LineChart,
  MapPin,
  Receipt,
  SlidersHorizontal,
} from "lucide-react";

// ---------------------------------------------------------------------------
// HomeRun Cost Calculator — data layer
//
// Rates below are planning-level averages built from commonly published
// Indian residential-construction thumb rules (material quantity per sq.ft
// and average material+labour market rates as of 2025). They are meant for
// early-stage budgeting, not a quote — real prices move with location,
// vendor, brand and site conditions. Swap in your own live price-feed here
// when you have one; every number lives in this single file.
// ---------------------------------------------------------------------------

// Quality tiers and how they scale the base (Medium) rate.
export const QUALITY_TIERS = {
  basic: { key: "basic", label: "Basic", multiplier: 0.85 },
  medium: { key: "medium", label: "Medium", multiplier: 1 },
  premium: { key: "premium", label: "Premium", multiplier: 1.17 },
};

export const TIER_ORDER = ["basic", "medium", "premium"];

// States -> cities shown in the dropdowns.
export const STATES = {
  Karnataka: ["Bangalore", "Mysore", "Mangalore", "Hubli"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Delhi NCR": ["New Delhi", "Gurugram", "Noida", "Faridabad"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Telangana: ["Hyderabad", "Warangal"],
  "West Bengal": ["Kolkata", "Siliguri"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  Goa: ["North Goa", "South Goa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur"],
  Kerala: ["Kochi", "Thiruvananthapuram"],
  Punjab: ["Chandigarh", "Ludhiana"],
  "Madhya Pradesh": ["Indore", "Bhopal"],
};

// Regional cost-of-construction multiplier applied on top of the base rate.
// 1.00 = a typical tier-2 city. Metros run higher, smaller towns run lower.
export const CITY_MULTIPLIERS = {
  Mumbai: 1.28,
  Pune: 1.1,
  Nagpur: 0.95,
  Nashik: 0.95,
  Bangalore: 1.15,
  Mysore: 0.95,
  Mangalore: 0.98,
  Hubli: 0.9,
  "New Delhi": 1.2,
  Gurugram: 1.22,
  Noida: 1.1,
  Faridabad: 1.05,
  Chennai: 1.1,
  Coimbatore: 0.95,
  Madurai: 0.9,
  Hyderabad: 1.08,
  Warangal: 0.88,
  Kolkata: 1.05,
  Siliguri: 0.85,
  Ahmedabad: 1.0,
  Surat: 0.98,
  Vadodara: 0.95,
  Jaipur: 0.95,
  Jodhpur: 0.88,
  Udaipur: 0.9,
  "North Goa": 1.05,
  "South Goa": 1.0,
  Lucknow: 0.95,
  Kanpur: 0.88,
  Kochi: 1.0,
  Thiruvananthapuram: 0.95,
  Chandigarh: 1.05,
  Ludhiana: 0.92,
  Indore: 0.92,
  Bhopal: 0.9,
};

export function getCityMultiplier(city) {
  return CITY_MULTIPLIERS[city] ?? 0.95;
}

// Chart / row accent colours, one per material, in table order.
const PALETTE = [
  "#2C5E2A", "#F2B705", "#7A3B12", "#8FBF3F", "#E7D18C",
  "#4B2E12", "#C7891B", "#3E7C3A", "#B7CE8C", "#D8B25C",
  "#EADFC0", "#A9752C", "#0B0B0B",
];

// 13 material / labour categories.
// qtyPerSqft: physical quantity needed per sq.ft of built-up area.
// rate: ₹ per unit at Medium quality, base (1.0x) city multiplier.
// displayQtyAsArea: for a few line items (sanitaryware, labour) the
// reference UI shows built-up area rather than a piece count — this flag
// reproduces that.
export const MATERIALS = [
  {
    id: "cement",
    name: "Cement",
    icon: Package,
    unit: "bags",
    spec: "PPC / OPC 53 grade",
    qtyPerSqft: 0.4,
    rate: 380,
    delivers: true,
  },
  {
    id: "steel",
    name: "TMT Steel",
    icon: Construction,
    unit: "kg",
    spec: "Fe 500 / Fe 500D",
    qtyPerSqft: 4,
    rate: 68,
    delivers: true,
  },
  {
    id: "bricks",
    name: "Bricks",
    icon: Grid3x3,
    unit: "nos",
    spec: "Red clay / fly-ash",
    qtyPerSqft: 9,
    rate: 8.5,
    delivers: true,
  },
  {
    id: "aggregate",
    name: "Aggregate",
    icon: Mountain,
    unit: "cu ft",
    spec: "20mm + 40mm jelly",
    qtyPerSqft: 1.5,
    rate: 65,
    delivers: true,
  },
  {
    id: "sand",
    name: "Sand",
    icon: Waves,
    unit: "cu ft",
    spec: "River / M-sand",
    qtyPerSqft: 1.8,
    rate: 55,
    delivers: true,
  },
  {
    id: "tiles",
    name: "Tiles & Flooring",
    icon: LayoutGrid,
    unit: "sq ft",
    spec: "Vitrified 600x600mm",
    qtyPerSqft: 1.1,
    rate: 82,
    delivers: true,
  },
  {
    id: "windows",
    name: "Windows & Grills",
    icon: AppWindow,
    unit: "sq ft",
    spec: "UPVC / Alu + MS grills",
    qtyPerSqft: 0.11,
    rate: 380,
    delivers: true,
  },
  {
    id: "electrical",
    name: "Electrical & Wiring",
    icon: Zap,
    unit: "points",
    spec: "Wiring, points, switches",
    qtyPerSqft: 0.045,
    rate: 1800,
    delivers: false,
  },
  {
    id: "sanitary",
    name: "Sanitaryware",
    icon: ShowerHead,
    unit: "sq ft",
    spec: "CP fittings + tanks",
    qtyPerSqft: 1,
    rate: 90,
    delivers: true,
    displayQtyAsArea: true,
  },
  {
    id: "doors",
    name: "Doors",
    icon: DoorClosed,
    unit: "nos",
    spec: "Flush + main door",
    qtyPerSqft: 0.006,
    rate: 8000,
    delivers: true,
  },
  {
    id: "paint",
    name: "Paint & Putty",
    icon: PaintBucket,
    unit: "sq ft",
    spec: "Interior + exterior",
    qtyPerSqft: 2.2,
    rate: 27,
    delivers: true,
  },
  {
    id: "kitchen",
    name: "Modular Kitchen",
    icon: ChefHat,
    unit: "sq ft",
    spec: "Cabinets + countertop",
    qtyPerSqft: 0.055,
    rate: 950,
    delivers: true,
  },
  {
    id: "labour",
    name: "Contractor & Labour",
    icon: HardHat,
    unit: "sq ft",
    spec: "Skilled + unskilled",
    qtyPerSqft: 1,
    rate: 250,
    delivers: false,
    displayQtyAsArea: true,
  },
].map((m, i) => ({ ...m, color: PALETTE[i % PALETTE.length] }));

export const FAQS = [
  {
    q: "How do I calculate construction cost per square foot?",
    a: "Add up material cost (cement, steel, bricks, sand, aggregate, finishes) plus labour cost, then divide by the built-up area. This calculator does that math for you: pick a city and plot area, and it splits the total into 13 categories with a ₹/sq.ft figure.",
  },
  {
    q: "How much does it cost to build a house?",
    a: "For a mid-range (Medium quality) build in India, expect roughly ₹1,400–₹1,900 per sq.ft including material and labour, before GST. The exact number depends heavily on your city, quality tier, and design complexity — use the calculator above with your own plot size for a tailored figure.",
  },
  {
    q: "How much cement is required for a 1000 sq ft house?",
    a: "A common thumb rule is about 0.4 bags of cement per sq.ft of built-up area for a standard RCC-framed home, so a 1,000 sq.ft house typically needs around 400 bags. This varies with the structural design and number of floors.",
  },
  {
    q: "How much steel is required for 1000 sq ft?",
    a: "TMT steel usage typically runs 4–4.5 kg per sq.ft for a framed structure, so a 1,000 sq.ft home needs roughly 4,000–4,500 kg. Taller or more heavily reinforced designs will need more.",
  },
  {
    q: "How much sand is required for 1000 sq ft?",
    a: "Expect around 1.7–2 cu ft of sand per sq.ft of built-up area across foundation, plastering and flooring work — roughly 1,700–2,000 cu ft for a 1,000 sq.ft home.",
  },
  {
    q: "Which cement is best for house construction — OPC or PPC?",
    a: "OPC (Ordinary Portland Cement) gains strength faster and suits RCC structural work like columns and slabs. PPC (Portland Pozzolana Cement) cures slower but is more durable against moisture and is often preferred for plastering and mass concrete. Many builders use OPC for structure and PPC elsewhere.",
  },
  {
    q: "Which steel is best for house construction?",
    a: "Fe 500 and Fe 500D TMT bars are the most common choice for residential construction — Fe 500D offers better ductility and earthquake resistance, which is why it's often preferred for seismic zones.",
  },
  {
    q: "How accurate are these prices?",
    a: "This is a planning-stage estimate, typically accurate to about ±10%. It is built from regional rate averages rather than live vendor quotes, so treat it as a budgeting starting point — always confirm final numbers with local suppliers and your contractor before committing.",
  },
  {
    q: "Which materials does HomeRun deliver in 60 minutes?",
    a: "Cement, TMT steel, bricks, aggregate, sand, tiles, windows, sanitaryware, doors, paint and modular-kitchen units are all available for fast delivery — look for the 60-min badge next to a line item in the table above.",
  },
];

export const HOW_CALCULATED = [
  {
    icon: LineChart,
    title: "Real market rates",
    body: "Built from verified material and labour rate averages, checked periodically against typical supplier pricing.",
  },
  {
    icon: MapPin,
    title: "Priced for your city",
    body: "Every city maps to a regional price multiplier, so your estimate reflects local conditions — not a flat national average.",
  },
  {
    icon: Receipt,
    title: "Transparent math",
    body: "Quantities and rates are shown for every material, line by line — no black-box totals.",
  },
  {
    icon: SlidersHorizontal,
    title: "Built to your budget",
    body: "Switch any material between Basic, Medium and Premium to match the quality you're planning.",
  },
];