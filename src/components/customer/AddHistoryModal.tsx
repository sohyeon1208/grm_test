"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";

type Props = {
  open: boolean;
  onClose: () => void;
  영업활동명: string;
  그룹ID: string;
  영업단계: string;
};

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function AddHistoryModal({
  open,
  onClose,
  영업활동명,
  그룹ID,
  영업단계,
}: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;

  const [날짜, set날짜] = useState(todayStr());
  const [유형, set유형] = useState("게시물");
  const [내용, set내용] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async () => {
    setError("");
    if (!내용.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/history/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 날짜, 유형, 영업활동명, 그룹ID: "", 영업단계: "", 내용 }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.reason || "추가에 실패했습니다.");
        setSaving(false);
        return;
      }
      // 폼 초기화 후 데이터 갱신
      set내용("");
      setSaving(false);
      router.refresh();
      onClose();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSaving(false);
    }
  };

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(26,28,51,0.03)",
    border: `1px solid ${T.border}`,
    color: T.text.primary,
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl p-6"
        style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold" style={{ color: T.text.primary }}>
            히스토리 추가
          </h2>
          <button onClick={onClose} style={{ color: T.text.muted }} className="text-xl leading-none">
            ×
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: T.text.muted }}>
          {영업활동명}
        </p>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ color: T.text.muted }}>
                날짜
              </label>
              <input
                type="date"
                value={날짜}
                onChange={(e) => set날짜(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: T.text.muted }}>
                유형
              </label>
              <div className="flex gap-1">
                {["게시물", "댓글"].map((t) => (
                  <button
                    key={t}
                    onClick={() => set유형(t)}
                    className="px-3 py-1.5 rounded-md text-sm"
                    style={{
                      background:
                        유형 === t
                          ? isDark
                            ? "rgba(123,112,238,0.25)"
                            : "rgba(123,112,238,0.15)"
                          : isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(26,28,51,0.03)",
                      border: `1px solid ${T.border}`,
                      color: 유형 === t ? (isDark ? "#bcb3ff" : "#5b50d6") : T.text.secondary,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: T.text.muted }}>
              내용
            </label>
            <textarea
              value={내용}
              onChange={(e) => set내용(e.target.value)}
              rows={5}
              placeholder="히스토리 내용을 입력하세요"
              className="w-full px-2.5 py-2 rounded-md text-sm outline-none resize-y"
              style={inputStyle}
            />
          </div>
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
