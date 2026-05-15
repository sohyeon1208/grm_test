"use client";

import { Suspense } from "react";
import { useTheme } from "./ThemeContext";
import { DARK, LIGHT } from "@/lib/theme";
import Sidebar from "./Sidebar";
import GlobalSearch from "./GlobalSearch";

type UserInfo = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: UserInfo;
}) {
  const { isDark, mounted } = useTheme();
  const T = isDark ? DARK : LIGHT;

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
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 flex flex-col">
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
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
