"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import type { TopPoint } from "@/lib/process";
import { formatKRWShort, formatKRW } from "@/lib/format";

type Props = { data: TopPoint[] };

export default function TopMenuChart({ data }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.87)" }}>
        거래처 TOP 10
      </h2>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap="20%"
          margin={{ right: 56 }}
        >
          <defs>
            <linearGradient id="topBarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7B70EE" />
              <stop offset="100%" stopColor="#00CFAA" />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number"
            tickFormatter={formatKRWShort}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={100}
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
          <Bar dataKey="revenue" fill="url(#topBarGrad)" radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              formatter={(v: unknown) => `${v}건`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
