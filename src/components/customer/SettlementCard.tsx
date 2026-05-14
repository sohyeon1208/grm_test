"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";

type EditableFields = Pick<
  Customer,
  "정산주기" | "정산일" | "청구방법" | "정산담당자" | "정산방법" | "세금계산서고객사명" | "계약비고"
>;

type Props = { customer: Customer };

export default function SettlementCard({ customer }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const c = customer;
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditableFields>({
    정산주기: c.정산주기,
    정산일: c.정산일,
    청구방법: c.청구방법,
    정산담당자: c.정산담당자,
    정산방법: c.정산방법,
    세금계산서고객사명: c.세금계산서고객사명,
    계약비고: c.계약비고,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleEdit() {
    setDraft({
      정산주기: c.정산주기,
      정산일: c.정산일,
      청구방법: c.청구방법,
      정산담당자: c.정산담당자,
      정산방법: c.정산방법,
      세금계산서고객사명: c.세금계산서고객사명,
      계약비고: c.계약비고,
    });
    setError(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/customers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: c.영업활동명 || c.그룹ID || c.그룹명,
          patch: draft,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.reason || "저장 실패");
      } else {
        setIsEditing(false);
        router.refresh();
      }
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(26,28,51,0.04)",
    border: `1px solid ${T.border}`,
    color: T.text.primary,
    borderRadius: "6px",
    padding: "2px 6px",
    width: "100%",
    fontSize: "0.875rem",
  };

  const rows: { label: string; field: keyof EditableFields; textarea?: boolean }[] = [
    { label: "정산주기", field: "정산주기" },
    { label: "정산일", field: "정산일" },
    { label: "청구방법", field: "청구방법" },
    { label: "정산담당자", field: "정산담당자" },
    { label: "정산방법", field: "정산방법" },
    { label: "세금계산서 고객사명", field: "세금계산서고객사명" },
    { label: "계약 비고", field: "계약비고", textarea: true },
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
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-2 py-1 rounded"
              style={{
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.3)",
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "저장 중…" : "💾 저장"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-xs px-2 py-1 rounded"
              style={{ color: T.text.muted, border: `1px solid ${T.border}`, cursor: "pointer" }}
            >
              ✕ 취소
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="text-xs px-2 py-1 rounded"
            style={{ color: T.text.muted, border: `1px solid ${T.border}`, cursor: "pointer" }}
          >
            ✏️ 수정
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs mb-2" style={{ color: "#f87171" }}>
          ⚠️ {error}
        </p>
      )}

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
              {isEditing ? (
                r.textarea ? (
                  <textarea
                    value={draft[r.field]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [r.field]: e.target.value }))
                    }
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                ) : (
                  <input
                    type="text"
                    value={draft[r.field]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [r.field]: e.target.value }))
                    }
                    style={inputStyle}
                  />
                )
              ) : (
                c[r.field] || "—"
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
