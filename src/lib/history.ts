import { hasGoogleEnv, readRange, appendRow } from "@/lib/google";

/**
 * 히스토리 데이터.
 *
 * 두 탭을 합쳐서 사용:
 *   - "📂 히스토리 전체"  (기존 데이터)
 *   - "히스토리 입력"      (이후 추가, append 대상)
 *
 * 컬럼 구조 (6컬럼, 두 탭 동일):
 *  A 날짜
 *  B 유형 (게시물 / 댓글)
 *  C 영업활동명     ← 식별 1순위
 *  D 그룹 ID
 *  E 영업 단계
 *  F 히스토리 내용
 */

export const HISTORY_ARCHIVE_SHEET = "📂 히스토리 전체";
export const HISTORY_INPUT_SHEET = "히스토리 입력";
const DATA_START_ROW = 2;

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

function rowToEntry(
  row: string[],
  rowIndex: number,
  source: "archive" | "input"
): HistoryEntry {
  return {
    rowIndex,
    source,
    날짜: s(row[0]),
    유형: s(row[1]),
    영업활동명: s(row[2]),
    그룹ID: s(row[3]),
    영업단계: s(row[4]),
    내용: s(row[5]),
  };
}

async function readSheet(
  sheetName: string,
  source: "archive" | "input"
): Promise<HistoryEntry[]> {
  try {
    const rows = await readRange(`${sheetName}!A${DATA_START_ROW}:F`);
    return rows
      .map((row, idx) => rowToEntry(row, DATA_START_ROW + idx, source))
      .filter((e) => e.날짜 || e.내용 || e.영업활동명);
  } catch (err) {
    console.error(`[history.readSheet] failed for ${sheetName}`, err);
    return [];
  }
}

/** 두 탭의 모든 히스토리 (날짜 내림차순) */
export async function getHistory(): Promise<HistoryEntry[]> {
  if (!hasGoogleEnv()) return [];
  const [archive, input] = await Promise.all([
    readSheet(HISTORY_ARCHIVE_SHEET, "archive"),
    readSheet(HISTORY_INPUT_SHEET, "input"),
  ]);
  const all = [...archive, ...input];
  return all.sort((a, b) => (b.날짜 || "").localeCompare(a.날짜 || ""));
}

/** 특정 고객(영업활동명 기준)의 히스토리만 필터. 그룹ID 보조 매칭 지원. */
export async function getHistoryFor(
  영업활동명: string,
  options?: { 그룹ID?: string }
): Promise<HistoryEntry[]> {
  const all = await getHistory();
  return all.filter((e) => {
    if (영업활동명 && e.영업활동명 === 영업활동명) return true;
    if (options?.그룹ID && e.그룹ID && e.그룹ID === options.그룹ID) return true;
    return false;
  });
}

/** 새 히스토리 한 건 추가 — 항상 "히스토리 입력" 탭에 append. */
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
