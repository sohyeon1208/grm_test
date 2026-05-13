"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/lib/process";
import { 사업부문_COLORS, formatKRWShort, formatKRW } from "@/lib/format";

type Props = { data: TrendPoint[]; channels: string[] };

export default function WeeklyTrendChart({ data, channels }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.87)" }}>
        사업부문별 월별 매출 트렌드
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            {channels.map((ch) => {
              const color = 사업부문_COLORS[ch] ?? "#4A9EFF";
              return (
                <linearGradient key={ch} id={`trendGrad-${ch}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.55} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.04} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
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
            formatter={(v: unknown, name: unknown) => [formatKRW(Number(v)), String(name)]}
          />
          {channels.map((ch) => (
            <Area
              key={ch}
              type="monotone"
              dataKey={ch}
              stackId="1"
              stroke={사업부문_COLORS[ch] ?? "#4A9EFF"}
              fill={`url(#trendGrad-${ch})`}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex gap-4 flex-wrap mt-3">
        {channels.map((ch) => (
          <div key={ch} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2 rounded-sm"
              style={{ background: 사업부문_COLORS[ch] ?? "#4A9EFF" }}
            />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {ch}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
