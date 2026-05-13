"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { SalesRow } from "@/lib/sheets";
import { processRaw } from "@/lib/process";
import { formatKRW } from "@/lib/format";
import KpiCard from "./KpiCard";
import FilterRow from "./FilterRow";
import MonthlyChart from "./MonthlyChart";
import ChannelChart from "./ChannelChart";
import CategoryPie from "./CategoryPie";
import WeeklyTrendChart from "./WeeklyTrendChart";
import TopMenuChart from "./TopMenuChart";

type Props = { rows: SalesRow[] };

export default function Dashboard({ rows }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hasAnyFilter = !!(
    searchParams.get("year") || searchParams.get("month") ||
    searchParams.get("division") || searchParams.get("service") || searchParams.get("customer")
  );

  const resetFilters = () => router.push("?", { scroll: false });

  const [showDivision, setShowDivision] = useState(true);
  const [showService,  setShowService]  = useState(true);
  const [showCustomer, setShowCustomer] = useState(false);

  // URL 쿼리스트링에서 현재 필터 값 읽기
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

  const growthTrend =
    data.growthRate > 0 ? "positive" : data.growthRate < 0 ? "negative" : "neutral";
  const yoyTrend =
    data.yoyRate > 0 ? "positive" : data.yoyRate < 0 ? "negative" : "neutral";
  const cagrTrend =
    data.cagrRate > 0 ? "positive" : data.cagrRate < 0 ? "negative" : "neutral";

  const hasTimeFilter = !!month;   // 월 선택
  const isYearOnly    = !!year && !month; // 연도 선택, 월 전체

  // 활성 필터 배지
  const activeFilters = [
    yearStr  ? `${yearStr}년`  : null,
    monthStr ? `${monthStr}월` : null,
    division ?? null,
    service  ?? null,
    customer ?? null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: "#13141F" }}>

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 mb-5">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "#00CFAA" }}
            >
              Sales Dashboard
            </p>
            <h1 className="text-2xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>
              구루미 매출 현황
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {data.periodLabel}
              </p>
              {activeFilters.map((f) => (
                <span
                  key={f}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(0,207,170,0.15)",
                    color: "#00CFAA",
                    border: "1px solid rgba(0,207,170,0.3)",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 필터 패널 ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          {/* 시간 필터 (연도 · 월) */}
          <div
            className="px-4 pt-4 pb-3 flex flex-col gap-3 relative"
            style={{ background: "#1C1E2E" }}
          >
            {/* 필터 초기화 버튼 */}
            {hasAnyFilter && (
              <button
                onClick={resetFilters}
                title="필터 초기화"
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.45)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,74,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#FF6B4A";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,107,74,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                초기화
              </button>
            )}
            <FilterRow
              label="연도"
              paramKey="year"
              options={data.filterOptions.years}
              formatLabel={(v) => `${v}년`}
            />
            <FilterRow
              label="월"
              paramKey="month"
              options={data.filterOptions.months}
              formatLabel={(v) => `${v}월`}
            />
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

          {/* 비즈니스 필터 (사업부문 · 서비스 · 고객사) — 각각 토글 */}
          <div
            className="px-4 pt-3 pb-4 flex flex-col gap-2"
            style={{ background: "#1C1E2E" }}
          >
            {[
              { label: "사업부문", show: showDivision, setShow: setShowDivision, paramKey: "division", options: data.filterOptions.divisions },
              { label: "서비스",   show: showService,  setShow: setShowService,  paramKey: "service",  options: data.filterOptions.services  },
              { label: "고객사",   show: showCustomer, setShow: setShowCustomer, paramKey: "customer", options: data.filterOptions.customers  },
            ].map(({ label, show, setShow, paramKey, options }) => (
              <div key={paramKey}>
                <button
                  onClick={() => setShow((v) => !v)}
                  className="flex items-center gap-1.5 py-1 text-xs font-semibold transition-colors duration-200"
                  style={{ color: show ? "#00CFAA" : "rgba(255,255,255,0.55)" }}
                >
                  <svg
                    width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: show ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  {label}
                </button>
                {show && (
                  <div className="mt-1.5 pl-4">
                    <FilterRow label="" paramKey={paramKey} options={options} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard label="총 매출" value={formatKRW(data.totalRevenue)} />
        <KpiCard
          label="총 거래 수"
          value={`${data.totalDeals.toLocaleString("ko-KR")}건`}
        />

        {hasTimeFilter ? (
          /* ── 월 선택: 월 평균 매출 · 전월 대비 · 전년 동월 대비 ── */
          <>
            <KpiCard label="월 평균 매출" value={formatKRW(data.monthlyAvg)} />
            <KpiCard
              label="매출 성장률"
              value={`${data.growthRate >= 0 ? "+" : ""}${data.growthRate.toFixed(1)}%`}
              trend={growthTrend}
              trendValue="전월 대비"
            />
            <KpiCard
              label="매출 성장률"
              value={`${data.yoyRate >= 0 ? "+" : ""}${data.yoyRate.toFixed(1)}%`}
              trend={yoyTrend}
              trendValue="전년 동월 대비"
            />
          </>
        ) : isYearOnly ? (
          /* ── 연도 선택 / 월 전체: 활성 거래처 수 · 최고 매출 월 · 연평균 성장률(전년 동기) ── */
          <>
            <KpiCard
              label="활성 거래처 수"
              value={`${data.activeCustomers.toLocaleString("ko-KR")}개사`}
            />
            <KpiCard
              label="최고 매출 월"
              value={data.peakMonth}
            />
            <KpiCard
              label="연평균 성장률"
              value={`${data.yoyPeriodRate >= 0 ? "+" : ""}${data.yoyPeriodRate.toFixed(1)}%`}
              trend={data.yoyPeriodRate > 0 ? "positive" : data.yoyPeriodRate < 0 ? "negative" : "neutral"}
              trendValue="전년 동기 대비"
              tooltip={`전년 동기 대비 계산 방식\n\n선택 연도의 최신 월까지 합계를\n전년 동일 기간 합계와 비교합니다.\n\n예) 2026년 1~5월 합계\n   vs 2025년 1~5월 합계`}
            />
          </>
        ) : (
          /* ── 전체 (연도/월 미선택): 활성 거래처 수 · 연평균 성장률(CAGR) · 월평균 성장률 ── */
          <>
            <KpiCard
              label="활성 거래처 수"
              value={`${data.activeCustomers.toLocaleString("ko-KR")}개사`}
            />
            <KpiCard
              label="연평균 성장률"
              value={`${data.cagrRate >= 0 ? "+" : ""}${data.cagrRate.toFixed(1)}%`}
              trend={cagrTrend}
              trendValue="CAGR"
              tooltip={`CAGR (연평균 복합 성장률)\n\n첫 해와 마지막 해의 연간 매출을 기준으로\n연평균 몇 % 성장했는지 계산합니다.\n\nCAGR = (마지막 연도 / 첫 연도)^(1/n) - 1`}
            />
            <KpiCard
              label="월평균 성장률"
              value={`${data.avgMoMRate >= 0 ? "+" : ""}${data.avgMoMRate.toFixed(1)}%`}
              trend={data.avgMoMRate > 0 ? "positive" : data.avgMoMRate < 0 ? "negative" : "neutral"}
              trendValue="월평균 MoM"
              tooltip={`월평균 성장률 계산 방식\n\n연속된 두 달의 증감률을 모두 구한 뒤\n산술 평균을 냅니다.\n\n예) +20%, -25%, +67% → 평균 +20.7%`}
            />
          </>
        )}
      </div>

      {/* ── Monthly Bar Chart ── */}
      <div
        className="rounded-2xl p-6 mb-6 border"
        style={{ background: "#1C1E2E", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <MonthlyChart data={data.monthlyData} />
      </div>

      {/* ── Channel + Category ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "#1C1E2E", borderColor: "rgba(255,255,255,0.05)" }}
        >
          <ChannelChart data={data.channelData} />
        </div>
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "#1C1E2E", borderColor: "rgba(255,255,255,0.05)" }}
        >
          <CategoryPie data={data.serviceData} />
        </div>
      </div>

      {/* ── Stacked Area Trend ── */}
      <div
        className="rounded-2xl p-6 mb-6 border"
        style={{ background: "#1C1E2E", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <WeeklyTrendChart data={data.trendData} channels={data.trendChannels} />
      </div>

      {/* ── Top 10 ── */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: "#1C1E2E", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <TopMenuChart data={data.topData} />
      </div>
    </div>
  );
}
