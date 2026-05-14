import { google, sheets_v4 } from "googleapis";

/**
 * Google Sheets 인증 + 클라이언트 공용 모듈.
 *
 * 환경변수:
 *   GOOGLE_SHEET_ID
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_PRIVATE_KEY  (개행은 \n 그대로 두면 됨)
 */

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]; // 읽기+쓰기

function parsePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  // Vercel 환경변수는 실제 개행(\n) 또는 이스케이프된 \n 두 가지로 저장될 수 있음.
  // 이미 실제 개행이 있으면 replace가 무해하게 통과하고,
  // \n 두 글자로 저장된 경우 실제 개행으로 변환.
  return raw.replace(/\\n/g, "\n");
}

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
    },
    scopes: SCOPES,
  });
}

/** sheets v4 클라이언트 — Vercel 서버리스에서 stale auth 방지를 위해 캐시 없이 생성 */
export function getSheetsClient(): sheets_v4.Sheets {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID env is not set");
  return id;
}

/** 필요한 환경변수가 모두 세팅됐는지 */
export function hasGoogleEnv(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  );
}

/**
 * 시트 메타데이터에서 모든 탭의 (title, sheetId) 목록 조회.
 * 개발 중 탭 이름이 헷갈릴 때 디버깅용으로 사용.
 */
export async function listSheetTabs(): Promise<
  { index: number; title: string; sheetId: number; rowCount: number; columnCount: number }[]
> {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: getSheetId() });
  return (meta.data.sheets ?? []).map((s) => {
    const p = s.properties!;
    const g = p.gridProperties ?? {};
    return {
      index: p.index ?? 0,
      title: p.title ?? "",
      sheetId: p.sheetId ?? 0,
      rowCount: g.rowCount ?? 0,
      columnCount: g.columnCount ?? 0,
    };
  });
}

/** 한 탭 전체를 2차원 배열로 가져온다. */
export async function readRange(range: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range,
  });
  return (res.data.values ?? []) as string[][];
}

/** 새 행을 시트 맨 아래에 append. values는 사용자 입력으로 처리(USER_ENTERED). */
export async function appendRow(range: string, values: (string | number)[]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

/** 특정 셀 범위 업데이트. */
export async function updateRange(
  range: string,
  values: (string | number)[][]
): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}
