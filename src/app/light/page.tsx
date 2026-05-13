import { Suspense } from "react";
import { getSalesData } from "@/lib/sheets";
import DashboardLight from "@/components/DashboardLight";

export const dynamic = "force-dynamic";

export default async function LightPage() {
  const rows = await getSalesData();
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#F0F2F8" }} />}>
      <DashboardLight rows={rows} />
    </Suspense>
  );
}
