import { Suspense } from "react";
import { getSalesData } from "@/lib/sheets";
import ThemeWrapper from "@/components/ThemeWrapper";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await getSalesData();
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#13141F" }} />}>
      <ThemeWrapper rows={rows} />
    </Suspense>
  );
}
