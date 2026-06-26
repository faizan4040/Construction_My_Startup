"use client"

import {
  Package, Blocks, Construction, Mountain, LayoutGrid, PaintBucket, TreePine, HardHat,
} from "lucide-react"

const STYLE_MAP = [
  { keys: ["cement"], icon: Package, active: "border-stone-500 bg-stone-100 text-stone-800", idle: "border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50" },
  { keys: ["brick"], icon: Blocks, active: "border-orange-500 bg-orange-100 text-orange-800", idle: "border-orange-200 text-orange-600 hover:border-orange-400 hover:bg-orange-50" },
  { keys: ["steel", "iron", "metal"], icon: Construction, active: "border-slate-500 bg-slate-100 text-slate-800", idle: "border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50" },
  { keys: ["sand"], icon: Mountain, active: "border-amber-500 bg-amber-100 text-amber-800", idle: "border-amber-200 text-amber-600 hover:border-amber-400 hover:bg-amber-50" },
  { keys: ["tile"], icon: LayoutGrid, active: "border-sky-500 bg-sky-100 text-sky-800", idle: "border-sky-200 text-sky-600 hover:border-sky-400 hover:bg-sky-50" },
  { keys: ["paint"], icon: PaintBucket, active: "border-rose-500 bg-rose-100 text-rose-800", idle: "border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50" },
  { keys: ["wood", "timber"], icon: TreePine, active: "border-lime-500 bg-lime-100 text-lime-800", idle: "border-lime-200 text-lime-600 hover:border-lime-400 hover:bg-lime-50" },
]

const DEFAULT_STYLE = {
  icon: HardHat,
  active: "border-orange-500 bg-orange-100 text-orange-800",
  idle: "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50",
}

function getStyle(name = "") {
  const lower = name.toLowerCase()
  return STYLE_MAP.find((s) => s.keys.some((k) => lower.includes(k))) || DEFAULT_STYLE
}

const MaterialCategorySelect = ({ options = [], selected, setSelected }) => {
  if (!options || options.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
        No categories found. Ask the admin to add material categories (Cement, Bricks, Steel...) first.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {options.map((cat) => {
        const { icon: Icon, active, idle } = getStyle(cat.name)
        const isSelected = selected === cat._id
        return (
          <button
            key={cat._id}
            type="button"
            onClick={() => setSelected(cat._id)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-all ${
              isSelected ? active : idle
            }`}
          >
            <Icon className="size-5" />
            <span className="text-center leading-tight">{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MaterialCategorySelect