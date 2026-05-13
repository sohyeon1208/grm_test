"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ServicePoint } from "@/lib/process";
import { formatKRW } from "@/lib/format";

type Props = { data: ServicePoint[] };

export default function CategoryPie({ data }: Props) {
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.87)" }}>
        서비스별 매출
      </h2>
      <div className="flex items-center gap-5">
        <div className="w-[180px] h-[180px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={84}
                dataKey="revenue"
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          {data.map((entry) => {
            const pct = total > 0 ? ((entry.revenue / total) * 100).toFixed(1) : "0.0";
            return (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: entry.color }}
                />
                <span
                  className="text-xs truncate flex-1"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {entry.name}
                </span>
                <span
                  className="text-xs tabular-nums flex-shrink-0"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
