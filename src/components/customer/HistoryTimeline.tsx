"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import type { HistoryEntry } from "@/lib/history";
import AddHistoryModal from "./AddHistoryModal";

type Props = {
  entries: HistoryEntry[];
  영업활동명: string;
  그룹ID: string;
  영업단계: string;
};

type EditState = {
  uid: string;
  날짜: string;
  유형: string;
  내용: string;
};

/** 히스토리 타임라인 — 날짜 내림차순, 유형별 색상/아이콘 + 인라인 추가/수정/삭제. */
export default function HistoryTimeline({ entries, 영업활동명, 그룹ID, 영업단계 }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const router = useRouter();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // uid

  const iconFor = (유형: string) => {
    if (유형.includes("댓글")) return { emoji: "🗨", color: isDark ? "#9aa0b4" : "#5b6478" };
    return { emoji: "📌", color: isDark ? "#7B70EE" : "#5b50d6" };
  };

  const parseContent = (raw: string): { body: string; author: string | null } => {
    const marker = "\n\n✍ 작성: ";
    const idx = raw.lastIndexOf(marker);
    if (idx >= 0) return { body: raw.slice(0, idx), author: raw.slice(idx + marker.length) };
    return { body: raw, author: null };
  };

  // 월 단위 그룹핑
  const groups: { key: string; label: string; items: HistoryEntry[] }[] = [];
  for (const e of entries) {
    const ym = (e.날짜 || "").slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === ym) {
      last.items.push(e);
    } else {
      groups.push({
        key: ym,
        label: ym ? `${ym.slice(0, 4)}년 ${parseInt(ym.slice(5, 7), 10)}월` : "날짜 없음",
        items: [e],
      });
    }
  }

  const startEdit = (e: HistoryEntry, uid: string) => {
    const { body } = parseContent(e.내용 ?? "");
    setEditing({ uid, 날짜: e.날짜, 유형: e.유형, 내용: body });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async (e: HistoryEntry) => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/history/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: e.source,
          rowIndex: e.rowIndex,
          날짜: editing.날짜,
          유형: editing.유형,
          내용: editing.내용,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setEditing(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async (e: HistoryEntry) => {
    setSaving(true);
    try {
      await fetch("/api/history/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: e.source, rowIndex: e.rowIndex }),
      });
      setConfirmDelete(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const btnBase = {
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "2px",
  };

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(26,28,51,0.04)",
    border: `1px solid ${T.border}`,
    color: T.text.primary,
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "0.8125rem",
    width: "100%",
    outline: "none",
  };

  return (
    <section
      className="rounded-lg p-5"
      style={{ background: T.bg.card, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: T.text.primary }}>
          📜 히스토리
          <span className="ml-2 text-xs font-normal" style={{ color: T.text.muted }}>
            총 {entries.length}건
          </span>
        </h3>
        <button
          onClick={() => setModalOpen(true)}
          className="text-xs px-2.5 py-1 rounded font-medium"
          style={{
            background: isDark ? "rgba(123,112,238,0.2)" : "rgba(123,112,238,0.12)",
            color: isDark ? "#bcb3ff" : "#5b50d6",
          }}
        >
          + 추가
        </button>
      </div>

      {entries.length === 0 && (
        <div className="text-sm py-6 text-center" style={{ color: T.text.muted }}>
          기록된 히스토리가 없습니다
        </div>
      )}

      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.key}>
            <div
              className="text-xs font-medium mb-2 sticky top-0"
              style={{ color: T.text.muted, background: T.bg.card, padding: "2px 0" }}
            >
              {g.label}
            </div>
            <ul className="space-y-2">
              {g.items.map((e) => {
                const ic = iconFor(e.유형);
                const { body, author } = parseContent(e.내용 ?? "");
                const isLong = body.length > 200;
                const uid = `${e.source}-${e.rowIndex}`;
                const open = !!expanded[uid];
                const display = isLong && !open ? body.slice(0, 200) + "…" : body;
                const isEditingThis = editing?.uid === uid;
                const isConfirmingDelete = confirmDelete === uid;

                return (
                  <li
                    key={uid}
                    className="flex gap-2 py-2 px-3 rounded-md"
                    style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(26,28,51,0.025)" }}
                  >
                    <span style={{ color: ic.color }} className="text-sm leading-none mt-1 shrink-0">
                      {ic.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      {isEditingThis && editing ? (
                        /* ── 인라인 수정 폼 ── */
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={editing.날짜}
                              onChange={(ev) => setEditing({ ...editing, 날짜: ev.target.value })}
                              style={{ ...inputStyle, width: "auto", flex: "0 0 auto" }}
                            />
                            {["게시물", "댓글"].map((t) => (
                              <button
                                key={t}
                                onClick={() => setEditing({ ...editing, 유형: t })}
                                style={{
                                  ...btnBase,
                                  background:
                                    editing.유형 === t
                                      ? isDark ? "rgba(123,112,238,0.25)" : "rgba(123,112,238,0.15)"
                                      : isDark ? "rgba(255,255,255,0.04)" : "rgba(26,28,51,0.03)",
                                  border: `1px solid ${T.border}`,
                                  color: editing.유형 === t ? (isDark ? "#bcb3ff" : "#5b50d6") : T.text.secondary,
                                  padding: "2px 10px",
                                }}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editing.내용}
                            onChange={(ev) => setEditing({ ...editing, 내용: ev.target.value })}
                            rows={4}
                            className="resize-y"
                            style={inputStyle}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(e)}
                              disabled={saving}
                              className="text-xs px-3 py-1 rounded"
                              style={{
                                background: "rgba(99,102,241,0.15)",
                                color: "#818cf8",
                                border: "1px solid rgba(99,102,241,0.3)",
                                cursor: saving ? "not-allowed" : "pointer",
                                opacity: saving ? 0.6 : 1,
                              }}
                            >
                              {saving ? "저장 중…" : "💾 저장"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="text-xs px-3 py-1 rounded"
                              style={{ color: T.text.muted, border: `1px solid ${T.border}`, cursor: "pointer" }}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── 읽기 모드 ── */
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs" style={{ color: T.text.secondary }}>
                              {e.날짜}
                            </span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(26,28,51,0.05)",
                                color: T.text.muted,
                              }}
                            >
                              {e.유형}
                            </span>
                            {author && (
                              <span className="text-[10px]" style={{ color: T.text.muted }}>
                                ✍ {author}
                              </span>
                            )}
                            {/* 액션 버튼 */}
                            <div className="ml-auto flex gap-1 shrink-0">
                              {isConfirmingDelete ? (
                                <>
                                  <button
                                    onClick={() => doDelete(e)}
                                    disabled={saving}
                                    style={{ ...btnBase, color: "#ff6b6b", background: "rgba(255,107,107,0.12)" }}
                                  >
                                    삭제 확인
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    style={{ ...btnBase, color: T.text.muted }}
                                  >
                                    취소
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(e, uid)}
                                    title="수정"
                                    style={{ ...btnBase, color: T.text.muted }}
                                    onMouseEnter={(ev) => (ev.currentTarget.style.color = isDark ? "#a5b4fc" : "#5b50d6")}
                                    onMouseLeave={(ev) => (ev.currentTarget.style.color = T.text.muted)}
                                  >
                                    {/* 연필 아이콘 */}
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(uid)}
                                    title="삭제"
                                    style={{ ...btnBase, color: T.text.muted }}
                                    onMouseEnter={(ev) => (ev.currentTarget.style.color = "#ff6b6b")}
                                    onMouseLeave={(ev) => (ev.currentTarget.style.color = T.text.muted)}
                                  >
                                    {/* 휴지통 아이콘 */}
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                      <path d="M10 11v6M14 11v6" />
                                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div
                            className="text-sm whitespace-pre-wrap break-words"
                            style={{ color: T.text.primary }}
                          >
                            {display}
                          </div>
                          {isLong && (
                            <button
                              onClick={() => setExpanded((st) => ({ ...st, [uid]: !st[uid] }))}
                              className="mt-1 text-xs"
                              style={{ color: isDark ? "#bcb3ff" : "#5b50d6" }}
                            >
                              {open ? "접기" : "더보기"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <AddHistoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        영업활동명={영업활동명}
        그룹ID={그룹ID}
        영업단계={영업단계}
      />
    </section>
  );
}
