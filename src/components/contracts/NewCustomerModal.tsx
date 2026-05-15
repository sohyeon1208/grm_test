"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import { SERVICE_OPTIONS } from "@/lib/contractItem";

type Props = { open: boolean; onClose: () => void };

// 서비스 선택(계약항목)은 드롭다운으로 별도 처리하므로 여기선 제외
const FIELDS: { key: string; label: string; required?: boolean; placeholder?: string }[] = [
  { key: "그룹명",      label: "그룹명",      required: true, placeholder: "예: 한국고용정보원" },
  { key: "영업활동명",  label: "영업활동명",  required: true, placeholder: "예: 한국고용정보원-청년정책팀-화상면접" },
  { key: "그룹ID",      label: "그룹 ID",     placeholder: "예: keis_online" },
  { key: "영업단계",    label: "영업 단계",   placeholder: "예: 계약완료 / 제안 / 계약종료" },
  { key: "그룹유형",    label: "그룹유형",    placeholder: "예: V1 / V3" },
  { key: "정산주기",    label: "정산주기",    placeholder: "예: 월 / 단기 / 변동" },
  { key: "정산일",      label: "정산일",      placeholder: "예: 10일" },
  { key: "요금",        label: "요금",        placeholder: "예: 49,000" },
  { key: "청구방법",    label: "청구방법",    placeholder: "예: 스마트빌 / 나라빌" },
  { key: "세금계산서고객사명", label: "세금계산서 고객사명" },
  { key: "계약시작일",  label: "계약 시작일", placeholder: "yyyy-MM-dd" },
  { key: "계약만료일",  label: "계약 만료일", placeholder: "yyyy-MM-dd" },
  { key: "라이선스수",  label: "라이선스 수" },
  { key: "MAU",         label: "MAU" },
  { key: "정산담당자",  label: "정산 담당자 / 수신처" },
  { key: "정산방법",    label: "정산방법" },
  { key: "계약비고",    label: "계약 비고" },
];

export default function NewCustomerModal({ open, onClose }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;

  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.그룹명?.trim() || !form.영업활동명?.trim()) {
      setError("그룹명과 영업활동명은 필수입니다.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.reason || "추가에 실패했습니다.");
        setSaving(false);
        return;
      }
      router.push(`/customers/${encodeURIComponent(json.key)}`);
      onClose();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSaving(false);
    }
  };

  const inputBase = {
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(26,28,51,0.03)",
    border: `1px solid ${T.border}`,
    color: T.text.primary,
    borderRadius: "6px",
    padding: "6px 10px",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl p-6"
        style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: T.text.primary }}>
            신규 고객 추가
          </h2>
          <button onClick={onClose} style={{ color: T.text.muted }} className="text-xl leading-none">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* ── 서비스 드롭다운 (계약항목 컬럼에 저장) ── */}
          <div className="sm:col-span-2">
            <label className="block text-xs mb-1" style={{ color: T.text.muted }}>
              서비스
              <span className="ml-1 opacity-60">(비워두면 그룹유형·영업활동명으로 자동 추론)</span>
            </label>
            <select
              value={form.계약항목 ?? ""}
              onChange={(e) => set("계약항목", e.target.value)}
              style={inputBase}
            >
              <option value="">— 자동 추론 —</option>
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* ── 나머지 필드 ── */}
          {FIELDS.map((f) => (
            <div key={f.key} className={f.key === "계약비고" ? "sm:col-span-2" : ""}>
              <label className="block text-xs mb-1" style={{ color: T.text.muted }}>
                {f.label}
                {f.required && <span style={{ color: "#ff6b6b" }}> *</span>}
              </label>
              {f.key === "계약비고" ? (
                <textarea
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows={3}
                  style={{ ...inputBase, resize: "vertical" } as React.CSSProperties}
                />
              ) : (
                <input
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="outline-none"
                  style={inputBase}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-3 text-xs" style={{ color: "#ff6b6b" }}>
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm"
            style={{ color: T.text.secondary, border: `1px solid ${T.border}` }}
          >
            취소
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              background: "linear-gradient(90deg, #7B70EE, #00CFAA)",
              color: "#fff",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "추가 중…" : "추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
