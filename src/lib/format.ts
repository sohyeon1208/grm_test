export function formatKRW(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 100_000_000) {
    return `${sign}${(abs / 100_000_000).toFixed(1)}억원`;
  }
  if (abs >= 10_000_000) {
    return `${sign}${(abs / 10_000_000).toFixed(1)}천만원`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}백만원`;
  }
  return `${sign}${abs.toLocaleString("ko-KR")}원`;
}

export function formatKRWShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 100_000_000) {
    return `${sign}${(abs / 100_000_000).toFixed(1)}억`;
  }
  if (abs >= 10_000_000) {
    return `${sign}${(abs / 10_000_000).toFixed(1)}천만`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}백만`;
  }
  return `${sign}${abs.toLocaleString("ko-KR")}`;
}

export const 사업부문_COLORS: Record<string, string> = {
  구루미비즈: "#abe4ff",
  올리고: "#2962ff",
  솔루션: "#ffd270",
  캠스터디: "#fcd2f8",
  인프라: "#00CFAA",
  기타프로젝트: "#4A9EFF",
};

export const 서비스_COLORS: string[] = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];
