"use client";

import { useState } from "react";

type Props = {
  label: string;
  value: string;
  trend?: "positive" | "negative" | "neutral";
  trendValue?: string;
  tooltip?: string; // 물음표 아이콘 hover 시 표시할 설명
};

export default function KpiCard({ label, value, trend, trendValue, tooltip }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const trendColor =
    trend === "positive"
      ? "text-emerald-400"
      : trend === "negative"
      ? "text-pink-400"
      : "text-white/50";

  const trendSymbol =
    trend === "positive" ? "▲" : trend === "negative" ? "▼" : "";

  return (
    <div className="bg-[#1C1E2E] rounded-2xl p-5 flex flex-col gap-2 border border-white/5">
      {/* 라벨 + 물음표 아이콘 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 tracking-wider uppercase">{label}</span>
        {tooltip && (
          <div
            className="relative flex-shrink-0"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold cursor-default select-none"
              style={{
                border: "1px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              ?
            </span>
            {showTooltip && (
              <div
                className="absolute right-0 top-5 z-50 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-line w-56"
                style={{
                  background: "#2A2D42",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 값 */}
      <span className="text-2xl font-bold leading-tight" style={{ color: "rgba(255,255,255,0.87)" }}>
        {value}
      </span>

      {/* 트렌드 */}
      {trendValue && (
        <span className={`text-xs font-medium ${trendColor}`}>
          {trendSymbol && `${trendSymbol} `}{trendValue}
        </span>
      )}
    </div>
  );
}
