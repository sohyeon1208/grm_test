"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";
import { deriveContractItem } from "@/lib/contractItem";

type Props = { customers: Customer[] };

// 영업단계 표시 순서 (시트에 없는 값은 뒤에 자동 추가)
const STAGE_ORDER = ["제안", "계약완료", "계약종료", "계약실패"];

// 단계별 색상
function stageColor(stage: string, isDark: boolean): string {
  if (stage.includes("완료")) return isDark ? "#00CFAA" : "#0aa78c";
  if (stage.includes("종료")) return isDark ? "#9aa0b4" : "#6b7280";
  if (stage.includes("실패")) return isDark ? "#ff6b6b" : "#e0586b";
  if (stage.includes("제안")) return isDark ? "#7B70EE" : "#5b50d6";
  return isDark ? "#7B70EE" : "#5b50d6";
}

function dDay(mdate: string): { label: string; tone: "danger" | "warn" | "muted" | "ok" } {
  if (!mdate) return { label: "", tone: "muted" };
  const d = new Date(mdate);
  if (Number.isNaN(d.getTime())) return { label: "", tone: "muted" };
  const diff = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return { label: "만료", tone: "muted" };
  if (diff <= 7) return { label: `D-${diff}`, tone: "danger" };
  if (diff <= 30) return { label: `D-${diff}`, tone: "warn" };
  return { label: `D-${diff}`, tone: "ok" };
}

export default function CustomerKanban({ customers }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;

  const columns = useMemo(() => {
    const map = new Map<string, Customer[]>();
    for (const c of customers) {
      const stage = c.영업단계.trim() || "미분류";
      if (!map.has(stage)) map.set(stage, []);
      map.get(stage)!.push(c);
    }
    // 정렬: 알려진 순서 우선, 나머지는 가나다순
    const keys = [...map.keys()].sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a);
      const ib = STAGE_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    return keys.map((k) => ({ stage: k, items: map.get(k)! }));
  }, [customers]);

  const toneColor: Record<string, string> = {
    danger: "#ff6b6b",
    warn: "#ffb86b",
    muted: T.text.muted,
    ok: isDark ? "#00CFAA" : "#0aa78c",
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const c = stageColor(col.stage, isDark);
        return (
          <div key={col.stage} className="shrink-0" style={{ width: 280 }}>
            {/* 컬럼 헤더 */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-sm font-semibold" style={{ color: T.text.primary }}>
                {col.stage}
              </span>
              <span className="text-xs" style={{ color: T.text.muted }}>
                {col.items.length}
              </span>
            </div>

            {/* 카드 목록 */}
            <div className="space-y-2">
              {col.items.map((cust) => {
                const d = dDay(cust.계약만료일);
                const item = deriveContractItem({
                  계약항목: cust.계약항목,
                  그룹유형: cust.그룹유형,
                });
                const key = cust.영업활동명 || cust.그룹ID || cust.그룹명;
                return (
                  <Link
                    key={cust.rowIndex}
                    href={`/customers/${encodeURIComponent(key)}`}
                    className="block rounded-lg p-3 transition-colors"
                    style={{
                      background: T.bg.card,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <div
                      className="text-sm font-medium mb-1 leading-snug break-words"
                      style={{ color: T.text.primary }}
                    >
                      {cust.영업활동명 || cust.그룹명}
                    </div>
                    {cust.그룹명 && cust.영업활동명 && (
                      <div className="text-xs mb-2" style={{ color: T.text.muted }}>
                        {cust.그룹명}
                      </div>
                    )}
                    <div className="flex items-center flex-wrap gap-1.5">
                      {item && (
                        <span
                          className="text-[11px] px-1.5 py-0.5 rounded"
                          style={{
                            background: isDark
                              ? "rgba(123,112,238,0.18)"
                              : "rgba(123,112,238,0.10)",
                            color: isDark ? "#bcb3ff" : "#5b50d6",
                          }}
                        >
                          {item}
                        </span>
                      )}
                      {cust.요금 && (
                        <span className="text-[11px]" style={{ color: T.text.secondary }}>
                          {cust.요금}
                        </span>
                      )}
                      {d.label && (
                        <span
                          className="text-[11px] ml-auto font-medium"
                          style={{ color: toneColor[d.tone] }}
                        >
                          {d.label}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
              {col.items.length === 0 && (
                <div className="text-xs px-1 py-3" style={{ color: T.text.muted }}>
                  없음
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
