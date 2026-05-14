"use client";

import { useState } from "react";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import InfoTooltip from "@/components/layout/InfoTooltip";
import CustomerKanban from "./CustomerKanban";
import NewCustomerModal from "./NewCustomerModal";
import type { Customer } from "@/lib/customers";

type Props = {
  customers: Customer[];
  total: number;
  upcoming: number;
};

const SEARCH_HELP =
  "상단 검색창에 고객사명 일부를 입력하면 자동완성됩니다.\n" +
  "· 영업활동명, 그룹ID, 그룹명 세 가지를 모두 부분일치로 검색\n" +
  "· 2글자 이상 입력 시 동작\n" +
  "· ↑↓ 키로 이동, Enter로 선택";

export default function ContractsBoard({ customers, total, upcoming }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="px-6 py-6">
      {/* 상단 — 통계 + 검색 안내 + 신규 추가 */}
      <div className="flex items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: T.text.primary }}>
            계약 관리
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Stat label="등록된 고객" value={`${total}`} T={T} />
          <Stat label="30일 내 만료 임박" value={`${upcoming}`} T={T} accent />
        </div>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: T.text.muted }}>
          <span>고객 검색 방법</span>
          <InfoTooltip text={SEARCH_HELP} />
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="ml-auto px-3.5 py-2 rounded-md text-sm font-medium"
          style={{ background: "linear-gradient(90deg, #7B70EE, #00CFAA)", color: "#fff" }}
        >
          + 신규 고객 추가
        </button>
      </div>

      {/* 칸반 보드 */}
      <CustomerKanban customers={customers} />

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
