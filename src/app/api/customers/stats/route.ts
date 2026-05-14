import { NextResponse } from "next/server";
import { getCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await getCustomers();
    const now = Date.now();
    let upcoming = 0;
    for (const c of customers) {
      if (!c.계약만료일) continue;
      const t = new Date(c.계약만료일).getTime();
      if (!Number.isFinite(t)) continue;
      const diff = Math.ceil((t - now) / 86_400_000);
      if (diff >= 0 && diff <= 30) upcoming += 1;
    }
    return NextResponse.json({ total: customers.length, upcoming });
  } catch (err) {
    console.error("[api/customers/stats] failed", err);
    return NextResponse.json({ total: 0, upcoming: 0, error: "stats failed" }, { status: 500 });
  }
}
