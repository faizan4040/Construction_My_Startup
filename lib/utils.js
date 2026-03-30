import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



export const sizes = [
  { label: "UK 1 (Kids)", value: "1" },
  { label: "UK 2 (Kids)", value: "2" },
  { label: "UK 3 (Kids)", value: "3" },
  { label: "UK 4 (Kids)", value: "4" },
  { label: "UK 5 (Kids)", value: "5" },
  { label: "UK 6 (Kids)", value: "6" },

  { label: "UK 3 (Women)", value: "3-w" },
  { label: "UK 4 (Women)", value: "4-w" },
  { label: "UK 5 (Women)", value: "5-w" },
  { label: "UK 6 (Women)", value: "6-w" },
  { label: "UK 7 (Women)", value: "7-w" },
  { label: "UK 8 (Women)", value: "8-w" },
  { label: "UK 9 (Women)", value: "9-w" },

  { label: "UK 7 (Men)", value: "7" },
  { label: "UK 7.5 (Men)", value: "7.5" },
  { label: "UK 8 (Men)", value: "8" },
  { label: "UK 8.5 (Men)", value: "8.5" },
  { label: "UK 9 (Men)", value: "9" },
  { label: "UK 9.5 (Men)", value: "9.5" },
  { label: "UK 10 (Men)", value: "10" },
  { label: "UK 10.5 (Men)", value: "10.5" },
  { label: "UK 11 (Men)", value: "11" },
  { label: "UK 11.5 (Men)", value: "11.5" },
  { label: "UK 12.5 (Men)", value: "12.5" },
  { label: "UK 13.5 (Men)", value: "13.5" },
];





export const sortings = [
  {label: 'Default Sorting', value: 'default_sorting'},
  {label: 'Ascending Order', value: 'asc'},
  {label: 'Descending Order', value: 'desc'},
  {label: 'Price: Low To High', value: 'price_low_high'},
  {label: 'Price: High To Low', value: 'price_high_low'},
]


export const orderstatus =  ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'unverified']

