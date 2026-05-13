import { google } from "googleapis";

// 실제 시트 컬럼 구조 (A~K)
// A:번호 B:날짜 C:연도 D:월 E:고객사 F:서비스 G:서비스분류 H:공급가액 I:부가세포함 J:입금확인 K:사업부문
export type SalesRow = {
  연도: number;
  월: number;
  거래처: string;    // E열: 고객사
  서비스: string;    // F열: 서비스
  서비스분류: string; // G열: 서비스분류
  매출액: number;    // H열: 공급가액(원)
  사업부문: string;  // K열: 사업부문
};

const SHEET_NAME = "📋 마스터데이터";
const START_ROW = 2;

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function toNumber(value: string | undefined | null): number {
  if (!value) return 0;
  return Number(value.replace(/,/g, "")) || 0;
}

export async function getSalesData(): Promise<SalesRow[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!A${START_ROW}:K`, // K열(사업부문)까지
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row) => row[2]) // C열(연도)이 있는 행만
    .map((row) => ({
      연도: toNumber(row[2]),    // C: 연도
      월: toNumber(row[3]),      // D: 월
      거래처: row[4] ?? "",      // E: 고객사
      서비스: row[5] ?? "",      // F: 서비스
      서비스분류: row[6] ?? "",  // G: 서비스분류
      매출액: toNumber(row[7]),  // H: 공급가액(원)
      사업부문: row[10] ?? "",   // K: 사업부문
    }));
}
