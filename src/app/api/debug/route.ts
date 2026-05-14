import { NextResponse } from "next/server";
import { listSheetTabs, hasGoogleEnv } from "@/lib/google";

/** 배포 환경 진단 — 탭 이름 확인 및 env 체크 */
export async function GET() {
  const envCheck = {
    GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
    PRIVATE_KEY_LENGTH: process.env.GOOGLE_PRIVATE_KEY?.length ?? 0,
    PRIVATE_KEY_HAS_NEWLINE: process.env.GOOGLE_PRIVATE_KEY?.includes("\n") ?? false,
    PRIVATE_KEY_HAS_ESCAPED_N: process.env.GOOGLE_PRIVATE_KEY?.includes("\\n") ?? false,
    hasGoogleEnv: hasGoogleEnv(),
  };

  if (!envCheck.hasGoogleEnv) {
    return NextResponse.json({ ok: false, envCheck, tabs: null });
  }

  try {
    const tabs = await listSheetTabs();
    return NextResponse.json({ ok: true, envCheck, tabs });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      envCheck,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
