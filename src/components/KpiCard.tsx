"use client";

import { useState } from "react";
import type { ThemeTokens } from "@/lib/theme";
import { DARK } from "@/lib/theme";

type Props = {
  label: string;
  value: string;
  trend?: "positive" | "negative" | "neutral";
  trendValue?: string;
  tooltip?: string;
  theme?: ThemeTokens;
};

export default function KpiCard({ label, value, trend, trendValue, tooltip, theme = DARK }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const trendColor =
    trend === "positive" ? "text-emerald-500"
    : trend === "negative" ? "text-pink-500"
    : "";

  const trendSymbol = trend === "positive" ? "▲" : trend === "negative" ? "▼" : "";

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: theme.bg.card,
        border: `1px solid ${theme.border}`,
        boxShadow: theme === DARK ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* 라벨 + 물음표 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wider uppercase" style={{ color: theme.text.secondary }}>
          {label}
        </span>
        {tooltip && (
          <div className="relative flex-shrink-0" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold cursor-default select-none"
              style={{ border: `1px solid ${theme.text.muted}`, color: theme.text.muted }}
            >
              ?
            </span>
            {showTooltip && (
              <div
                className="absolute right-0 top-5 z-50 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-line w-56"
                style={{
                  background: theme.chart.tooltip.bg,
                  border: `1px solid ${theme.chart.tooltip.border}`,
                  color: theme.text.secondary,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 값 */}
      <span className="text-2xl font-bold leading-tight" style={{ color: theme.text.primary }}>
        {value}
      </span>

      {/* 트렌드 */}
      {trendValue && (
        <span className={`text-xs font-medium ${trendColor}`} style={!trend || trend === "neutral" ? { color: theme.text.muted } : {}}>
          {trendSymbol && `${trendSymbol} `}{trendValue}
        </span>
      )}
    </div>
  );
}
