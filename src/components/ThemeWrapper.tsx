"use client";

import type { SalesRow } from "@/lib/sheets";
import Dashboard from "./Dashboard";
import DashboardLight from "./DashboardLight";
import { useTheme } from "./layout/ThemeContext";

/**
 * 전역 ThemeContext의 isDark에 따라 다크/라이트 대시보드 전환.
 * 토글 버튼은 사이드바(Sidebar)에 통합되어 있으므로 여기엔 없음.
 */
export default function ThemeWrapper({ rows }: { rows: SalesRow[] }) {
  const { isDark, mounted } = useTheme();

  if (!mounted) {
    return <div className="min-h-screen" style={{ background: "#F0F2F8" }} />;
  }

  return isDark ? <Dashboard rows={rows} /> : <DashboardLight rows={rows} />;
}
