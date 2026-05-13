import { Suspense } from "react";
import { getSalesData } from "@/lib/sheets";
import Dashboard from "@/components/Dashboard";

export const revalidate = 3600;

export default async function Page() {
  const rows = await getSalesData();
  return (
    // useSearchParams()는 반드시 Suspense 경계 안에 있어야 함
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#13141F" }} />}>
      <Dashboard rows={rows} />
    </Suspense>
  );
}
