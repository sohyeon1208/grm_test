"use client";

import Link from "next/link";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";

type Props = {
  customers: Customer[];
  q: string;
};

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  "계약": { bg: "rgba(0,207,170,0.15)", text: "#00cfaa" },
  "협의": { bg: "rgba(123,112,238,0.15)", text: "#9b8ff4" },
  "검토": { bg: "rgba(255,180,50,0.15)", text: "#ffb432" },
  "종료": { bg: "rgba(255,80,80,0.15)", text: "#ff6b6b" },
};

function stageColor(단계: string) {
  for (const [k, v] of Object.entries(STAGE_COLORS)) {
    if (단계.includes(k)) return v;
  }
  return null;
}

function dDayLabel(mdate: string): string | null {
  if (!mdate) return null;
  const d = new Date(mdate);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "만료";
  return `D-${diff}`;
}

export default function CustomerSearchResults({ customers, q }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;

  return (
    <div className="px-6 py-6 max-w-[900px] mx-auto">
      <div className="mb-5">
        <Link
          href="/customers"
          className="text-xs mb-3 inline-block"
          style={{ color: T.text.muted }}
        >
          ← 전체 고객사 보기
        </Link>
        <h1 className="text-base font-semibold" style={{ color: T.text.primary }}>
          &ldquo;{q}&rdquo; 검색 결과
          <span className="ml-2 text-sm font-normal" style={{ color: T.text.muted }}>
            {customers.length}건
          </span>
        </h1>
      </div>

      {customers.length === 0 && (
        <div
          className="rounded-lg py-12 text-center text-sm"
          style={{ background: T.bg.card, border: `1px solid ${T.border}`, color: T.text.muted }}
        >
          일치하는 고객사가 없습니다
        </div>
      )}

      <ul className="space-y-2">
        {customers.map((c) => {
          const key = c.영업활동명 || c.그룹ID || c.그룹명;
          const sc = stageColor(c.영업단계 ?? "");
          const dday = dDayLabel(c.계약만료일 ?? "");
          const isExpiringSoon =
            dday && dday !== "만료" && Number(dday.replace("D-", "")) <= 30;

          return (
            <li key={c.rowIndex}>
              <Link
                href={`/customers/${encodeURIComponent(key)}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                style={{
                  background: T.bg.card,
                  border: `1px solid ${T.border}`,
                  color: T.text.primary,
                  textDecoration: "none",
                  display: "flex",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.영업활동명 || c.그룹명}</div>
                  {c.그룹명 && c.영업활동명 && c.그룹명 !== c.영업활동명 && (
                    <div className="text-xs truncate mt-0.5" style={{ color: T.text.muted }}>
                      {c.그룹명}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.영업단계 && sc && (
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      {c.영업단계}
                    </span>
                  )}
                  {c.계약항목 && (
                    <span className="text-xs" style={{ color: T.text.muted }}>
                      {c.계약항목}
                    </span>
                  )}
                  {dday && (
                    <span
                      className="text-xs font-mono"
                      style={{
                        color:
                          dday === "만료"
                            ? T.text.muted
                            : isExpiringSoon
                            ? "#ff6b6b"
                            : T.text.secondary,
                      }}
                    >
                      {dday}
                    </span>
                  )}
                </div>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={T.text.muted}
                  strokeWidth="2"
                  className="shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
