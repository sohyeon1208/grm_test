"use client";

import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";
import { deriveContractItem } from "@/lib/contractItem";

type Props = { customer: Customer };

export default function ContractCard({ customer }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const c = customer;

  const derived = deriveContractItem({ 계약항목: c.계약항목, 그룹유형: c.그룹유형 });
  const 계약항목Auto = !c.계약항목.trim() && !!derived;

  const rows: { label: string; value: string; hint?: string }[] = [
    {
      label: "계약항목",
      value: derived || "—",
      hint: 계약항목Auto ? "그룹유형 기반 자동 표시" : undefined,
    },
    { label: "요금", value: c.요금 || "—" },
    { label: "계약 만료일", value: c.계약만료일 || "—" },
    { label: "라이선스 수", value: c.라이선스수 || "—" },
    { label: "MAU", value: c.MAU || "—" },
    { label: "그룹유형", value: c.그룹유형 || "—" },
    { label: "최근 활동일", value: c.최근활동일 || "—" },
  ];

  return (
    <section
      className="rounded-lg p-5"
      style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: T.text.primary }}>
          📋 계약 정보
        </h3>
        <button
          disabled
          title="Phase 4에서 활성화"
          className="text-xs px-2 py-1 rounded opacity-50 cursor-not-allowed"
          style={{ color: T.text.muted, border: `1px solid ${T.border}` }}
        >
          ✏️ 수정
        </button>
      </div>
      <dl className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline gap-3 text-sm">
            <dt className="w-24 shrink-0" style={{ color: T.text.muted }}>
              {r.label}
            </dt>
            <dd className="flex-1 break-words" style={{ color: T.text.primary }}>
              {r.value}
              {r.hint && (
                <span
                  className="ml-2 text-xs"
                  style={{ color: T.text.muted }}
                  title={r.hint}
                >
                  (auto)
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
