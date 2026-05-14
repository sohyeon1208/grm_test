"use client";

import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";

type Props = { customer: Customer };
const ROW = (label: string, value: string) => ({ label, value: value || "—" });

export default function SettlementCard({ customer }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const c = customer;

  const rows = [
    ROW("정산주기", c.정산주기),
    ROW("정산일", c.정산일),
    ROW("청구방법", c.청구방법),
    ROW("정산담당자", c.정산담당자),
    ROW("정산방법", c.정산방법),
    ROW("세금계산서 고객사명", c.세금계산서고객사명),
    ROW("계약 비고", c.계약비고),
  ];

  return (
    <section
      className="rounded-lg p-5"
      style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: T.text.primary }}>
          💰 정산 정보
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
            <dt className="w-32 shrink-0" style={{ color: T.text.muted }}>
              {r.label}
            </dt>
            <dd
              className="flex-1 break-words whitespace-pre-wrap"
              style={{ color: T.text.primary }}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
