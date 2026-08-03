"use client";

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildSevenDayData, formatCurrency } from "@/lib/calculations";
import type { ShiftEntry } from "@/lib/types";

export function SevenDayChart({ entries }: { entries: ShiftEntry[] }) {
  const data = buildSevenDayData(entries);
  const summary = data.map((point) => `${point.date}: ${formatCurrency(point.netEarnings)}`).join(", ");
  return (
    <section className="card p-4">
      <h2 className="text-xs font-medium text-slate-500">Last 7 days</h2>
      <p className="sr-only">{summary}</p>
      <div className="mt-3 h-32" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis hide domain={[(minimum: number) => Math.min(0, minimum), (maximum: number) => Math.max(0, maximum)]} />
            <ReferenceLine y={0} stroke="#e2e8f0" />
            <Tooltip
              cursor={{ fill: "rgba(21,128,61,0.05)" }}
              formatter={(value: number) => [formatCurrency(value), "Net"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8e2", fontFamily: "var(--font-sans)" }}
            />
            <Bar dataKey="netEarnings" radius={[4, 4, 4, 4]} maxBarSize={26}>
              {data.map((point) => <Cell key={point.date} fill={point.netEarnings < 0 ? "#dc2626" : point.netEarnings === 0 ? "#e2e8f0" : "#86efac"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
