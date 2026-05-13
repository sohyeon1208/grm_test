"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ChannelPoint } from "@/lib/process";
import { formatKRWShort, formatKRW } from "@/lib/format";

type Props = { data: ChannelPoint[] };

function ChannelTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChannelPoint }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const { color } = payload[0].payload;
  return (
    <div
      style={{
        background: "#1C1E2E",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{label}</p>
      <p style={{ color }}>
        매출액 : {formatKRW(payload[0].value)}
      </p>
    </div>
  );
}

export default function ChannelChart({ data }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.87)" }}>
        사업부문별 매출
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
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
            width={84}
          />
          <Tooltip content={<ChannelTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
