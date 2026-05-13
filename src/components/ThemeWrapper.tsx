"use client";

import { useState, useEffect } from "react";
import type { SalesRow } from "@/lib/sheets";
import Dashboard from "./Dashboard";
import DashboardLight from "./DashboardLight";

export default function ThemeWrapper({ rows }: { rows: SalesRow[] }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gooroomee-theme");
    if (saved === "light") setIsDark(false);
    setMounted(true);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      localStorage.setItem("gooroomee-theme", prev ? "light" : "dark");
      return !prev;
    });
  };

  // 마운트 전에는 dark로 렌더 (깜빡임 방지)
  if (!mounted) {
    return <div className="min-h-screen" style={{ background: "#13141F" }} />;
  }

  return (
    <div className="relative">
      {isDark ? <Dashboard rows={rows} /> : <DashboardLight rows={rows} />}

      {/* 테마 토글 버튼 — 우하단 고정 */}
      <button
        onClick={toggle}
        title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: isDark ? "rgba(255,255,255,0.1)" : "rgba(26,28,51,0.1)",
          border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(26,28,51,0.15)",
          boxShadow: isDark
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.12)",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {isDark ? (
          /* 라이트 전환 아이콘: 해 */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1"  x2="12" y2="3"  />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1"  y1="12" x2="3"  y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          /* 다크 전환 아이콘: 달 */
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(26,28,51,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );
}
