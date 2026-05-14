/**
 * 계약항목 자동 추론.
 *  - 시트에 입력된 값(c.계약항목)이 있으면 그대로 사용.
 *  - 비어 있으면 그룹유형으로 추론:
 *      V1, V2, V3, V4... → "구루미Biz"
 *      "올리고"          → "올리고"
 *      그 외             → ""
 */
export function deriveContractItem(args: {
  계약항목: string;
  그룹유형: string;
}): string {
  const v = (args.계약항목 || "").trim();
  if (v) return v;

  const type = (args.그룹유형 || "").trim().toUpperCase();
  if (/^V\d+$/.test(type)) return "구루미Biz";
  if (args.그룹유형.includes("올리고")) return "올리고";
  return "";
}
