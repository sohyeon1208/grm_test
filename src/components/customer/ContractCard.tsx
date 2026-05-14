"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";
import { deriveContractItem, SERVICE_OPTIONS } from "@/lib/contractItem";

type EditableFields = Pick<
  Customer,
  "계약항목" | "요금" | "계약만료일" | "라이선스수" | "MAU" | "그룹유형" | "최근활동일"
>;

type Props = { customer: Customer };

export default function ContractCard({ customer }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const c = customer;
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditableFields>({
    계약항목: c.계약항목,
    요금: c.요금,
    계약만료일: c.계약만료일,
    라이선스수: c.라이선스수,
    MAU: c.MAU,
    그룹유형: c.그룹유형,
    최근활동일: c.최근활동일,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const derived = deriveContractItem({
    계약항목: isEditing ? draft.계약항목 : c.계약항목,
    그룹유형: isEditing ? draft.그룹유형 : c.그룹유형,
    영업활동명: c.영업활동명,
  });

  function handleEdit() {
    setDraft({
      계약항목: c.계약항목,
      요금: c.요금,
      계약만료일: c.계약만료일,
      라이선스수: c.라이선스수,
      MAU: c.MAU,
      그룹유형: c.그룹유형,
      최근활동일: c.최근활동일,
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

  return (
    <section
      className="rounded-lg p-5"
      style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: T.text.primary }}>
          📋 계약 정보
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
        {/* 서비스(계약항목) */}
        <div className="flex items-baseline gap-3 text-sm">
          <dt className="w-24 shrink-0" style={{ color: T.text.muted }}>계약항목</dt>
          <dd className="flex-1 break-words" style={{ color: T.text.primary }}>
            {isEditing ? (
              <select
                value={draft.계약항목}
                onChange={(e) => setDraft((d) => ({ ...d, 계약항목: e.target.value }))}
                style={inputStyle}
              >
                <option value="">— 자동 추론 —</option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <>
                {derived || "—"}
                {!c.계약항목.trim() && derived && (
                  <span className="ml-2 text-xs" style={{ color: T.text.muted }}>(auto)</span>
                )}
              </>
            )}
          </dd>
        </div>

        {/* 나머지 필드 */}
        {(
          [
            { label: "요금",       field: "요금"       as const, type: "text" as const },
            { label: "계약 만료일", field: "계약만료일"  as const, type: "date" as const },
            { label: "라이선스 수", field: "라이선스수"  as const, type: "text" as const },
            { label: "MAU",        field: "MAU"        as const, type: "text" as const },
            { label: "그룹유형",   field: "그룹유형"    as const, type: "text" as const },
            { label: "최근 활동일", field: "최근활동일"  as const, type: "date" as const },
          ] as { label: string; field: keyof EditableFields; type: "text" | "date" }[]
        ).map((r) => (
          <div key={r.label} className="flex items-baseline gap-3 text-sm">
            <dt className="w-24 shrink-0" style={{ color: T.text.muted }}>{r.label}</dt>
            <dd className="flex-1 break-words" style={{ color: T.text.primary }}>
              {isEditing ? (
                <input
                  type={r.type}
                  value={draft[r.field] as string}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [r.field]: e.target.value }))
                  }
                  style={inputStyle}
                />
              ) : (
                (c[r.field] as string) || "—"
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
