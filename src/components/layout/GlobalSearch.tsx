"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";

type SearchHit = {
  영업활동명: string;
  그룹ID: string;
  그룹명: string;
  영업단계: string;
  계약만료일: string;
};

/**
 * 상단 전역 검색바.
 * 2글자 이상 타이핑 시 /api/customers/search 호출, 결과 드롭다운 표시.
 * 클릭/Enter 시 /customers/[영업활동명] 으로 이동.
 */
export default function GlobalSearch() {
  const router = useRouter();
  const { isDark } = useTheme();
  const T = isDark ? DARK : LIGHT;

  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0); // highlight index
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // debounced fetch
  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/customers/search?q=${encodeURIComponent(q.trim())}`);
        const json = await res.json();
        if (!cancelled) {
          setHits(json.hits ?? []);
          setHi(0);
        }
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  const go = (hit: SearchHit) => {
    const key = hit.영업활동명 || hit.그룹ID || hit.그룹명;
    if (!key) return;
    router.push(`/customers/${encodeURIComponent(key)}`);
    setOpen(false);
    setQ("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hits[hi]) go(hits[hi]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const dDayLabel = (mdate: string): string => {
    if (!mdate) return "";
    const d = new Date(mdate);
    if (Number.isNaN(d.getTime())) return "";
    const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `만료`;
    return `D-${diff}`;
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2"
        style={{
          background: T.bg.card,
          border: `1px solid ${T.border}`,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text.muted} strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="고객사 검색 (그룹명·영업활동명·그룹ID)"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: T.text.primary }}
        />
        {loading && (
          <span className="text-xs" style={{ color: T.text.muted }}>
            검색 중…
          </span>
        )}
      </div>

      {open && q.trim().length >= 2 && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
          style={{
            background: T.bg.card,
            border: `1px solid ${T.border}`,
            boxShadow: isDark ? "0 6px 24px rgba(0,0,0,0.4)" : "0 6px 24px rgba(0,0,0,0.08)",
          }}
        >
          {hits.length === 0 && !loading && (
            <div className="px-3 py-3 text-sm" style={{ color: T.text.muted }}>
              결과가 없습니다
            </div>
          )}
          {hits.map((h, idx) => {
            const dday = dDayLabel(h.계약만료일);
            const active = idx === hi;
            return (
              <button
                key={`${h.영업활동명}-${idx}`}
                onMouseEnter={() => setHi(idx)}
                onClick={() => go(h)}
                className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors"
                style={{
                  background: active ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(26,28,51,0.05)") : "transparent",
                  color: T.text.primary,
                }}
              >
                <span className="flex-1 truncate text-sm">{h.영업활동명 || h.그룹명}</span>
                {h.영업단계 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: isDark ? "rgba(123,112,238,0.18)" : "rgba(123,112,238,0.12)",
                      color: isDark ? "#a59cf2" : "#5b50d6",
                    }}
                  >
                    {h.영업단계}
                  </span>
                )}
                {dday && (
                  <span
                    className="text-xs"
                    style={{
                      color:
                        dday === "만료"
                          ? "#888"
                          : Number(dday.replace("D-", "")) <= 30
                          ? "#ff6b6b"
                          : T.text.secondary,
                    }}
                  >
                    {dday}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
