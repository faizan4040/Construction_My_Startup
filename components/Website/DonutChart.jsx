"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCompactINR } from "@/lib/calculate";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-ink text-white text-xs px-3 py-2 shadow-lg">
      <div className="font-semibold">{d.name}</div>
      <div>
        {formatCompactINR(d.value)} · {d.pct}%
      </div>
    </div>
  );
}

export default function DonutChart({ rows, total }) {
  const data = rows.map((r) => ({
    name: r.name,
    value: r.cost,
    color: r.color,
    pct: total > 0 ? Math.round((r.cost / total) * 100) : 0,
  }));

  return (
    // flex (not grid) so the chart keeps a fixed size via shrink-0 and the
    // legend takes exactly what's left via flex-1 min-w-0 — this can't
    // squish/overlap even when the parent puts this card in a 2-col grid.
    // Only stacks vertically on true small screens (< sm, ~640px).
    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
      {/* ---- LEFT: donut ---- */}
      <div className="relative w-52 h-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={1}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-ink/50">Total build</span>
          <span className="text-lg font-display font-semibold text-ink">
            {formatCompactINR(total)}
          </span>
          <span className="text-xs text-ink/50">{rows.length} categories</span>
        </div>
      </div>

      {/* ---- RIGHT: legend / detail list ---- */}
      <ul className="w-full flex-1 min-w-0 grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="truncate text-ink/80">{d.name}</span>
            </span>
            <span className="font-medium text-ink shrink-0">{d.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}