/**
 * 서비스 분류 규칙:
 *  - 계약항목(N컬럼)이 직접 입력되어 있으면 그 값을 우선 사용
 *  - 비어있으면 그룹유형 + 영업활동명으로 자동 추론:
 *      V숫자 (V1/V2/V3…)      → 구루미비즈
 *      "올리고" 포함           → 올리고
 *      "LMS"/"유지보수"/"운영계약" → 솔루션
 *      "인프라" 포함           → 인프라
 *      그 외 (이름 있으면)     → 기타프로젝트
 */

export const SERVICE_OPTIONS = [
  "구루미비즈",
  "올리고",
  "솔루션",
  "인프라",
  "기타프로젝트",
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

export function deriveContractItem(args: {
  계약항목: string;
  그룹유형: string;
  영업활동명?: string;
}): string {
  const v = (args.계약항목 || "").trim();
  if (v) return v;

  const type = (args.그룹유형 || "").trim().toUpperCase();
  const name = (args.영업활동명 || "").trim();
  const haystack = (name + " " + args.그룹유형).toLowerCase();

  if (/^V\d+$/.test(type)) return "구루미비즈";
  if (haystack.includes("올리고")) return "올리고";
  if (name.includes("LMS") || haystack.includes("유지보수") || haystack.includes("운영계약"))
    return "솔루션";
  if (haystack.includes("인프라")) return "인프라";
  if (name) return "기타프로젝트";

  return "";
}
