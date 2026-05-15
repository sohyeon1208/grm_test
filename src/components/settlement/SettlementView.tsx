"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";

type Period = "오늘" | "이번주" | "이번달";

const PERIODS: Period[] = ["오늘", "이번주", "이번달"];

/**
 * 정산일 문자열에서 날짜(1~31) 파싱.
 * "15일", "15", "말일" → 숫자 반환 (말일 → 해당월 마지막 날)
 */
function parseSettlementDay(raw: string, year: number, month: number): number | null {
  if (!raw) return null;
  const t = raw.trim();
  if (t === "말일" || t === "말") {
    return new Date(year, month, 0).getDate(); // month+1의 0일 = month의 마지막 날
  }
  const m = t.match(/(\d{1,2})/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  if (d < 1 || d > 31) return null;
  return d;
}

function isInPeriod(day: number | null, period: Period, today: Date): boolean {
  if (day === null) return false;
  const y = today.getFullYear();
  const mo = today.getMonth(); // 0-based
  const todayD = today.getDate();

  if (period === "오늘") return day === todayD;

  if (period === "이번주") {
    // 이번 주 월~일 날짜 범위
    const dow = today.getDay(); // 0=Sun
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(today);
    monday.setDate(todayD + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // 같은 달 내 범위만 비교 (단순화)
    const startD = monday.getMonth() === mo ? monday.getDate() : 1;
    const endD = sunday.getMonth() === mo ? sunday.getDate() : new Date(y, mo + 1, 0).getDate();
    return day >= startD && day <= endD;
  }

  if (period === "이번달") return true; // 정산일이 있으면 이번달 해당

  return false;
}

function dDay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "만료";
  if (diff === 0) return "D-0";
  return `D-${diff}`;
}

function copyTemplate(c: Customer) {
  const text = [
    `[정산 안내] ${c.세금계산서고객사명 || c.영업활동명}`,
    ``,
    `안녕하세요,`,
    `${c.세금계산서고객사명 || c.그룹명} 정산 관련 안내드립니다.`,
    ``,
    `· 서비스: ${c.계약항목 || c.그룹유형 || "—"}`,
    `· 요금: ${c.요금 || "—"}`,
    `· 정산주기: ${c.정산주기 || "—"}`,
    `· 정산일: ${c.정산일 || "—"}`,
    `· 청구방법: ${c.청구방법 || "—"}`,
    `· 정산방법: ${c.정산방법 || "—"}`,
    ``,
    `감사합니다.`,
  ].join("\n");
  navigator.clipboard.writeText(text).catch(() => {});
}

type Props = { customers: Customer[] };

export default function SettlementView({ customers }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const [period, setPeriod] = useState<Period>("이번달");
  const [copied, setCopied] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);

  // 정산일이 있는 고객 + 선택 기간에 해당하는 고객
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (!c.정산일) return false;
      const day = parseSettlementDay(c.정산일, today.getFullYear(), today.getMonth() + 1);
      return isInPeriod(day, period, today);
    }).sort((a, b) => {
      const da = parseSettlementDay(a.정산일, today.getFullYear(), today.getMonth() + 1) ?? 99;
      const db = parseSettlementDay(b.정산일, today.getFullYear(), today.getMonth() + 1) ?? 99;
      return da - db;
    });
  }, [customers, period, today]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 20px",
    borderRadius: "999px",
    fontSize: "0.875rem",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    border: active ? "none" : `1px solid ${T.border}`,
    background: active ? "linear-gradient(90deg, #7B70EE, #00CFAA)" : T.bg.card,
    color: active ? "#fff" : T.text.secondary,
    transition: "all 0.15s",
  });

  return (
    <div className="px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: T.text.primary }}>정산 캘린더</h1>
          <p className="text-sm mt-0.5" style={{ color: T.text.muted }}>
            정산일 기준으로 대상 고객사를 확인합니다
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background: T.bg.card, border: `1px solid ${T.border}`, color: T.text.muted }}
        >
          {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일
        </div>
      </div>

      {/* 기간 탭 */}
      <div className="flex items-center gap-2 mb-6">
        {PERIODS.map((p) => (
          <button key={p} onClick={() => setPeriod(p)} style={tabStyle(period === p)}>
            {p}
          </button>
        ))}
        <span className="text-xs ml-2" style={{ color: T.text.muted }}>
          {filtered.length}건
        </span>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl"
          style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
        >
          <span className="text-3xl mb-3">📭</span>
          <p className="text-sm" style={{ color: T.text.muted }}>
            {period} 정산 대상 고객이 없습니다
          </p>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {filtered.map((c) => {
            const key = c.영업활동명 || c.그룹ID;
            const isCopied = copied === key;
            const dd = dDay(c.계약만료일);

            return (
              <div
                key={key}
                className="rounded-xl p-5 flex flex-col gap-3"
                style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
              >
                {/* 상단 */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: T.text.muted }}>
                      {c.그룹명 || "—"}
                    </p>
                    <p className="font-semibold text-sm leading-tight" style={{ color: T.text.primary }}>
                      {c.영업활동명 || c.그룹명}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{
                        background: isDark ? "rgba(0,207,170,0.15)" : "rgba(10,167,140,0.10)",
                        color: isDark ? "#00CFAA" : "#0aa78c",
                      }}
                    >
                      {c.정산일} 정산
                    </span>
                    {dd && (
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded"
                        style={{
                          background: dd === "만료" ? "rgba(107,114,128,0.15)" : "rgba(239,68,68,0.10)",
                          color: dd === "만료" ? T.text.muted : "#ef4444",
                        }}
                      >
                        계약 {dd}
                      </span>
                    )}
                  </div>
                </div>

                {/* 정산 정보 */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {[
                    { label: "정산주기", value: c.정산주기 },
                    { label: "요금", value: c.요금 },
                    { label: "청구방법", value: c.청구방법 },
                    { label: "정산방법", value: c.정산방법 },
                    { label: "정산담당자", value: c.정산담당자 },
                    { label: "세금계산서", value: c.세금계산서고객사명 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-1.5">
                      <dt style={{ color: T.text.muted, minWidth: 56 }}>{label}</dt>
                      <dd style={{ color: T.text.primary }}>{value || "—"}</dd>
                    </div>
                  ))}
                </dl>

                {/* 비고 */}
                {c.계약비고 && (
                  <p
                    className="text-xs rounded p-2 whitespace-pre-wrap"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(26,28,51,0.04)",
                      color: T.text.secondary,
                    }}
                  >
                    {c.계약비고}
                  </p>
                )}

                {/* 이메일 템플릿 복사 버튼 */}
                <button
                  onClick={() => {
                    copyTemplate(c);
                    setCopied(key);
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="text-xs px-3 py-1.5 rounded-md w-full text-center font-medium transition-all"
                  style={{
                    background: isCopied
                      ? (isDark ? "rgba(0,207,170,0.15)" : "rgba(10,167,140,0.10)")
                      : (isDark ? "rgba(99,102,241,0.10)" : "rgba(91,80,214,0.07)"),
                    color: isCopied
                      ? (isDark ? "#00CFAA" : "#0aa78c")
                      : (isDark ? "#a5b4fc" : "#5b50d6"),
                    border: `1px solid ${isCopied ? (isDark ? "rgba(0,207,170,0.3)" : "rgba(10,167,140,0.3)") : (isDark ? "rgba(99,102,241,0.3)" : "rgba(91,80,214,0.25)")}`,
                    cursor: "pointer",
                  }}
                >
                  {isCopied ? "✓ 복사됨" : "📋 정산 안내 템플릿 복사"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
