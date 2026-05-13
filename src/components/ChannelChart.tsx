"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ChannelPoint } from "@/lib/process";
import { formatKRWShort, formatKRW } from "@/lib/format";
import type { ThemeTokens } from "@/lib/theme";
import { DARK } from "@/lib/theme";

type Props = { data: ChannelPoint[]; theme?: ThemeTokens };

function ChannelTooltip({
  active, payload, label, theme,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value: number; payload: ChannelPoint }>;
  label?: string;
  theme: ThemeTokens;
}) {
  if (!active || !payload?.length) return null;
  const { color } = payload[0].payload;
  return (
    <div style={{
      background: theme.chart.tooltip.bg,
      border: `1px solid ${theme.chart.tooltip.border}`,
      borderRadius: 8, padding: "8px 12px", fontSize: 12,
    }}>
      <p style={{ color: theme.chart.label, marginBottom: 4 }}>{label}</p>
      <p style={{ color }}>매출액 : {formatKRW(payload[0].value)}</p>
    </div>
  );
}

export default function ChannelChart({ data, theme = DARK }: Props) {
  const { chart, text } = theme;
  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: text.primary }}>
        사업부문별 매출
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
          <CartesianGrid horizontal={false} stroke={chart.grid} />
          <XAxis type="number" tickFormatter={formatKRWShort} tick={{ fill: chart.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: chart.item, fontSize: 12 }} axisLine={false} tickLine={false} width={84} />
          <Tooltip content={(props) => <ChannelTooltip {...props} theme={theme} />} cursor={{ fill: chart.cursor }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
