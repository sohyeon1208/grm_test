"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import InfoTooltip from "@/components/layout/InfoTooltip";
import CustomerKanban from "./CustomerKanban";
import NewCustomerModal from "./NewCustomerModal";
import type { Customer } from "@/lib/customers";
import { deriveContractItem, SERVICE_OPTIONS } from "@/lib/contractItem";

type Props = {
  customers: Customer[];
  total: number;
  upcoming: number;
};

function daysUntilExpiry(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const DEADLINE_FILTERS = ["전체", "D-7 이내", "D-30 이내"] as const;
type DeadlineFilter = typeof DEADLINE_FILTERS[number];

const SEARCH_HELP =
  "상단 검색창에 고객사명 일부를 입력하면 자동완성됩니다.\n" +
  "· 영업활동명, 그룹ID, 그룹명 세 가지를 모두 부분일치로 검색\n" +
  "· 2글자 이상 입력 시 동작\n" +
  "· ↑↓ 키로 이동, Enter로 선택";

function exportCSV(customers: Customer[]) {
  const headers = [
    "영업활동명", "그룹명", "그룹ID", "영업단계", "계약항목", "그룹유형",
    "요금", "계약만료일", "라이선스수", "MAU",
    "정산주기", "정산일", "청구방법", "정산담당자", "정산방법",
    "세금계산서고객사명", "계약비고", "최근활동일",
  ];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = customers.map((c) => {
    const item = deriveContractItem({ 계약항목: c.계약항목, 그룹유형: c.그룹유형, 영업활동명: c.영업활동명 });
    return [
      c.영업활동명, c.그룹명, c.그룹ID, c.영업단계, item || c.계약항목, c.그룹유형,
      c.요금, c.계약만료일, c.라이선스수, c.MAU,
      c.정산주기, c.정산일, c.청구방법, c.정산담당자, c.정산방법,
      c.세금계산서고객사명, c.계약비고, c.최근활동일,
    ].map(esc).join(",");
  });
  const bom = "﻿"; // Excel 한글 깨짐 방지
  const csv = bom + [headers.map(esc).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `고객목록_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ContractsBoard({ customers, total, upcoming }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("전체");
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("전체");

  // 서비스 목록 — SERVICE_OPTIONS 순서 유지, 실제 사용된 것만 표시
  const serviceOptions = useMemo(() => {
    const used = new Set<string>();
    for (const c of customers) {
      const item = deriveContractItem({ 계약항목: c.계약항목, 그룹유형: c.그룹유형, 영업활동명: c.영업활동명 });
      if (item && (SERVICE_OPTIONS as readonly string[]).includes(item)) used.add(item);
    }
    return ["전체", ...SERVICE_OPTIONS.filter((s) => used.has(s))];
  }, [customers]);

  // 서비스 필터 + 계약 임박 필터 적용
  const filtered = useMemo(() => {
    let list = customers;

    if (serviceFilter !== "전체") {
      list = list.filter((c) => {
        const item = deriveContractItem({ 계약항목: c.계약항목, 그룹유형: c.그룹유형, 영업활동명: c.영업활동명 });
        return item === serviceFilter;
      });
    }

    if (deadlineFilter !== "전체") {
      const limit = deadlineFilter === "D-7 이내" ? 7 : 30;
      list = list.filter((c) => {
        const days = daysUntilExpiry(c.계약만료일);
        return days !== null && days >= 0 && days <= limit;
      });
    }

    return list;
  }, [customers, serviceFilter, deadlineFilter]);

  const filterBtn = (active: boolean) => ({
    padding: "4px 14px",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    border: active ? "none" : `1px solid ${T.border}`,
    background: active ? "linear-gradient(90deg, #7B70EE, #00CFAA)" : T.bg.card,
    color: active ? "#fff" : T.text.secondary,
    transition: "all 0.15s",
  });

  return (
    <div className="px-6 py-6">
      {/* 상단 — 타이틀 + 통계 + 버튼 */}
      <div className="flex items-center flex-wrap gap-4 mb-4">
        <h1 className="text-xl font-semibold" style={{ color: T.text.primary }}>
          계약 관리
        </h1>

        <div className="flex items-center gap-3">
          <Stat label="등록된 고객" value={`${total}`} T={T} />
          <Stat label="30일 내 만료 임박" value={`${upcoming}`} T={T} accent />
        </div>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: T.text.muted }}>
          <span>고객 검색 방법</span>
          <InfoTooltip text={SEARCH_HELP} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="px-3 py-2 rounded-md text-sm"
            title={serviceFilter === "전체" ? "전체 고객 CSV 다운로드" : `${serviceFilter} 필터 적용 결과 CSV 다운로드`}
            style={{ border: `1px solid ${T.border}`, color: T.text.secondary, background: T.bg.card }}
          >
            ⬇ 데이터 추출
            {serviceFilter !== "전체" && (
              <span className="ml-1 text-xs opacity-70">({filtered.length}명)</span>
            )}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 rounded-md text-sm font-medium"
            style={{ background: "linear-gradient(90deg, #7B70EE, #00CFAA)", color: "#fff" }}
          >
            + 신규 고객 추가
          </button>
        </div>
      </div>

      {/* 필터 행 */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5">
        {/* 서비스 필터 */}
        {serviceOptions.length > 2 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs shrink-0" style={{ color: T.text.muted }}>서비스</span>
            {serviceOptions.map((opt) => {
              const count =
                opt === "전체"
                  ? customers.length
                  : customers.filter((c) => {
                      const item = deriveContractItem({ 계약항목: c.계약항목, 그룹유형: c.그룹유형, 영업활동명: c.영업활동명 });
                      return item === opt;
                    }).length;
              return (
                <button key={opt} onClick={() => setServiceFilter(opt)} style={filterBtn(serviceFilter === opt)}>
                  {opt}
                  <span className="ml-1 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 계약 임박 필터 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs shrink-0" style={{ color: T.text.muted }}>계약 만료</span>
          {DEADLINE_FILTERS.map((opt) => {
            const active = deadlineFilter === opt;
            const limit = opt === "D-7 이내" ? 7 : 30;
            const accentColor = opt === "D-7 이내" ? "#ef4444" : "#f97316";
            const count = opt === "전체"
              ? customers.length
              : customers.filter((c) => {
                  const days = daysUntilExpiry(c.계약만료일);
                  return days !== null && days >= 0 && days <= limit;
                }).length;

            const style: React.CSSProperties =
              opt === "전체"
                ? filterBtn(active)
                : active
                  ? { padding: "4px 14px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: "none", background: accentColor, color: "#fff", transition: "all 0.15s" }
                  : { padding: "4px 14px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 400, cursor: "pointer", border: `1px solid ${accentColor}55`, background: T.bg.card, color: accentColor, transition: "all 0.15s" };

            return (
              <button key={opt} onClick={() => setDeadlineFilter(opt)} style={style}>
                {opt}
                {opt !== "전체" && <span className="ml-1 opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 칸반 보드 */}
      <CustomerKanban customers={filtered} />

      <NewCustomerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function Stat({
  label,
  value,
  T,
  accent,
}: {
  label: string;
  value: string;
  T: typeof DARK | typeof LIGHT;
  accent?: boolean;
}) {
  return (
    <div
      className="px-3 py-1.5 rounded-lg flex items-baseline gap-2"
      style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
    >
      <span className="text-xs" style={{ color: T.text.muted }}>
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ color: accent ? "#ff8f6b" : T.text.primary }}
      >
        {value}
      </span>
    </div>
  );
}
