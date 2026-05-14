"use client";

import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";

type Props = { customer: Customer };

function dDay(mdate: string): { label: string; tone: "danger" | "warn" | "muted" | "ok" } {
  if (!mdate) return { label: "—", tone: "muted" };
  const d = new Date(mdate);
  if (Number.isNaN(d.getTime())) return { label: mdate, tone: "muted" };
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "만료", tone: "muted" };
  if (diff <= 7) return { label: `D-${diff}`, tone: "danger" };
  if (diff <= 30) return { label: `D-${diff}`, tone: "warn" };
  return { label: `D-${diff}`, tone: "ok" };
}

export default function CustomerHeader({ customer }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const c = customer;
  const d = dDay(c.계약만료일);

  const toneColor: Record<typeof d.tone, string> = {
    danger: "#ff6b6b",
    warn: "#ffb86b",
    muted: T.text.muted,
    ok: isDark ? "#00CFAA" : "#0aa78c",
  };

  return (
    <header
      className="px-6 py-5 mb-5 rounded-lg"
      style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
    >
      <div className="text-xs mb-1" style={{ color: T.text.muted }}>
        {c.그룹명 || "고객"}
      </div>
      <h1
        className="text-xl font-semibold leading-tight break-words"
        style={{ color: T.text.primary }}
      >
        {c.영업활동명 || c.그룹명}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
        {c.그룹ID && (
          <span
            className="px-2 py-1 rounded font-mono"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(26,28,51,0.05)",
              color: T.text.secondary,
            }}
          >
            {c.그룹ID}
          </span>
        )}
        {c.영업단계 && (
          <span
            className="px-2 py-1 rounded"
            style={{
              background: isDark ? "rgba(123,112,238,0.18)" : "rgba(123,112,238,0.12)",
              color: isDark ? "#bcb3ff" : "#5b50d6",
            }}
          >
            {c.영업단계}
          </span>
        )}
        <span
          className="px-2 py-1 rounded font-medium"
          style={{
            background: isDark
              ? `${toneColor[d.tone]}22`
              : `${toneColor[d.tone]}18`,
            color: toneColor[d.tone],
          }}
        >
          {d.label}
        </span>
      </div>
    </header>
  );
}
