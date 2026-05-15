import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeContext";
import AppShell from "@/components/layout/AppShell";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Gooroomee — Sales + CRM",
  description: "Gooroomee Sales Dashboard + CRM",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          {session ? (
            <AppShell user={session.user}>{children}</AppShell>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
