"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { SalesRow } from "@/lib/sheets";
import { processRaw } from "@/lib/process";
import { formatKRW } from "@/lib/format";
import { LIGHT } from "@/lib/theme";
import KpiCard from "./KpiCard";
import FilterRow from "./FilterRow";
import MonthlyChart from "./MonthlyChart";
import ChannelChart from "./ChannelChart";
import CategoryPie from "./CategoryPie";
import WeeklyTrendChart from "./WeeklyTrendChart";
import TopMenuChart from "./TopMenuChart";

const T = LIGHT;

type Props = { rows: SalesRow[] };

export default function DashboardLight({ rows }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hasAnyFilter = !!(
    searchParams.get("year") || searchParams.get("month") ||
    searchParams.get("division") || searchParams.get("service") || searchParams.get("customer")
  );
  const resetFilters = () => router.push("?", { scroll: false });

  const [showDivision, setShowDivision] = useState(false);
  const [showService,  setShowService]  = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);

  const yearStr  = searchParams.get("year")     ?? undefined;
  const monthStr = searchParams.get("month")    ?? undefined;
  const division = searchParams.get("division") ?? undefined;
  const service  = searchParams.get("service")  ?? undefined;
  const customer = searchParams.get("customer") ?? undefined;

  const year  = yearStr  ? parseInt(yearStr)  : undefined;
  const month = monthStr ? parseInt(monthStr) : undefined;

  const data = useMemo(
    () => processRaw(rows, { year, month, division, service, customer }),
    [rows, year, month, division, service, customer]
  );

  const growthTrend = data.growthRate > 0 ? "positive" : data.growthRate < 0 ? "negative" : "neutral";
  const yoyTrend    = data.yoyRate    > 0 ? "positive" : data.yoyRate    < 0 ? "negative" : "neutral";
  const cagrTrend   = data.cagrRate   > 0 ? "positive" : data.cagrRate   < 0 ? "negative" : "neutral";

  const hasTimeFilter = !!month;
  const isYearOnly    = !!year && !month;

  const activeFilters = [
    yearStr  ? `${yearStr}년`  : null,
    monthStr ? `${monthStr}월` : null,
    division ?? null, service ?? null, customer ?? null,
  ].filter(Boolean) as string[];

  /* ─ 카드 섹션 ─ */
  const cardSection = hasTimeFilter ? (
    <>
      <KpiCard label="월 평균 매출" value={formatKRW(data.monthlyAvg)} theme={T} />
      <KpiCard label="매출 성장률" value={`${data.growthRate >= 0 ? "+" : ""}${data.growthRate.toFixed(1)}%`} trend={growthTrend} trendValue="전월 대비" theme={T} />
      <KpiCard label="매출 성장률" value={`${data.yoyRate >= 0 ? "+" : ""}${data.yoyRate.toFixed(1)}%`} trend={yoyTrend} trendValue="전년 동월 대비" theme={T} />
    </>
  ) : isYearOnly ? (
    <>
      <KpiCard label="활성 거래처 수" value={`${data.activeCustomers.toLocaleString("ko-KR")}개사`} theme={T} />
      <KpiCard label="최고 매출 월" value={data.peakMonth} theme={T} />
      <KpiCard label="연평균 성장률" value={`${data.yoyPeriodRate >= 0 ? "+" : ""}${data.yoyPeriodRate.toFixed(1)}%`}
        trend={data.yoyPeriodRate > 0 ? "positive" : data.yoyPeriodRate < 0 ? "negative" : "neutral"}
        trendValue="전년 동기 대비"
        tooltip={`전년 동기 대비 계산 방식\n\n선택 연도의 최신 월까지 합계를\n전년 동일 기간 합계와 비교합니다.`}
        theme={T}
      />
    </>
  ) : (
    <>
      <KpiCard label="활성 거래처 수" value={`${data.activeCustomers.toLocaleString("ko-KR")}개사`} theme={T} />
      <KpiCard label="연평균 성장률" value={`${data.cagrRate >= 0 ? "+" : ""}${data.cagrRate.toFixed(1)}%`}
        trend={cagrTrend} trendValue="CAGR"
        tooltip={`CAGR (연평균 복합 성장률)\n\n첫 해와 마지막 해의 연간 매출 기준\n연평균 성장률입니다.`}
        theme={T}
      />
      <KpiCard label="월평균 성장률" value={`${data.avgMoMRate >= 0 ? "+" : ""}${data.avgMoMRate.toFixed(1)}%`}
        trend={data.avgMoMRate > 0 ? "positive" : data.avgMoMRate < 0 ? "negative" : "neutral"}
        trendValue="월평균 MoM"
        tooltip={`월평균 성장률\n\n연속된 두 달의 증감률 평균입니다.`}
        theme={T}
      />
    </>
  );

  const cardBg = { background: T.bg.card, borderColor: T.border };
  const resetBtn = {
    active:   { bg: "rgba(26,28,51,0.06)", color: "rgba(26,28,51,0.5)",   border: "rgba(26,28,51,0.15)" },
    inactive: { bg: "transparent",          color: "rgba(26,28,51,0.2)",   border: "rgba(26,28,51,0.08)" },
    hover:    { bg: "rgba(255,107,74,0.1)", color: "#FF6B4A",              border: "rgba(255,107,74,0.3)" },
  };

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: T.bg.page }}>

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#00CFAA" }}>
            Sales Dashboard
          </p>
          <h1 className="text-2xl font-bold" style={{ color: T.text.primary }}>
            구루미 매출 현황
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-sm" style={{ color: T.text.secondary }}>{data.periodLabel}</p>
            {activeFilters.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,207,170,0.12)", color: "#00CFAA", border: "1px solid rgba(0,207,170,0.3)" }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── 필터 패널 ── */}
        <div className="rounded-2xl border" style={{ borderColor: T.border, background: T.bg.card, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          {/* 헤더 */}
          <div className="px-4 pt-3 pb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.text.secondary }}>기간</span>
            <button
              onClick={resetFilters}
              disabled={!hasAnyFilter}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: hasAnyFilter ? resetBtn.active.bg : resetBtn.inactive.bg,
                color:      hasAnyFilter ? resetBtn.active.color : resetBtn.inactive.color,
                border: `1px solid ${hasAnyFilter ? resetBtn.active.border : resetBtn.inactive.border}`,
                cursor: hasAnyFilter ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (!hasAnyFilter) return;
                (e.currentTarget as HTMLButtonElement).style.background = resetBtn.hover.bg;
                (e.currentTarget as HTMLButtonElement).style.color = resetBtn.hover.color;
                (e.currentTarget as HTMLButtonElement).style.borderColor = resetBtn.hover.border;
              }}
              onMouseLeave={(e) => {
                if (!hasAnyFilter) return;
                (e.currentTarget as HTMLButtonElement).style.background = resetBtn.active.bg;
                (e.currentTarget as HTMLButtonElement).style.color = resetBtn.active.color;
                (e.currentTarget as HTMLButtonElement).style.borderColor = resetBtn.active.border;
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
              초기화
            </button>
          </div>

          {/* 연도 · 월 */}
          <div className="px-4 pt-2 pb-3 flex flex-col gap-3">
            <FilterRow label="연도" paramKey="year" options={data.filterOptions.years} formatLabel={(v) => `${v}년`} theme={T} />
            <FilterRow label="월"   paramKey="month" options={data.filterOptions.months} formatLabel={(v) => `${v}월`} theme={T} />
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: T.divider }} />

          {/* 비즈니스 필터 토글 */}
          <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
            {[
              { label: "사업부문", show: showDivision, setShow: setShowDivision, paramKey: "division", options: data.filterOptions.divisions },
              { label: "서비스",   show: showService,  setShow: setShowService,  paramKey: "service",  options: data.filterOptions.services  },
              { label: "고객사",   show: showCustomer, setShow: setShowCustomer, paramKey: "customer", options: data.filterOptions.customers  },
            ].map(({ label, show, setShow, paramKey, options }) => (
              <div key={paramKey}>
                <button
                  onClick={() => setShow((v) => !v)}
                  className="flex items-center gap-1.5 py-1 text-xs font-semibold transition-colors duration-200"
                  style={{ color: show ? "#00CFAA" : T.text.primary }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: show ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  {label}
                </button>
                {show && (
                  <div className="mt-1.5 pl-4">
                    <FilterRow label="" paramKey={paramKey} options={options} theme={T} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard label="총 매출" value={formatKRW(data.totalRevenue)} theme={T} />
        <KpiCard label="총 거래 수" value={`${data.totalDeals.toLocaleString("ko-KR")}건`} theme={T} />
        {cardSection}
      </div>

      {/* ── Monthly Chart ── */}
      <div className="rounded-2xl p-6 mb-6 border" style={{ ...cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <MonthlyChart data={data.monthlyData} theme={T} />
      </div>

      {/* ── Channel + Category ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl p-6 border" style={{ ...cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <ChannelChart data={data.channelData} theme={T} />
        </div>
        <div className="rounded-2xl p-6 border" style={{ ...cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <CategoryPie data={data.serviceData} theme={T} />
        </div>
      </div>

      {/* ── Trend ── */}
      <div className="rounded-2xl p-6 mb-6 border" style={{ ...cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <WeeklyTrendChart data={data.trendData} channels={data.trendChannels} theme={T} />
      </div>

      {/* ── Top 10 ── */}
      <div className="rounded-2xl p-6 border" style={{ ...cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <TopMenuChart data={data.topData} theme={T} />
      </div>
    </div>
  );
}
