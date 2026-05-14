"use client";

import { Suspense } from "react";
import { useTheme } from "./ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import Sidebar from "./Sidebar";
import GlobalSearch from "./GlobalSearch";

/**
 * 모든 페이지의 공통 셸:
 *   ┌──────────────────────────────────────────────┐
 *   │ Sidebar │ [TopBar(검색바)]                   │
 *   │         │ [페이지 콘텐츠]                     │
 *   └──────────────────────────────────────────────┘
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isDark, mounted } = useTheme();
  const T = isDark ? DARK : LIGHT;

  // 첫 마운트 전까지 다크로 깜빡임 방지
  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ background: DARK.bg.page }} />
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: T.bg.page, color: T.text.primary }}
    >
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 상단바 — 검색바 */}
        <header
          className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3"
          style={{
            background: T.bg.page,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <Suspense fallback={null}>
            <GlobalSearch />
          </Suspense>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
