#!/usr/bin/env node
/**
 * 구글 시트의 탭 이름 확인용 헬퍼.
 *
 * 사용:
 *   node scripts/list-sheets.mjs
 *
 * .env.local의 GOOGLE_SHEET_ID / GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY 를 읽어
 * 시트의 전체 탭 목록을 출력합니다.
 *
 * src/lib/customers.ts, history.ts 의 SHEET_NAME 상수와 일치하는지 확인하세요.
 */
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(".env.local 파일이 없습니다. 프로젝트 루트에서 실행해주세요.");
  process.exit(1);
}

const env = fs.readFileSync(envPath, "utf-8");
const envMap = {};
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) envMap[m[1]] = m[2].replace(/^"|"$/g, "");
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: envMap.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: (envMap.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

try {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: envMap.GOOGLE_SHEET_ID });
  console.log("[탭 목록]");
  for (const s of meta.data.sheets ?? []) {
    const p = s.properties ?? {};
    const g = p.gridProperties ?? {};
    console.log(
      `  ${String(p.index).padStart(2, " ")}. "${p.title}"  ` +
        `(rows=${g.rowCount}, cols=${g.columnCount}, sheetId=${p.sheetId})`
    );
  }
  console.log("\n→ src/lib/customers.ts, history.ts 의 SHEET_NAME 상수가 위 목록 중 하나와 일치하는지 확인하세요.");
} catch (e) {
  console.error("실패:", e.message);
  process.exit(1);
}
