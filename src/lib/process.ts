import type { SalesRow } from "./sheets";
import { 사업부문_COLORS, 서비스_COLORS } from "./format";

export type MonthlyPoint = { month: string; label: string; revenue: number };
export type ChannelPoint = { name: string; revenue: number; color: string };
export type ServicePoint = { name: string; revenue: number; color: string };
export type TrendPoint = Record<string, number | string>;
export type TopPoint = { name: string; revenue: number; count: number };

export type DashboardFilters = {
  year?: number;     // 연도
  month?: number;    // 월
  division?: string; // 사업부문
  service?: string;  // 서비스분류
  customer?: string; // 고객사
};

export type FilterOption = { value: string; color: string };

export type DashboardData = {
  totalRevenue: number;
  totalDeals: number;
  monthlyAvg: number;
  growthRate: number;
  periodLabel: string;
  monthlyData: MonthlyPoint[];
  channelData: ChannelPoint[];
  serviceData: ServicePoint[];
  trendData: TrendPoint[];
  trendChannels: string[];
  topData: TopPoint[];
  // 각 필터 차원별 선택 가능한 옵션 (컨텍스트 반영)
  filterOptions: {
    years: FilterOption[];
    months: FilterOption[];
    divisions: FilterOption[];
    services: FilterOption[];
    customers: FilterOption[];
  };
};

