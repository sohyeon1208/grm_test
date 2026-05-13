"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { MonthlyPoint } from "@/lib/process";
import { formatKRWShort, formatKRW } from "@/lib/format";
import type { ThemeTokens } from "@/lib/theme";
import { DARK } from "@/lib/theme";

type Props = { data: MonthlyPoint[]; theme?: ThemeTokens };

export default function MonthlyChart({ data, theme = DARK }: Props) {
  const { chart, text } = theme;
  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: text.primary }}>
        월별 매출 추이
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="32%">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFAA" />
              <stop offset="100%" stopColor="#7B70EE" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chart.grid} />
          <XAxis dataKey="label" tick={{ fill: chart.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatKRWShort} tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={68} />
          <Tooltip
            contentStyle={{ background: chart.tooltip.bg, border: `1px solid ${chart.tooltip.border}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: chart.label }}
            itemStyle={{ color: chart.item }}
            formatter={(v: unknown) => [formatKRW(Number(v)), "매출액"]}
            cursor={{ fill: chart.cursor }}
          />
          <Bar dataKey="revenue" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
