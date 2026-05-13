"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyPoint } from "@/lib/process";
import { formatKRWShort, formatKRW } from "@/lib/format";

type Props = { data: MonthlyPoint[] };

export default function MonthlyChart({ data }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.87)" }}>
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
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatKRWShort}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={68}
          />
          <Tooltip
            contentStyle={{
              background: "#1C1E2E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.7)" }}
            itemStyle={{ color: "rgba(255,255,255,0.87)" }}
            formatter={(v: unknown) => [formatKRW(Number(v)), "매출액"]}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="revenue" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