export function processRaw(rows: SalesRow[], filters: DashboardFilters = {}): DashboardData {
  const { year, month, division, service, customer } = filters;

  // 연도 → 월 → 사업부문 → 서비스 → 고객사 순 필터 적용
  let filtered = rows;
  if (year)     filtered = filtered.filter((r) => r.연도 === year);
  if (month)    filtered = filtered.filter((r) => r.월 === month);
  if (division) filtered = filtered.filter((r) => r.사업부문 === division);
  if (service)  filtered = filtered.filter((r) => r.서비스분류 === service);
  if (customer) filtered = filtered.filter((r) => r.거래처 === customer);

  const totalRevenue = filtered.reduce((s, r) => s + r.매출액, 0);
  const totalDeals = filtered.length;

  // Monthly aggregation
  const monthMap = new Map<string, number>();
  for (const row of filtered) {
    const key = `${row.연도}-${String(row.월).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + row.매출액);
  }
  // 연도가 2개 이상이면 "25.4" 형식, 단일 연도면 "4월" 형식
  const yearSet = new Set(filtered.map((r) => r.연도));
  const multiYear = yearSet.size > 1;

  const monthlyData: MonthlyPoint[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => {
      const [y, m] = key.split("-");
      const label = multiYear
        ? `${y.slice(2)}.${parseInt(m)}`   // "25.4", "26.1" — 연도 구분
        : `${parseInt(m)}월`;               // "4월", "5월"
      return { month: key, label, revenue };
    });

  const monthlyAvg = monthlyData.length > 0 ? totalRevenue / monthlyData.length : 0;

  // MoM growth rate
  let growthRate = 0;
  if (month) {
    // 특정 월 선택 시: 전월 데이터를 rows 전체에서 직접 조회
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear  = month === 1 ? (year ? year - 1 : undefined) : year;
    let prevFiltered = rows;
    if (prevYear)  prevFiltered = prevFiltered.filter((r) => r.연도 === prevYear);
    prevFiltered = prevFiltered.filter((r) => r.월 === prevMonth);
    if (division) prevFiltered = prevFiltered.filter((r) => r.사업부문 === division);
    if (service)  prevFiltered = prevFiltered.filter((r) => r.서비스분류 === service || r.서비스 === service);
    if (customer) prevFiltered = prevFiltered.filter((r) => r.거래처 === customer);
    const prevRevenue = prevFiltered.reduce((s, r) => s + r.매출액, 0);
    growthRate = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  } else if (monthlyData.length >= 2) {
    const last = monthlyData[monthlyData.length - 1].revenue;
    const prev = monthlyData[monthlyData.length - 2].revenue;
    growthRate = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  }

  // Period label — 선택된 필터에 맞춰 표시
  let periodLabel = "—";
  if (year && month) {
    periodLabel = `${year}년 ${month}월`;
  } else if (year) {
    periodLabel = `${year}년`;
  } else if (monthlyData.length > 0) {
    const latest = monthlyData[monthlyData.length - 1].month;
    const [ly, lm] = latest.split("-").map(Number);
    const earliest = monthlyData[0].month;
    const [ey] = earliest.split("-").map(Number);
    periodLabel = ly !== ey
      ? `${ey} – ${ly}`                        // 연도 범위: "2025 – 2026"
      : `${ly} Q${Math.ceil(lm / 3)}`;         // 단일 연도 분기
  }

  // Channel (사업부문) chart data
  const channelMap = new Map<string, number>();
  for (const row of filtered) {
    channelMap.set(row.사업부문, (channelMap.get(row.사업부문) ?? 0) + row.매출액);
  }
  const channelData: ChannelPoint[] = Array.from(channelMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, revenue]) => ({
      name,
      revenue,
      color: 사업부문_COLORS[name] ?? "#4A9EFF",
    }));

  // Service chart data — 서비스분류(카테고리) 기준으로 집계
  const serviceMap = new Map<string, number>();
  for (const row of filtered) {
    const key = row.서비스분류 || row.서비스;
    if (key) serviceMap.set(key, (serviceMap.get(key) ?? 0) + row.매출액);
  }
  const serviceData: ServicePoint[] = Array.from(serviceMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, revenue], i) => ({
      name,
      revenue,
      color: 서비스_COLORS[i % 서비스_COLORS.length],
    }));

  // Trend (monthly × 사업부문 stacked)
  const trendMap = new Map<string, Record<string, number>>();
  for (const row of filtered) {
    const key = `${row.연도}-${String(row.월).padStart(2, "0")}`;
    if (!trendMap.has(key)) trendMap.set(key, {});
    const entry = trendMap.get(key)!;
    entry[row.사업부문] = (entry[row.사업부문] ?? 0) + row.매출액;
  }
  const trendData: TrendPoint[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month: `${month.split("-")[1]}월`,
      ...values,
    }));

  const trendChannels = division
    ? [division]
    : Object.keys(사업부문_COLORS).filter((ch) => channelMap.has(ch));

  // Top 10 거래처
  const topMap = new Map<string, { revenue: number; count: number }>();
  for (const row of filtered) {
    if (!row.거래처) continue;
    if (!topMap.has(row.거래처)) topMap.set(row.거래처, { revenue: 0, count: 0 });
    const entry = topMap.get(row.거래처)!;
    entry.revenue += row.매출액;
    entry.count += 1;
  }
  const topData: TopPoint[] = Array.from(topMap.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(([name, { revenue, count }]) => ({ name, revenue, count }));

  // ─── Filter options (컨텍스트 반영) ───────────────────────────────────────
  // years: 전체 rows에서 고유 연도
  const allYearSet = new Set(rows.map((r) => r.연도));
  const years: FilterOption[] = Array.from(allYearSet)
    .sort((a, b) => a - b)
    .map((y) => ({ value: String(y), color: "#00CFAA" }));

  // months: 선택된 연도 내 고유 월 (연도 미선택 시 전체)
  const monthPool = year ? rows.filter((r) => r.연도 === year) : rows;
  const allMonthSet = new Set(monthPool.map((r) => r.월));
  const months: FilterOption[] = Array.from(allMonthSet)
    .sort((a, b) => a - b)
    .map((m) => ({ value: String(m), color: "#7B70EE" }));

  // divisions: 항상 전체 rows 기준
  const divisionSet = new Set(rows.map((r) => r.사업부문));
  const divisions: FilterOption[] = Object.keys(사업부문_COLORS)
    .filter((ch) => divisionSet.has(ch))
    .map((ch) => ({ value: ch, color: 사업부문_COLORS[ch] }));

  // services: 서비스분류(카테고리) 기준, 매출 상위 순 정렬
  const servicePool = division ? rows.filter((r) => r.사업부문 === division) : rows;
  const serviceRevMap = new Map<string, number>();
  for (const row of servicePool) {
    const key = row.서비스분류 || row.서비스;
    if (key) serviceRevMap.set(key, (serviceRevMap.get(key) ?? 0) + row.매출액);
  }
  const services: FilterOption[] = Array.from(serviceRevMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([v], i) => ({ value: v, color: 서비스_COLORS[i % 서비스_COLORS.length] }));

  // customers: division + service(서비스분류) 범위 내 고객사, 매출 상위 20개
  const customerPool = servicePool.filter((r) => !service || r.서비스분류 === service || r.서비스 === service);
  const customerMap = new Map<string, number>();
  for (const row of customerPool) {
    if (!row.거래처) continue;
    customerMap.set(row.거래처, (customerMap.get(row.거래처) ?? 0) + row.매출액);
  }
  const customers: FilterOption[] = Array.from(customerMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([value]) => ({ value, color: "#4A9EFF" }));

  return {
    totalRevenue,
    totalDeals,
    monthlyAvg,
    growthRate,
    periodLabel,
    monthlyData,
    channelData,
    serviceData,
    trendData,
    trendChannels,
    topData,
    filterOptions: { years, months, divisions, services, customers },
  };
}
