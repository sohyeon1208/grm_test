"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";

/* ───────────────────────── 정산일 파싱 ───────────────────────── */

function parseSettlementDay(raw: string): number {
  if (!raw) return 99;
  const t = raw.trim();
  if (t === "말일" || t === "말") return 31;
  const m = t.match(/(\d{1,2})/);
  if (!m) return 99;
  const d = parseInt(m[1], 10);
  return d >= 1 && d <= 31 ? d : 99;
}

/* ───────────────────── 정산 안내 템플릿 ─────────────────────── */

const TEMPLATES = [
  {
    label: "세금계산서",
    color: "#818cf8",
    bg: "rgba(99,102,241,0.10)",
    border: "rgba(99,102,241,0.35)",
    text: `안녕하세요,                 님
구루미 권소현입니다.

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
권소현 드림`,
  },
  {
    label: "카드결제",
    color: "#34d399",
    bg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.35)",
    text: `안녕하세요                 님,
구루미 권소현입니다.

구루미 비즈         사용료에 대한 증빙서류 전달드립니다.
사용내역은 아래와 같으며, 청구내역 확인 부탁드리겠습니다.

[청구내역]
- 사용기간:
- 사용분수:

- 청구금액:

- 정산방법: 카드결제(결제링크)
전달드린 링크로 결제 부탁드리겠습니다.

감사합니다
권소현 드림`,
  },
  {
    label: "나라빌 청구",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.10)",
    border: "rgba(251,146,60,0.35)",
    text: `안녕하세요                 님,
구루미 권소현입니다.

구루미 비즈         이용 견적서 전달드립니다.
최대 동시접속자 기준으로 견적서 작성되었습니다.

[청구내역]
사용기간:
사용자수:
청구금액:

확인 부탁드리며, 확인 후 회신주시면 나라빌 청구 진행하도록 하겠습니다.

감사합니다.
권소현 드림`,
  },
] as const;

/* ─────────────────────────── 메인 컴포넌트 ───────────────────── */

type Props = { customers: Customer[] };

export default function SettlementView({ customers }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // 정산일이 있는 고객만, 정산일 숫자 기준 오름차순 정렬
  const sorted = useMemo(
    () =>
      customers
        .filter((c) => c.정산일?.trim())
        .sort((a, b) => parseSettlementDay(a.정산일) - parseSettlementDay(b.정산일)),
    [customers]
  );

  function copyTemplate(text: string, label: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedTemplate(label);
    setTimeout(() => setCopiedTemplate(null), 2000);
  }

  return (
    <div className="px-6 py-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: T.text.primary }}>
          정산 캘린더
        </h1>
        <p className="text-sm mt-0.5" style={{ color: T.text.muted }}>
          정산일 순으로 정렬 · {sorted.length}개 고객사
        </p>
      </div>

      {/* ── 정산 안내 템플릿 섹션 ── */}
      <section
        className="rounded-xl p-5 mb-8"
        style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: T.text.primary }}>
          📨 정산 안내 메일 템플릿
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {TEMPLATES.map((tpl) => {
            const isCopied = copiedTemplate === tpl.label;
            return (
              <div
                key={tpl.label}
                className="rounded-lg p-4 flex flex-col gap-3"
                style={{ background: tpl.bg, border: `1px solid ${tpl.border}` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: tpl.color }}>
                    {tpl.label}
                  </span>
                  <button
                    onClick={() => copyTemplate(tpl.text, tpl.label)}
                    className="text-xs px-2.5 py-1 rounded font-medium transition-all"
                    style={{
                      background: isCopied ? tpl.color : "transparent",
                      color: isCopied ? "#fff" : tpl.color,
                      border: `1px solid ${tpl.border}`,
                      cursor: "pointer",
                    }}
                  >
                    {isCopied ? "✓ 복사됨" : "📋 복사"}
                  </button>
                </div>
                <pre
                  className="text-xs whitespace-pre-wrap leading-relaxed"
                  style={{ color: T.text.secondary, fontFamily: "inherit" }}
                >
                  {tpl.text}
                </pre>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 고객사 정산일 목록 ── */}
      {sorted.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
        >
          <span className="text-3xl mb-3">📭</span>
          <p className="text-sm" style={{ color: T.text.muted }}>
            정산일이 등록된 고객사가 없습니다
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${T.border}` }}>
          {/* 테이블 헤더 */}
          <div
            className="grid text-xs font-medium px-4 py-2"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr 2fr",
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(26,28,51,0.04)",
              color: T.text.muted,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span>고객사</span>
            <span>정산일</span>
            <span>정산주기</span>
            <span>요금</span>
            <span>청구방법</span>
            <span>정산담당자</span>
          </div>

          {/* 테이블 바디 */}
          {sorted.map((c, i) => {
            const day = parseSettlementDay(c.정산일);
            const today = new Date().getDate();
            const isToday = day === today;
            const isClose = Math.abs(day - today) <= 3 && day !== 99;

            return (
              <div
                key={c.영업활동명 || c.그룹ID || i}
                className="grid text-sm px-4 py-3 items-center"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr 2fr",
                  borderBottom: i < sorted.length - 1 ? `1px solid ${T.border}` : "none",
                  background: isToday
                    ? isDark ? "rgba(0,207,170,0.07)" : "rgba(10,167,140,0.05)"
                    : isClose
                    ? isDark ? "rgba(251,146,60,0.05)" : "rgba(251,146,60,0.04)"
                    : "transparent",
                }}
              >
                {/* 고객사명 */}
                <div>
                  <p className="font-medium truncate" style={{ color: T.text.primary }}>
                    {c.영업활동명 || c.그룹명}
                  </p>
                  {c.세금계산서고객사명 && c.세금계산서고객사명 !== c.영업활동명 && (
                    <p className="text-xs truncate" style={{ color: T.text.muted }}>
                      {c.세금계산서고객사명}
                    </p>
                  )}
                </div>

                {/* 정산일 */}
                <div>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{
                      background: isToday
                        ? isDark ? "rgba(0,207,170,0.20)" : "rgba(10,167,140,0.12)"
                        : isDark ? "rgba(255,255,255,0.07)" : "rgba(26,28,51,0.06)",
                      color: isToday
                        ? isDark ? "#00CFAA" : "#0aa78c"
                        : T.text.secondary,
                    }}
                  >
                    {c.정산일}
                  </span>
                  {isToday && (
                    <span className="ml-1.5 text-[10px]" style={{ color: isDark ? "#00CFAA" : "#0aa78c" }}>
                      오늘
                    </span>
                  )}
                </div>

                {/* 정산주기 */}
                <span className="text-xs" style={{ color: T.text.secondary }}>
                  {c.정산주기 || "—"}
                </span>

                {/* 요금 */}
                <span className="text-xs" style={{ color: T.text.secondary }}>
                  {c.요금 || "—"}
                </span>

                {/* 청구방법 */}
                <span className="text-xs" style={{ color: T.text.secondary }}>
                  {c.청구방법 || "—"}
                </span>

                {/* 정산담당자 */}
                <span className="text-xs" style={{ color: T.text.secondary }}>
                  {c.정산담당자 || "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
