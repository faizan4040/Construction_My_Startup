import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



export const units = [
  { label: "Piece(s)", value: "pcs" },
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Quintal (100kg)", value: "quintal" },
  { label: "Ton", value: "ton" },
  { label: "Bag (50kg)", value: "bag" },
  { label: "Liter (L)", value: "litre" },
  { label: "Square Feet (sqft)", value: "sqft" },
  { label: "Running Feet (rft)", value: "rft" },
  { label: "Cubic Feet (cft)", value: "cft" },
  { label: "Bundle", value: "bundle" },
  { label: "Box", value: "box" },
  { label: "Roll", value: "roll" },
]




export const sortings = [
  {label: 'Default Sorting', value: 'default_sorting'},
  {label: 'Ascending Order', value: 'asc'},
  {label: 'Descending Order', value: 'desc'},
  {label: 'Price: Low To High', value: 'price_low_high'},
  {label: 'Price: High To Low', value: 'price_high_low'},
]


// export const orderstatus =  ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'unverified']

export const orderstatus = [
  'on_hold',       // default on creation — waiting for delivery boy to accept the pickup job
  'pending',       // delivery boy accepted pickup — waiting for shopowner to Accept/Cancel
  'ready_to_ship',  // shopowner accepted — packed, label generated, waiting for courier scan
  'shipped',       // courier scanned the label — in transit
  'delivered',     // reached customer
  'cancelled',     // cancelled by shopowner or customer
]