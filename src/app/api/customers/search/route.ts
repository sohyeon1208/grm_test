import { NextRequest, NextResponse } from "next/server";
import { searchCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ hits: [] });

  try {
    const list = await searchCustomers(q, 10);
    const hits = list.map((c) => ({
      영업활동명: c.영업활동명,
      그룹ID: c.그룹ID,
      그룹명: c.그룹명,
      영업단계: c.영업단계,
      계약만료일: c.계약만료일,
    }));
    return NextResponse.json({ hits });
  } catch (err) {
    console.error("[api/customers/search] failed", err);
    return NextResponse.json({ hits: [], error: "search failed" }, { status: 500 });
  }
}
