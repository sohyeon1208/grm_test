"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
            className="px-4 pt-4 pb-3 flex flex-col gap-3"
            style={{ background: "#1C1E2E" }}
          >
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

          {/* 비즈니스 필터 (사업부문 · 서비스 · 고객사) */}
          <div
            className="px-4 pt-3 pb-4 flex flex-col gap-3"
            style={{ background: "#1C1E2E" }}
          >
            <FilterRow
              label="사업부문"
              paramKey="division"
              options={data.filterOptions.divisions}
            />
            <FilterRow
              label="서비스"
              paramKey="service"
              options={data.filterOptions.services}
            />
            <FilterRow
              label="고객사"
              paramKey="customer"
              options={data.filterOptions.customers}
            />
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="총 매출" value={formatKRW(data.totalRevenue)} />
        <KpiCard
          label="총 거래 수"
          value={`${data.totalDeals.toLocaleString("ko-KR")}건`}
        />
        <KpiCard label="월 평균 매출" value={formatKRW(data.monthlyAvg)} />
        <KpiCard
          label="매출 성장률"
          value={`${data.growthRate >= 0 ? "+" : ""}${data.growthRate.toFixed(1)}%`}
          trend={growthTrend}
          trendValue="전월 대비"
        />
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
