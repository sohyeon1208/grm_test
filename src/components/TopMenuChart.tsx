"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import type { TopPoint } from "@/lib/process";
import { formatKRWShort, formatKRW } from "@/lib/format";
import type { ThemeTokens } from "@/lib/theme";
import { DARK } from "@/lib/theme";

type Props = { data: TopPoint[]; theme?: ThemeTokens };

export default function TopMenuChart({ data, theme = DARK }: Props) {
  const { chart, text } = theme;
  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: text.primary }}>
        거래처 TOP 10
      </h2>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} layout="vertical" barCategoryGap="20%" margin={{ right: 56 }}>
          <defs>
            <linearGradient id="topBarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7B70EE" />
              <stop offset="100%" stopColor="#00CFAA" />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={false} stroke={chart.grid} />
          <XAxis type="number" tickFormatter={formatKRWShort} tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: chart.item, fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
          <Tooltip
            contentStyle={{ background: chart.tooltip.bg, border: `1px solid ${chart.tooltip.border}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: chart.label }}
            itemStyle={{ color: chart.item }}
            formatter={(v: unknown) => [formatKRW(Number(v)), "매출액"]}
            cursor={{ fill: chart.cursor }}
          />
          <Bar dataKey="revenue" fill="url(#topBarGrad)" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="count" position="right" style={{ fill: text.secondary, fontSize: 11 }} formatter={(v: unknown) => `${v}건`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
