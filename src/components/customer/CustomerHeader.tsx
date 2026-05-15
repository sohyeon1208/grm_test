"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";
import EditCustomerModal from "./EditCustomerModal";

type Props = { customer: Customer };

const STAGE_OPTIONS = ["제안", "계약완료", "계약종료", "계약실패"];

function dDay(mdate: string): { label: string; tone: "danger" | "warn" | "muted" | "ok" } {
  if (!mdate) return { label: "—", tone: "muted" };
  const d = new Date(mdate);
  if (Number.isNaN(d.getTime())) return { label: mdate, tone: "muted" };
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "만료", tone: "muted" };
  if (diff <= 7) return { label: `D-${diff}`, tone: "danger" };
  if (diff <= 30) return { label: `D-${diff}`, tone: "warn" };
  return { label: `D-${diff}`, tone: "ok" };
}

function stageColor(stage: string, isDark: boolean): string {
  if (stage.includes("완료")) return isDark ? "#00CFAA" : "#0aa78c";
  if (stage.includes("종료")) return isDark ? "#9aa0b4" : "#6b7280";
  if (stage.includes("실패")) return isDark ? "#ff6b6b" : "#e0586b";
  return isDark ? "#bcb3ff" : "#5b50d6";
}

export default function CustomerHeader({ customer }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const c = customer;
  const router = useRouter();
  const d = dDay(c.계약만료일);

  const [editingStage, setEditingStage] = useState(false);
  const [stageDraft, setStageDraft] = useState(c.영업단계);
  const [saving, setSaving] = useState(false);
  const [stageError, setStageError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);

  async function saveStage() {
    setSaving(true);
    setStageError("");
    try {
      const res = await fetch("/api/customers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: c.영업활동명 || c.그룹ID || c.그룹명,
          patch: { 영업단계: stageDraft },
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStageError(data.reason || "저장 실패");
      } else {
        setEditingStage(false);
        router.refresh();
      }
    } catch {
      setStageError("네트워크 오류");
    } finally {
      setSaving(false);
    }
  }

  const toneColor: Record<typeof d.tone, string> = {
    danger: "#ff6b6b",
    warn: "#ffb86b",
    muted: T.text.muted,
    ok: isDark ? "#00CFAA" : "#0aa78c",
  };

  const sc = stageColor(c.영업단계, isDark);

  return (
    <header
      className="px-6 py-5 mb-5 rounded-lg relative"
      style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
    >
      <EditCustomerModal
        customer={c}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      {/* 우상단 — 고객 편집 + 계약상태 편집 */}
      <div className="absolute top-4 right-5 flex flex-col items-end gap-2">
        {editingStage ? (
          <div className="flex items-center gap-2">
            <select
              value={stageDraft}
              onChange={(e) => setStageDraft(e.target.value)}
              className="text-xs rounded px-2 py-1 outline-none"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(26,28,51,0.05)",
                border: `1px solid ${T.border}`,
                color: T.text.primary,
              }}
            >
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              {c.영업단계 && !STAGE_OPTIONS.includes(c.영업단계) && (
                <option value={c.영업단계}>{c.영업단계}</option>
              )}
            </select>
            <button
              onClick={saveStage}
              disabled={saving}
              className="text-xs px-2.5 py-1 rounded"
              style={{
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.3)",
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "…" : "저장"}
            </button>
            <button
              onClick={() => { setEditingStage(false); setStageDraft(c.영업단계); setStageError(""); }}
              className="text-xs px-2 py-1 rounded"
              style={{ color: T.text.muted, border: `1px solid ${T.border}`, cursor: "pointer" }}
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setStageDraft(c.영업단계); setEditingStage(true); }}
            className="text-xs px-2.5 py-1 rounded flex items-center gap-1.5 font-medium"
            title="계약상태 변경"
            style={{
              color: isDark ? "#a5b4fc" : "#5b50d6",
              border: `1px solid ${isDark ? "rgba(99,102,241,0.45)" : "rgba(91,80,214,0.35)"}`,
              background: isDark ? "rgba(99,102,241,0.10)" : "rgba(91,80,214,0.07)",
              cursor: "pointer",
            }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block shrink-0"
              style={{ background: sc }}
            />
            계약상태 변경
          </button>
        )}
        {stageError && (
          <p className="text-[10px]" style={{ color: "#f87171" }}>{stageError}</p>
        )}
        {/* 고객 정보 수정 버튼 */}
        <button
          onClick={() => setEditModalOpen(true)}
          className="text-xs px-2.5 py-1 rounded flex items-center gap-1.5"
          style={{
            color: T.text.muted,
            border: `1px solid ${T.border}`,
            cursor: "pointer",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          고객 정보 수정
        </button>
      </div>

      <div className="text-xs mb-1" style={{ color: T.text.muted }}>
        {c.그룹명 || "고객"}
      </div>
      <h1
        className="text-xl font-semibold leading-tight break-words pr-36"
        style={{ color: T.text.primary }}
      >
        {c.영업활동명 || c.그룹명}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
        {c.그룹ID && (
          <span
            className="px-2 py-1 rounded font-mono"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(26,28,51,0.05)",
              color: T.text.secondary,
            }}
          >
            {c.그룹ID}
          </span>
        )}
        {c.영업단계 && (
          <span
            className="px-2 py-1 rounded font-medium"
            style={{
              background: isDark ? `${sc}22` : `${sc}18`,
              color: sc,
            }}
          >
            {c.영업단계}
          </span>
        )}
        <span
          className="px-2 py-1 rounded font-medium"
          style={{
            background: isDark ? `${toneColor[d.tone]}22` : `${toneColor[d.tone]}18`,
            color: toneColor[d.tone],
          }}
        >
          {d.label}
        </span>
      </div>
    </header>
  );
}
