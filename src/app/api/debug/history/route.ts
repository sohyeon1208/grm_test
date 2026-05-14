import { NextRequest, NextResponse } from "next/server";
import { readRange, hasGoogleEnv } from "@/lib/google";
import { HISTORY_ARCHIVE_SHEET, HISTORY_INPUT_SHEET } from "@/lib/history";

/**
 * 히스토리 탭 원본 데이터 진단.
 * 사용: /api/debug/history?key=영업활동명
 * 응답에 raw 헤더와 첫 5행 데이터가 포함됨.
 */
export async function GET(req: NextRequest) {
  if (!hasGoogleEnv()) {
    return NextResponse.json({ ok: false, reason: "Google 환경변수 미설정" });
  }

  const key = req.nextUrl.searchParams.get("key") ?? "";

  try {
    const [archiveRaw, inputRaw] = await Promise.all([
      readRange(`${HISTORY_ARCHIVE_SHEET}!A1:G`),
      readRange(`${HISTORY_INPUT_SHEET}!A1:G`),
    ]);

    const summarize = (rows: string[][], label: string) => ({
      tab: label,
      totalRows: rows.length - 1,
      header: rows[0] ?? [],
      sample: rows.slice(1, 6),
      // key가 주어지면 해당 key가 포함된 행만 필터 (디버깅용)
      matched: key
        ? rows.slice(1).filter((r) => r.some((cell) => (cell ?? "").includes(key)))
        : undefined,
    });

    return NextResponse.json({
      ok: true,
      searchKey: key || "(없음)",
      archive: summarize(archiveRaw, HISTORY_ARCHIVE_SHEET),
      input: summarize(inputRaw, HISTORY_INPUT_SHEET),
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
