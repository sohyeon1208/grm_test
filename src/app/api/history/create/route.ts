import { NextRequest, NextResponse } from "next/server";
import { addHistory } from "@/lib/history";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const 날짜 = String(body.날짜 ?? "").trim();
    const 유형 = String(body.유형 ?? "").trim();
    const 영업활동명 = String(body.영업활동명 ?? "").trim();
    const 내용 = String(body.내용 ?? "").trim();

    if (!날짜 || !유형 || !영업활동명 || !내용) {
      return NextResponse.json(
        { ok: false, reason: "날짜·유형·영업활동명·내용은 필수입니다" },
        { status: 400 }
      );
    }

    await addHistory({
      날짜,
      유형,
      영업활동명,
      그룹ID: String(body.그룹ID ?? "").trim(),
      영업단계: String(body.영업단계 ?? "").trim(),
      내용,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/history/create] failed", err);
    return NextResponse.json({ ok: false, reason: "서버 오류" }, { status: 500 });
  }
}
