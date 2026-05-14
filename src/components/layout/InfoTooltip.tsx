"use client";

import { useState } from "react";
import { useTheme } from "./ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";

/** 매출 대시보드 KpiCard와 동일한 ? 툴팁 패턴 */
export default function InfoTooltip({ text }: { text: string }) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold cursor-default select-none"
        style={{ border: `1px solid ${T.text.muted}`, color: T.text.muted }}
      >
        ?
      </span>
      {show && (
        <span
          className="absolute right-0 top-5 z-50 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-line w-64"
          style={{
            background: T.chart.tooltip.bg,
            border: `1px solid ${T.chart.tooltip.border}`,
            color: T.text.secondary,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
