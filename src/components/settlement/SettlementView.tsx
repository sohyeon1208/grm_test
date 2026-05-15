"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";

/* ───────────────────────── 정산일 파싱 ───────────────────────── */

function parseSettlementDay(raw: string, year: number, month: number): number | null {
  if (!raw) return null;
  const t = raw.trim();
  if (t === "말일" || t === "말") return new Date(year, month, 0).getDate();
  const m = t.match(/(\d{1,2})/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  return d >= 1 && d <= 31 ? d : null;
}

/* ─────────────────────── 기간 필터 판정 ────────────────────── */

type Period = "오늘" | "이번주" | "이번달";
const PERIODS: Period[] = ["오늘", "이번주", "이번달"];

function matchesPeriod(day: number | null, period: Period, today: Date): boolean {
  if (day === null) return false;
  const todayD = today.getDate();

  if (period === "오늘") return day === todayD;

  if (period === "이번주") {
    const dow = today.getDay(); // 0=Sun
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = todayD + mondayOffset;
    const sunday = monday + 6;
    return day >= monday && day <= sunday;
  }

  return true; // 이번달 = 정산일 있으면 전부
}

/* ──────────────────── 정산 안내 템플릿 ─────────────────────── */

const TEMPLATES = [
  {
    label: "세금계산서",
    color: "#818cf8",
    border: "rgba(99,102,241,0.40)",
    bg: "rgba(99,102,241,0.10)",
    darkBg: "#4338ca",
    darkColor: "#fff",
    text: `안녕하세요,                 님
구루미         입니다.

구루미 비즈         사용료 확인 후 견적서 작성하여 송부드립니다.
사용 내역은 아래와 같으며, 청구 내역 확인 부탁드리겠습니다.

[청구 내역]
- 사용기간:
- 사용인원:
- 이용금액:
- 발행일자:
- 수신메일:

첨부자료 확인 부탁드리며,
확인 메일 주시면 위 내역으로 세금계산서 발행하겠습니다.

감사합니다.
    드림`,
  },
  {
    label: "카드결제",
    color: "#34d399",
    border: "rgba(52,211,153,0.40)",
    bg: "rgba(52,211,153,0.10)",
    darkBg: "#065f46",
    darkColor: "#6ee7b7",
    text: `안녕하세요                 님,
구루미         입니다.

구루미 비즈         사용료에 대한 증빙서류 전달드립니다.
사용내역은 아래와 같으며, 청구내역 확인 부탁드리겠습니다.

[청구내역]
- 사용기간:
- 사용분수:

- 청구금액:

- 정산방법: 카드결제(결제링크)
전달드린 링크로 결제 부탁드리겠습니다.

감사합니다
    드림`,
  },
  {
    label: "나라빌 청구",
    color: "#fb923c",
    border: "rgba(251,146,60,0.40)",
    bg: "rgba(251,146,60,0.10)",
    darkBg: "#92400e",
    darkColor: "#fcd34d",
    text: `안녕하세요                 님,
구루미         입니다.

구루미 비즈         이용 견적서 전달드립니다.
최대 동시접속자 기준으로 견적서 작성되었습니다.

[청구내역]
사용기간:
사용자수:
청구금액:

확인 부탁드리며, 확인 후 회신주시면 나라빌 청구 진행하도록 하겠습니다.

감사합니다.
    드림`,
  },
];

/* ─────────────────────────── 메인 컴포넌트 ───────────────────── */

type Props = { customers: Customer[] };

export default function SettlementView({ customers }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const [period, setPeriod] = useState<Period>("이번달");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-based

  // 정산일 있는 고객만 필터 + 기간 필터 + 정산일 오름차순 정렬
  const filtered = useMemo(() => {
    return customers
      .filter((c) => {
        if (!c.정산일?.trim()) return false;
        const day = parseSettlementDay(c.정산일, year, month);
        return matchesPeriod(day, period, today);
      })
      .sort((a, b) => {
        const da = parseSettlementDay(a.정산일, year, month) ?? 99;
        const db = parseSettlementDay(b.정산일, year, month) ?? 99;
        return da - db;
      });
  }, [customers, period, today, year, month]);

  function copyTemplate(text: string, label: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  }

  const periodBtn = (active: boolean): React.CSSProperties => ({
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
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: T.text.primary }}>
            정산 캘린더
          </h1>
          <p className="text-sm mt-0.5" style={{ color: T.text.muted }}>
            {year}년 {month}월 · {filtered.length}건
          </p>
        </div>

        {/* 정산 안내 템플릿 복사 버튼 3종 */}
        <div className="flex items-center gap-2 flex-wrap">
          {TEMPLATES.map((tpl) => {
            const isCopied = copiedLabel === tpl.label;
            return (
              <button
                key={tpl.label}
                onClick={() => copyTemplate(tpl.text, tpl.label)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                style={{
                  background: isCopied
                    ? tpl.color
                    : isDark ? tpl.darkBg : tpl.bg,
                  color: isCopied
                    ? "#fff"
                    : isDark ? tpl.darkColor : tpl.color,
                  border: `1px solid ${isCopied ? tpl.color : tpl.border}`,
                  cursor: "pointer",
                }}
              >
                {isCopied ? "✓ 복사됨" : `📋 ${tpl.label}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 기간 필터 */}
      <div className="flex items-center gap-2 mb-6">
        {PERIODS.map((p) => (
          <button key={p} onClick={() => setPeriod(p)} style={periodBtn(period === p)}>
            {p}
          </button>
        ))}
      </div>

      {/* 고객사 카드 목록 */}
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
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}
        >
          {filtered.map((c) => {
            const key = c.영업활동명 || c.그룹ID;
            const day = parseSettlementDay(c.정산일, year, month);
            const isToday = day === today.getDate();

            return (
              <div
                key={key}
                className="rounded-xl p-5 flex flex-col gap-3"
                style={{
                  background: T.bg.card,
                  border: `1px solid ${isToday
                    ? isDark ? "rgba(0,207,170,0.5)" : "rgba(10,167,140,0.4)"
                    : T.border}`,
                  minHeight: 200,
                }}
              >
                {/* 카드 상단 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs mb-0.5 truncate" style={{ color: T.text.muted }}>
                      {c.그룹명 || "—"}
                    </p>
                    <p className="font-semibold text-sm leading-snug" style={{ color: T.text.primary }}>
                      {c.영업활동명 || c.그룹명}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{
                      background: isToday
                        ? isDark ? "rgba(0,207,170,0.20)" : "rgba(10,167,140,0.12)"
                        : isDark ? "rgba(255,255,255,0.08)" : "rgba(26,28,51,0.06)",
                      color: isToday
                        ? isDark ? "#00CFAA" : "#0aa78c"
                        : T.text.secondary,
                    }}
                  >
                    {c.정산일} {isToday && "· 오늘"}
                  </span>
                </div>

                {/* 정산 정보 */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs flex-1">
                  {[
                    { label: "정산주기", value: c.정산주기 },
                    { label: "요금", value: c.요금 },
                    { label: "청구방법", value: c.청구방법 },
                    { label: "정산방법", value: c.정산방법 },
                    { label: "정산담당자", value: c.정산담당자 },
                    { label: "세금계산서", value: c.세금계산서고객사명 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-1.5 min-w-0">
                      <dt className="shrink-0" style={{ color: T.text.muted, minWidth: 52 }}>
                        {label}
                      </dt>
                      <dd className="truncate" style={{ color: T.text.primary }}>
                        {value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* 계약 비고 */}
                {c.계약비고 && (
                  <p
                    className="text-xs rounded-lg px-3 py-2 whitespace-pre-wrap"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(26,28,51,0.04)",
                      color: T.text.secondary,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    {c.계약비고}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
