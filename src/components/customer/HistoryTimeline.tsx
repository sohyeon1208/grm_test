"use client";

import { useState } from "react";
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

/** 히스토리 타임라인 — 날짜 내림차순, 유형별 색상/아이콘 + 인라인 추가. */
export default function HistoryTimeline({ entries, 영업활동명, 그룹ID, 영업단계 }: Props) {
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);

  const iconFor = (유형: string) => {
    if (유형.includes("댓글")) return { emoji: "🗨", color: isDark ? "#9aa0b4" : "#5b6478" };
    return { emoji: "📌", color: isDark ? "#7B70EE" : "#5b50d6" };
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
                const isLong = (e.내용 ?? "").length > 200;
                const uid = `${e.source}-${e.rowIndex}`;
                const open = !!expanded[uid];
                const display = isLong && !open ? (e.내용 ?? "").slice(0, 200) + "…" : e.내용;
                return (
                  <li
                    key={uid}
                    className="flex gap-2 py-2 px-3 rounded-md"
                    style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(26,28,51,0.025)" }}
                  >
                    <span style={{ color: ic.color }} className="text-sm leading-none mt-1">
                      {ic.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
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
