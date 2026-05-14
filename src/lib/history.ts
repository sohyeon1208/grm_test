import { hasGoogleEnv, readRange, appendRow } from "@/lib/google";

/**
 * 히스토리 데이터.
 * 두 탭을 합쳐서 사용:
 *   - "📂 히스토리 전체"  (기존 데이터)
 *   - "히스토리 입력"      (append 대상)
 *
 * 헤더 행(1행)을 읽어서 컬럼 위치를 동적으로 탐지하므로
 * 시트 컬럼 순서가 달라도 동작한다.
 */

export const HISTORY_ARCHIVE_SHEET = "📂 히스토리 전체";
export const HISTORY_INPUT_SHEET = "히스토리 입력";

export type HistoryEntry = {
  rowIndex: number;
  source: "archive" | "input";
  날짜: string;
  유형: string;
  영업활동명: string;
  그룹ID: string;
  영업단계: string;
  내용: string;
};

const s = (v: unknown): string => (v == null ? "" : String(v));

/** 헤더 배열에서 후보 이름 중 하나와 일치하는 컬럼 인덱스를 반환. 없으면 -1. */
function colIdx(header: string[], candidates: string[]): number {
  const norm = (h: string) => h.replace(/\s+/g, "").toLowerCase();
  for (const c of candidates) {
    const i = header.findIndex((h) => norm(h) === norm(c));
    if (i >= 0) return i;
  }
  return -1;
}

/** 날짜 문자열을 ISO(YYYY-MM-DD) 형태로 정규화 (정렬 비교용). */
function normDate(d: string): string {
  if (!d) return "";
  const m = d.match(/(\d{4})[년.\-\/]?\s*(\d{1,2})[월.\-\/]?\s*(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return d;
}

async function readSheetDynamic(
  sheetName: string,
  source: "archive" | "input"
): Promise<HistoryEntry[]> {
  try {
    // A1부터 읽어서 1행을 헤더로 사용, 2행~가 실제 데이터
    const allRows = await readRange(`${sheetName}!A1:G`);
    if (allRows.length < 2) return [];

    const header = allRows[0].map((h) => s(h));
    const dataRows = allRows.slice(1);

    // 헤더에서 각 컬럼 위치 탐지 (못 찾으면 HANDOFF 기준 고정 인덱스 사용)
    const iDate    = colIdx(header, ["날짜", "date"]);
    const iType    = colIdx(header, ["유형", "type"]);
    const iName    = colIdx(header, ["영업활동명", "영업 활동명", "활동명"]);
    const iGroupId = colIdx(header, ["그룹id", "그룹 id", "그룹아이디", "groupid"]);
    const iStage   = colIdx(header, ["영업단계", "영업 단계", "단계"]);
    const iContent = colIdx(header, ["내용", "히스토리내용", "히스토리 내용", "content"]);

    const get = (row: string[], dynamic: number, fallback: number): string =>
      s(row[dynamic >= 0 ? dynamic : fallback]);

    return dataRows
      .map((row, idx) => ({
        rowIndex: idx + 2, // 헤더가 1행 → 데이터는 2행부터
        source,
        날짜:      get(row, iDate,    0),
        유형:      get(row, iType,    1),
        영업활동명: get(row, iName,    2),
        그룹ID:    get(row, iGroupId, 3),
        영업단계:  get(row, iStage,   4),
        내용:      get(row, iContent, 5),
      }))
      .filter((e) => e.날짜 || e.내용 || e.영업활동명);
  } catch (err) {
    console.error(`[history.readSheet] failed for "${sheetName}"`, err);
    return [];
  }
}

/** 두 탭의 모든 히스토리 — 최신 날짜 먼저 (내림차순) */
export async function getHistory(): Promise<HistoryEntry[]> {
  if (!hasGoogleEnv()) return [];
  const [archive, input] = await Promise.all([
    readSheetDynamic(HISTORY_ARCHIVE_SHEET, "archive"),
    readSheetDynamic(HISTORY_INPUT_SHEET, "input"),
  ]);
  const all = [...archive, ...input];
  return all.sort((a, b) => normDate(b.날짜).localeCompare(normDate(a.날짜)));
}

/**
 * 특정 고객의 히스토리.
 * 1순위: 영업활동명 정확일치 (공백 정규화 포함)
 * 2순위: 그룹ID 정확일치
 * 3순위: 영업활동명 부분일치 (2자 이상)
 */
export async function getHistoryFor(
  영업활동명: string,
  options?: { 그룹ID?: string }
): Promise<HistoryEntry[]> {
  const all = await getHistory();
  const norm = (s: string) => s.trim().replace(/\s+/g, " ");
  const key = norm(영업활동명);

  const exact = all.filter((e) => norm(e.영업활동명) === key);
  if (exact.length > 0) return exact;

  if (options?.그룹ID) {
    const gid = options.그룹ID.trim();
    const byId = all.filter((e) => e.그룹ID.trim() === gid);
    if (byId.length > 0) return byId;
  }

  if (key.length >= 2) {
    return all.filter(
      (e) => norm(e.영업활동명).includes(key) || key.includes(norm(e.영업활동명))
    );
  }

  return [];
}

/** 새 히스토리 추가 — "히스토리 입력" 탭에 append */
export async function addHistory(entry: {
  날짜: string;
  유형: string;
  영업활동명: string;
  그룹ID?: string;
  영업단계?: string;
  내용: string;
}): Promise<void> {
  await appendRow(`${HISTORY_INPUT_SHEET}!A:F`, [
    entry.날짜,
    entry.유형,
    entry.영업활동명,
    entry.그룹ID ?? "",
    entry.영업단계 ?? "",
    entry.내용,
  ]);
}
