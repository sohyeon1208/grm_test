"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { Customer } from "@/lib/customers";

type Props = {
  customer: Customer;
  open: boolean;
  onClose: () => void;
};

export default function EditCustomerModal({ customer, open, onClose }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const router = useRouter();
  const c = customer;

  const [그룹명, set그룹명] = useState(c.그룹명);
  const [영업활동명, set영업활동명] = useState(c.영업활동명);
  const [그룹ID, set그룹ID] = useState(c.그룹ID);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletePhase, setDeletePhase] = useState<"idle" | "confirm">("idle");
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const currentKey = c.영업활동명 || c.그룹ID || c.그룹명;

  const handleSave = async () => {
    setError("");
    if (!그룹명.trim() || !영업활동명.trim()) {
      setError("그룹명과 영업활동명은 필수입니다.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/customers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: currentKey,
          patch: { 그룹명: 그룹명.trim(), 영업활동명: 영업활동명.trim(), 그룹ID: 그룹ID.trim() },
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.reason || "저장 실패");
        setSaving(false);
        return;
      }
      onClose();
      // 영업활동명이 바뀌면 새 URL로 이동
      const newKey = 영업활동명.trim() || 그룹ID.trim() || 그룹명.trim();
      if (newKey !== currentKey) {
        router.push(`/customers/${encodeURIComponent(newKey)}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch("/api/customers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: currentKey }),
      });
      router.push("/customers");
    } catch {
      setError("삭제 중 오류가 발생했습니다.");
      setDeleting(false);
    }
  };

  const inputStyle = {
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
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: T.text.primary }}>
            고객 정보 수정
          </h2>
          <button onClick={onClose} style={{ color: T.text.muted }} className="text-xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: T.text.muted }}>
              그룹명 <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              value={그룹명}
              onChange={(e) => set그룹명(e.target.value)}
              style={inputStyle}
              placeholder="예: 한국고용정보원"
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: T.text.muted }}>
              영업활동명 <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              value={영업활동명}
              onChange={(e) => set영업활동명(e.target.value)}
              style={inputStyle}
              placeholder="예: 한국고용정보원-청년정책팀-화상면접"
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: T.text.muted }}>
              그룹 ID
            </label>
            <input
              value={그룹ID}
              onChange={(e) => set그룹ID(e.target.value)}
              style={inputStyle}
              placeholder="예: keis_online"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs" style={{ color: "#ff6b6b" }}>
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          {/* 삭제 영역 */}
          {deletePhase === "idle" ? (
            <button
              onClick={() => setDeletePhase("confirm")}
              className="text-xs px-3 py-1.5 rounded"
              style={{
                color: "#ff6b6b",
                border: "1px solid rgba(255,107,107,0.3)",
                background: "rgba(255,107,107,0.07)",
                cursor: "pointer",
              }}
            >
              고객 삭제
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <span className="text-xs" style={{ color: T.text.muted }}>정말 삭제하시겠습니까?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs px-3 py-1.5 rounded font-medium"
                style={{
                  color: "#fff",
                  background: "#ef4444",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "삭제 중…" : "삭제 확인"}
              </button>
              <button
                onClick={() => setDeletePhase("idle")}
                className="text-xs px-2 py-1.5"
                style={{ color: T.text.muted, cursor: "pointer" }}
              >
                취소
              </button>
            </div>
          )}

          {/* 저장/취소 */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 rounded text-sm"
              style={{ color: T.text.secondary, border: `1px solid ${T.border}`, cursor: "pointer" }}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded text-sm font-medium"
              style={{
                background: "linear-gradient(90deg, #7B70EE, #00CFAA)",
                color: "#fff",
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
