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

/** 특정 고객의 히스토리. 영업활동명 정확일치 → 그룹ID 정확일치 → 부분일치 순으로 매칭. */
export async function getHistoryFor(
  영업활동명: string,
  options?: { 그룹ID?: string }
): Promise<HistoryEntry[]> {
  const all = await getHistory();
  const norm = (s: string) => s.trim().replace(/\s+/g, " ");
  const key = norm(영업활동명);

  // 1순위: 영업활동명 정확일치 (앞뒤 공백 + 연속 공백 정규화)
  const exact = all.filter((e) => norm(e.영업활동명) === key);
  if (exact.length > 0) return exact;

  // 2순위: 그룹ID 정확일치
  if (options?.그룹ID) {
    const gid = options.그룹ID.trim();
    const byId = all.filter((e) => e.그룹ID.trim() === gid);
    if (byId.length > 0) return byId;
  }

  // 3순위: 영업활동명 부분일치 (빈 화면 방지용, 2글자 이상일 때만)
  if (key.length >= 2) {
    return all.filter(
      (e) => norm(e.영업활동명).includes(key) || key.includes(norm(e.영업활동명))
    );
  }

  return [];
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
